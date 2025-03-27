import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import initialRootState from "../initialRootState";
import APIKit from "@/utils/APIKit";

const initialState = initialRootState.studio;

export const fetchTools = createAsyncThunk('studio/fetchTools', async () => {
  try {
    const response = await APIKit.get(`/tools`);
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const fetchAgents = createAsyncThunk('studio/fetchAgents', async () => {
  try {
    const response = await APIKit.get(`/agents`);
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const fetchModels = createAsyncThunk('studio/fetchModels', async () => {
  try {
    const response = await APIKit.get(`/models`);
    return response.data;
  } catch (error) {
    throw error;
  }
});

export const fetchDeployedNodes = createAsyncThunk('studio/agentFlows', async () => {
  try {
    const response = await APIKit.get(`/agent-flows`);
    return response.data;
  } catch (error) {
    throw error;
  }
});



const studioSlice = createSlice({
  name: "studio",
  initialState,
  reducers: {
    setTools: (state, action) => {
      state.tools = action.payload;
    },
    addTool: (state, action) => {
      state.tools.data.push(action.payload);
    },
    removeTool: (state, action) => {
      state.tools.data = state.tools.data.filter(tool => tool._id !== action.payload);
    },
    updateToolState: (state, action) => {
      const index = state.tools.data.findIndex(tool => tool._id === action.payload._id);
      if (index !== -1) {
        state.tools.data[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTools.pending, (state) => {
        state.tools.loading = true;
        state.tools.error = null;

      })
      .addCase(fetchTools.fulfilled, (state, action) => {
        state.tools.loading = false;
        state.tools.data = action.payload;
        state.tools.error = null;
      })
      .addCase(fetchTools.rejected, (state, action) => {
        state.tools.loading = false;
        state.tools.error = action.error.message;
      });

    builder
      .addCase(fetchAgents.pending, (state) => {
        state.agents.loading = true;
        state.agents.error = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.agents.loading = false;
        state.agents.data = action.payload;
        state.agents.error = null;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.agents.loading = false;
        state.agents.error = action.error.message;
      }); 

    builder
      .addCase(fetchModels.pending, (state) => {
        state.models.loading = true;
        state.models.error = null;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.models.loading = false;
        state.models.data = action.payload;
        state.models.error = null;
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.models.loading = false;
        state.models.error = action.error.message;
      });

    builder
      .addCase(fetchDeployedNodes.pending, (state) => {
        state.agentFlows.loading = true;
        state.agentFlows.error = null;
      })
      .addCase(fetchDeployedNodes.fulfilled, (state, action) => {
        state.agentFlows.loading = false;
        state.agentFlows.data = action.payload;
        state.agentFlows.error = null;
      })
      .addCase(fetchDeployedNodes.rejected, (state, action) => {
        state.agentFlows.loading = false;
        state.agentFlows.error = action.error.message;
      });
 
  }
});

export const { setTools, addTool, removeTool, updateToolState } = studioSlice.actions;
export default studioSlice.reducer;