import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
import initialRootState from "../initialRootState";
import APIKit from "@/utils/APIKit";

const initialState = initialRootState.studio.flow;


export const getFlowById = createAsyncThunk('flow/getFlowById', async (data) => {
  console.log('Fetching flow data...');
  try {
    const response = await APIKit.get(`/agent-flow/${data.id}`);
    console.log('API Response:', response.data);
    console.log('graphSpec structure:', response.data.graphSpec);
    return response.data;
  } catch (error) {
   // console.error('Error fetching flow:', error);
    if (error.response && error.response.status === 500) {
      return {};
    }
    //throw error;
  }
});

export const updateFlow = createAsyncThunk('studio/updateFlow', async (data) => {
  try {
    const response = await APIKit.put(`/agent-flow/${data.id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
});


export const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    setNodes: (state, action) => {
      state.nodes = action.payload.map(newNode => {
        const existingNode = state.nodes ? state.nodes.find(node => node.id === newNode.id) : null;
        return {
          ...newNode,
          next: existingNode?.next || newNode.next || []
        };
      });
      if (Array.isArray(state.nodes) && Array.isArray(state.edges)) {
        state.specification = generateSpecification(state.nodes, state.edges);
      } else {
        console.error("Nodes or edges are not properly initialized.");
        state.specification = {};
      }
    },
    setEdges: (state, action) => {
      state.edges = action.payload;
      state.specification = generateSpecification(state.nodes, action.payload);
    },
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === 'graph' ? 'json' : 'graph';
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    updateSpecification: (state) => {
      state.specification = generateSpecification(state.nodes, state.edges);
    },
    deleteNode: (state, action) => {
      const nodeId = action.payload;
      state.nodes = state.nodes.filter(node => node.id !== nodeId);
      state.edges = state.edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      );
      state.specification = generateSpecification(state.nodes, state.edges);
    },
    updateNodeConnections: (state, action) => {
      const { source, target } = action.payload;

      state.nodes = state.nodes.map(node => {
        if (node.id === source) {
          const nextArray = node.next || [];

          if (!nextArray.includes(target)) {
            return {
              ...node,
              next: [...nextArray, target]
            };
          }
        }
        return node;
      });
      state.specification = generateSpecification(state.nodes, state.edges);
    },
    updateNode: (state, action) => {
      const nodeId = action.payload.id;
      const updatedNode = action.payload;

      state.nodes = state.nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            ...updatedNode,
            next: node.next
          };
        }
        return node;
      });
      state.specification = generateSpecification(state.nodes, state.edges);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getFlowById.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(getFlowById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getFlowById.rejected, (state, action) => {
      state.loading = false;
      // state.error = action.error;
    });

    builder.addCase(updateFlow.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(updateFlow.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateFlow.rejected, (state, action) => {
      state.loading = false;
      // state.error = action.error;
    });
  }
});

const generateSpecification = (nodes, edges) => {
  if (!nodes.length) return null;

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    console.error("Nodes or edges are not properly initialized.");
    return {};
  }

  const specification = {
    id: `flow-${Date.now()}`,
    name: 'Flow',
    description: 'Flow created in the studio',
    type: 'flow',
    graphSpec: {
      nodes: nodes.map(node => ({
        node_id: node.id,  
        name: node.data?.name || node.name,
        type: node.data?.type || node.type,
        description: node.data?.description || node.description,
        next: node.data?.next || node.next || [],
        inputParameters: node.data?.inputParameters || node.inputParameters || [],
        outputParameters: node.data?.outputParameters || node.outputParameters || []
      })),
      edges: edges.map(edge => ({
        from: edge.source,  
        to: edge.target,    
      })),
    },
    status: 'active',
    version: '1.0.0',
    isPublic: true,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  return specification;
};

export const { setNodes, setEdges, toggleViewMode, setViewMode, updateSpecification, deleteNode, updateNodeConnections, updateNode } = flowSlice.actions;

export default flowSlice.reducer;
