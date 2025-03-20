import { createSlice } from '@reduxjs/toolkit';

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
      state.nodes = action.payload;
      state.specification = generateSpecification(action.payload, state.edges);
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
  },
});

const generateSpecification = (nodes, edges) => {
  if (!nodes.length) return null;
  
  const specification = {
    id: `flow-${Date.now()}`,
    name: 'Agent Flow',
    description: 'Flow created in the studio',
    type: 'flow',
    nodes: nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      position: node.position,
      data: node.data.spec || {}
    })),
    connections: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    })),
    status: 'active',
    version: '1.0.0',
    isPublic: true,
    createdBy: 'User'
  };
  
  return specification;
};

export const { setNodes, setEdges, toggleViewMode, setViewMode, updateSpecification } = flowSlice.actions;

export default flowSlice.reducer;
