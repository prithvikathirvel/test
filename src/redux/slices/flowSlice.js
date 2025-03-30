import { createSlice } from '@reduxjs/toolkit';
import initialRootState from "../initialRootState";
import APIKit from "@/utils/APIKit";
const initialState = initialRootState.studio;

export const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
   
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === 'graph' ? 'json' : 'graph';
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    updateSpecification: (state) => {
      //state.specification = generateSpecification(state.nodes, state.edges);
    },
    deleteNode: (state, action) => {
      const { flow, nodeId } = action.payload;
    
      state.nodes = state.nodes.filter(node => node.id !== nodeId);
      
      state.edges = state.edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      );
      state.nodes = state.nodes.map(node => ({
        ...node,
        next: node.next.filter(nextId => nextId !== nodeId)
      }));
      state.specification = generateSpecification(flow, state.nodes, state.edges);
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
      //state.specification = generateSpecification(state.nodes, state.edges);
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
     // state.specification = generateSpecification(state.nodes, state.edges);
    },
  }
});

// const generateSpecification = (flow, nodes, edges) => {
//   if (!nodes.length) return null;

//   if (!Array.isArray(nodes) || !Array.isArray(edges)) {
//     return {};
//   }
//   const specification = {
//   ...flow, 
//   graphSpec: {
//     nodes: nodes.map(node => ({
//       node_id: node.id,  
//       name: node.data?.name || node.name,
//       type: node.data?.type || node.type,
//       description: node.data?.description || node.description,
//       next: node.data?.next || node.next || [],
//       inputParameters: node.data?.inputParameters || node.inputParameters || [],
//       outputParameters: node.data?.outputParameters || node.outputParameters || []
//     })),
//     edges: edges.map(edge => ({
//       from: edge.source,  
//       to: edge.target,    
//     })),
//   }
//   };

//   return specification;
// };

export const { setNodes, setEdges, toggleViewMode, setViewMode, updateSpecification, deleteNode, updateNodeConnections, updateNode } = flowSlice.actions;

export default flowSlice.reducer;
