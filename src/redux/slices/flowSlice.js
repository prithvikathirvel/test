import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  nodes: [],
  edges: [],
  viewMode: 'graph',
  specification: null,
  loading: false,
  error: null
};



export const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    setNodes: (state, action) => {
      state.nodes = action.payload.map(newNode => {
        const existingNode = state.nodes.find(node => node.id === newNode.id);
        return {
          ...newNode,
          next: existingNode?.next || newNode.next || []
        };
      });
      state.specification = generateSpecification(state.nodes, state.edges);
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
  }
});

const generateSpecification = (nodes, edges) => {
  if (!nodes.length) return null;

  const specification = {
    id: `flow-${Date.now()}`,
    name: 'Flow-1',
    description: 'Flow created in the studio',
    type: 'flow',
    nodes: nodes.map(node => ({
      node_id: node.id,
      name: node.name,
      type: node.type,
      description: node.description,
      next: node.next
    })),
    edges: edges.map(edge => ({
      from: edge.source,
      to: edge.target,
    })),
    // status: 'active',
    // version: '1.0.0',
    // isPublic: true,
    // createdBy: 'User'
  };

  return specification;
};

export const { setNodes, setEdges, toggleViewMode, setViewMode, updateSpecification, deleteNode, updateNodeConnections, updateNode } = flowSlice.actions;

export default flowSlice.reducer;
