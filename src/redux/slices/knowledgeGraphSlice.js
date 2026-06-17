import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE = (process.env.NEXT_PUBLIC_CMDB_API_URL || 'http://1.6.37.35/cmdb').replace(/\/$/, '');

const getAuthToken = () => {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
};

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async thunks
export const fetchConnections = createAsyncThunk(
  'knowledgeGraph/fetchConnections',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/neo4j/connections`, { headers: authHeaders() });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return rejectWithValue(body.error || `Failed to load connections (${res.status})`);
      }
      const data = await res.json();
      return Array.isArray(data.connections || data) ? (data.connections || data) : [];
    } catch {
      return rejectWithValue('Network error — could not load connections');
    }
  }
);

export const addConnection = createAsyncThunk(
  'knowledgeGraph/addConnection',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/neo4j/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return rejectWithValue(body.error || `Connection failed (${res.status})`);
      }
      const data = await res.json();
      return data.connection;
    } catch {
      return rejectWithValue('Network error — could not reach the server.');
    }
  }
);

export const removeConnection = createAsyncThunk(
  'knowledgeGraph/removeConnection',
  async (connectionId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/neo4j/connections/${connectionId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return rejectWithValue(body.error || 'Failed to disconnect');
      }
      return connectionId;
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

export const checkConnectionHealth = createAsyncThunk(
  'knowledgeGraph/checkConnectionHealth',
  async (connectionId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/neo4j/connections/${connectionId}/health`, { headers: authHeaders() });
      return { id: connectionId, healthy: res.ok };
    } catch {
      return { id: connectionId, healthy: false };
    }
  }
);

export const checkServerHealth = createAsyncThunk(
  'knowledgeGraph/checkServerHealth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/health`, { headers: authHeaders() });
      const data = await res.json();
      return data.status === 'healthy' ? 'healthy' : 'unhealthy';
    } catch {
      return 'unhealthy';
    }
  }
);

export const fetchGraphs = createAsyncThunk(
  'knowledgeGraph/fetchGraphs',
  async (_, { rejectWithValue }) => {
    try {
      const endpoints = [`${BASE}/graphs`, `${BASE}/upload/graphs`];
      for (const ep of endpoints) {
        const res = await fetch(ep, { headers: authHeaders() });
        if (!res.ok) {
          if (res.status === 404) continue;
          const err = await res.json().catch(() => ({}));
          return rejectWithValue(err?.error || 'Failed to load graphs');
        }
        const data = await res.json();
        return normalizeGraphs(data);
      }
      return [];
    } catch {
      return rejectWithValue('Network error — could not load graphs');
    }
  }
);

export const deleteGraph = createAsyncThunk(
  'knowledgeGraph/deleteGraph',
  async (graphId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE}/graphs/${graphId}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return rejectWithValue(body.error || 'Delete failed');
      }
      return graphId;
    } catch {
      return rejectWithValue('Network error');
    }
  }
);

// Normalizers
const asArray = (value) => (Array.isArray(value) ? value : []);
const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

const normalizeGraphs = (raw) => {
  const payload = asObject(raw);
  const graphs = asArray(payload.graphs || payload.data?.graphs || payload.items || payload.data);
  return graphs.map((item) => asObject(item)).map((g, idx) => ({
    id: String(g.id || g.graph_id || g.name || `graph-${idx}`),
    graph_name: String(g.graph_name || g.name || g.dataset_name || 'Untitled Graph'),
    status: String(g.status || 'Indexed'),
    file_type: String(g.file_type || g.type || 'csv').toLowerCase(),
    node_count: Number.isFinite(Number(g.node_count)) ? Number(g.node_count) : 0,
    relationship_count: Number.isFinite(Number(g.relationship_count)) ? Number(g.relationship_count) : 0,
    created_at: g.created_at || g.createdAt || new Date().toISOString(),
  }));
};

const initialState = {
  // Connections
  connections: [],
  connectionsLoading: false,
  connectionsError: null,
  selectedConnectionId: null,
  healthStatus: {},

  // Server health
  serverHealth: 'checking',

  // Wizard state
  step: 1,
  uploadSession: null,
  sessionExpired: false,

  // Graphs listing
  graphs: [],
  graphsLoading: false,
  graphsError: null,
};

const knowledgeGraphSlice = createSlice({
  name: 'knowledgeGraph',
  initialState,
  reducers: {
    setSelectedConnection(state, action) {
      state.selectedConnectionId = action.payload;
    },
    setStep(state, action) {
      state.step = action.payload;
    },
    setUploadSession(state, action) {
      state.uploadSession = action.payload;
      state.sessionExpired = false;
    },
    clearSession(state) {
      state.uploadSession = null;
      state.step = 1;
    },
    setSessionExpired(state) {
      state.uploadSession = null;
      state.sessionExpired = true;
      state.step = 1;
    },
    resetWizard(state) {
      state.step = 1;
      state.uploadSession = null;
      state.sessionExpired = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Connections
      .addCase(fetchConnections.pending, (state) => {
        state.connectionsLoading = true;
        state.connectionsError = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.connectionsLoading = false;
        state.connections = action.payload;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.connectionsLoading = false;
        state.connectionsError = action.payload;
      })
      // Add connection
      .addCase(addConnection.fulfilled, (state, action) => {
        state.connections.push(action.payload);
        state.selectedConnectionId = action.payload.connection_id;
      })
      // Remove connection
      .addCase(removeConnection.fulfilled, (state, action) => {
        state.connections = state.connections.filter((c) => c.connection_id !== action.payload);
        if (state.selectedConnectionId === action.payload) {
          state.selectedConnectionId = null;
        }
      })
      // Health check
      .addCase(checkConnectionHealth.fulfilled, (state, action) => {
        state.healthStatus[action.payload.id] = action.payload.healthy ? 'healthy' : 'unhealthy';
      })
      // Server health
      .addCase(checkServerHealth.fulfilled, (state, action) => {
        state.serverHealth = action.payload;
      })
      // Graphs
      .addCase(fetchGraphs.pending, (state) => {
        state.graphsLoading = true;
        state.graphsError = null;
      })
      .addCase(fetchGraphs.fulfilled, (state, action) => {
        state.graphsLoading = false;
        state.graphs = action.payload;
      })
      .addCase(fetchGraphs.rejected, (state, action) => {
        state.graphsLoading = false;
        state.graphsError = action.payload;
      })
      // Delete graph
      .addCase(deleteGraph.fulfilled, (state, action) => {
        state.graphs = state.graphs.filter((g) => g.id !== action.payload);
      });
  },
});

export const {
  setSelectedConnection,
  setStep,
  setUploadSession,
  clearSession,
  setSessionExpired,
  resetWizard,
} = knowledgeGraphSlice.actions;

export default knowledgeGraphSlice.reducer;
