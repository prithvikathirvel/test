import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import initialRootState from "../initialRootState";
import APIKit from "@/utils/APIKit";
import { showToaster } from "@/utils/commonFunction";
import axios from "axios";
import { sanitizeOutput } from "@/utils/commonFunction";

const initialState = initialRootState.studio;

export const fetchTools = createAsyncThunk('studio/fetchTools', async () => {
  try {
    const response = await APIKit.get(`/tools`);
    return response.data;
  } catch (error) {
    showToaster('error', error);
    throw error;
  }
});

export const fetchAgents = createAsyncThunk('studio/fetchAgents', async () => {
  try {
    const response = await APIKit.get(`/agents`);
    return response.data;
  } catch (error) {
    showToaster('error', error);
    throw error;
  }
});

export const fetchModels = createAsyncThunk('studio/fetchModels', async () => {
  try {
    const response = await APIKit.get(`/models`);
    return response.data;
  } catch (error) {
    showToaster('error', error);
    throw error;
  }
});

export const getFlowById = createAsyncThunk('flow/getFlowById', async (data) => {
  console.log('Fetching flow data...');
  try {
    const response = await APIKit.get(`/agent-flow/${data.id}`);
    console.log('API Response:', response.data);
    console.log('graphSpec structure:', response.data.graphSpec);
    return response.data;
  } catch (error) {
    showToaster('error', error);
    if (error.response && error.response.status === 500) {
      return {};
    }
    //throw error;
  }
});

export const updateFlow = createAsyncThunk('flow/updateFlow', async (data) => {
  console.log('Updating flow data...');
  try {
    const {id,updatedData,onSuccess}=data
    console.log('Flow ID:', id);
    console.log('Updated Data:', updatedData);
    const response = await APIKit.put(`/agent-flow/${id}`, updatedData);
    showToaster('success', 'Flow updated successfully');
    onSuccess();
    return response.data;
  } catch (error) {
    showToaster('error', error);
    throw error;
  }
});


export const getAllFlows = createAsyncThunk('flow/getAllFlows', async () => {
  try {
    const response = await APIKit.get(`/agent-flows`);
    return response.data;
  } catch (error) {
    showToaster('error', error);
    throw error;
  }
});


export const saveFlow = createAsyncThunk('studio/saveFlow', async ({data, onSuccess}) => {
  try {
    console.log(data,'hey222');
    const response = await APIKit.post(`/agent-flow`, data);
    showToaster('success', 'Flow saved successfully');
    onSuccess();
    return response.data;
  } catch (error) {
    showToaster('error', error);
    throw error;
  }
});

export const runFlow = createAsyncThunk('studio/runFlow', async ({data,onSuccess}) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/execute-graph', {
        ...data
      });
      // showToaster('success', 'Flow Executed successfully');
      onSuccess();
      return response.data;
    } catch (error) {
       showToaster('error', error);
      throw error;
    }
  }
);

export const deleteFlow = createAsyncThunk('studio/deleteFlow', async ({data, onSuccess}) => {
  try {
    console.log(data,'hey222');
    const response = await APIKit.delete(`/agent-flow/${data}`);
    showToaster('success', 'Flow Deleted successfully');
    onSuccess();
    return response.data;
  } catch (error) {
    showToaster('error', error);
    throw error;
  }
}); 

export const fetchMcpTools = createAsyncThunk('studio/fetchMcpTools', async () => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/mcp/tools`);
    return response.data;
  } catch (error) {
    showToaster('error', error);
    throw error;
  }
});

const studioSlice = createSlice({
  name: "studio",
  initialState,
  reducers: {

    setNodes: (state, action) => {
      if (action.payload.type === "flow") {
        // When dropping a flow, add all its nodes
        const flowSpec = action.payload.graphSpec;
        state.nodes = [...state.nodes, ...flowSpec.nodes];
      } else {
        // Handle normal node addition
        const { nodes, flow } = action.payload;
        state.nodes = nodes?.map(newNode => {
          const existingNode = state.nodes ? state.nodes.find(node => node.id === newNode.id) : null;
          return {
            ...newNode,
            next: existingNode?.next || newNode.next || []
          };
        });
        if (Array.isArray(state.nodes) && Array.isArray(state.edges)) {
          state.specification = generateSpecification(flow, state.nodes, state.edges);
          console.log("specification inside slice",state.specification);
        } else {
          state.specification = {};
        }
      }
    },
    setEdges: (state, action) => {
      if (action.payload.type === "flow") {
        // When dropping a flow, add all its edges
        const flowSpec = action.payload.graphSpec;
        state.edges = [...state.edges, ...flowSpec.edges];
      } else {
        // Handle normal edge addition
        const { edges, flow } = action.payload;
        state.edges = edges;
        if (Array.isArray(state.nodes) && Array.isArray(state.edges)) {
          state.specification = generateSpecification(flow,state.nodes, state.edges);
        } else {
          state.specification = {};
        }
      }
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
      const { source, target, sourceHandle } = action.payload;

      state.nodes = state.nodes.map(node => {
        if (node.id === source) {
          // For decision nodes, we store the connections in a special way
          if (node.type === 'decision' || node.data?.type === 'decision') {
            const conditionType = sourceHandle === 'true' ? 'conditionMetPath' : 'conditionNotMetPath';
            return {
              ...node,
              [conditionType]: target,
              // Keep the original next array for backward compatibility
              next: [...(node.next || []), target].filter(Boolean)
            };
          } else {
            // For regular nodes, just add to the next array
            const nextArray = node.next || [];
            if (!nextArray.includes(target)) {
              return {
                ...node,
                next: [...nextArray, target]
              };
            }
          }
        }
        return node;
      });
    },
    updateNode: (state, action) => {
      const { flow, nodeId, updatedNode,parameter } = action.payload;
    
      state.nodes = state.nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [parameter]: updatedNode
            },
            next: node.next || []
          };
        }
        return node;
      });
    
      state.specification = generateSpecification(flow, state.nodes, state.edges);
      state.flow = generateSpecification(flow,state.nodes,state.edges)
    },
    updateSpecification: (state, action) => {
      state.specification = {
        ...state.specification,
        ...action.payload
      };
      state.flow = state.specification;
      // state.flow =  {
      //   ...state.specification,
      //   ...action.payload
      // };
    }, 
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTools.pending, (state) => {
        state.studioComponentLoader = true;
      })
      .addCase(fetchTools.fulfilled, (state, action) => {
        state.studioComponentLoader = false;
        state.tools = action.payload;
      })
      .addCase(fetchTools.rejected, (state) => {
        state.studioComponentLoader = false;
      });

    builder
      .addCase(fetchAgents.pending, (state) => {
        state.studioComponentLoader = true;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.studioComponentLoader = false;
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state) => {
        state.studioComponentLoader = false;
      }); 


    builder
      .addCase(fetchModels.pending, (state) => {
        state.studioComponentLoader = true;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.studioComponentLoader = false;
        state.models = action.payload;
      })
      .addCase(fetchModels.rejected, (state) => {
        state.studioComponentLoader = false;
      });


    builder
      .addCase(saveFlow.pending, (state) => {
        state.studioSaveFlowLoader = true;
      })
      .addCase(saveFlow.fulfilled, (state, action) => {
        state.studioSaveFlowLoader = false;
        // state.flow = action.payload.data;
        state.newFlowId = action.payload.data.id; 
      })
      .addCase(saveFlow.rejected, (state) => {
        state.studioSaveFlowLoader = false;
      });


      builder.addCase(getFlowById.fulfilled, (state, action) => {
        state.flow = action.payload;
        state.specification = action.payload;
        state.studioLoader = false;
      });
      builder.addCase(getFlowById.pending, (state) => {
        state.studioLoader = true;
      });
      builder.addCase(getFlowById.rejected, (state) => {
        state.studioLoader = false;
      });

      builder.addCase(updateFlow.pending, (state) => {
        state.studioUpdateFlowLoader = true;
      });
      builder.addCase(updateFlow.fulfilled, (state, action) => {
        // state.flow = action.payload;
        state.studioUpdateFlowLoader = false;
        // state.specification = action.payload;
        // state.flow = state.specification;
        console.log("flow after saving", state.flow);
      });
      builder.addCase(updateFlow.rejected, (state) => {
        state.studioUpdateFlowLoader = false;
      });
  
      
      builder.addCase(getAllFlows.pending, (state) => {
        state.getAllFlowsLoader = true;
      });
      builder.addCase(getAllFlows.fulfilled, (state, action) => {
        state.flows = action.payload;
        state.prebuiltFlows =action.payload;
        state.getAllFlowsLoader = false;
      });
      builder.addCase(getAllFlows.rejected, (state) => {
        state.getAllFlowsLoader = false;
      });

      builder.addCase(runFlow.pending, (state) => {
        state.isFlowRunning = true;
      });
      builder.addCase(runFlow.fulfilled, (state, action) => {
        state.isFlowRunning = false;
        state.flowOutput = sanitizeOutput(action.payload); 
        state.sessionId = action.payload.session_id;
        console.log("flow output", state.flowOutput)
      });
      builder.addCase(runFlow.rejected, (state, action) => {
        state.isFlowRunning = false;
      });

      builder
      .addCase(fetchMcpTools.pending, (state) => {
        state.mcpToolLoader = true;
      })
      .addCase(fetchMcpTools.fulfilled, (state, action) => {
        state.mcpToolLoader = false;
        state.mcpTools = action.payload;
      })
      .addCase(fetchMcpTools.rejected, (state) => {
        state.mcpToolLoader = false;
      });

  
  }
});


const generateSpecification = (flow, nodes, edges) => {
  if (!nodes.length) return null;

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return {};
  }

  const nodeConnections = {};
  edges.forEach(edge => {
    if (!nodeConnections[edge.source]) {
      nodeConnections[edge.source] = [];
    }
    nodeConnections[edge.source].push({
      target: edge.target,
      sourceHandle: edge.sourceHandle
    });
  });

  const specification = {
    ...flow,
    inputs: flow?.inputs || [],
    graphSpec: {
      nodes: nodes.map(node => {
        const connections = nodeConnections[node.id] || [];
        const nodeType = node.data?.type || node.type;
        const isDecisionNode = nodeType === 'decision';
        const isIteratorNode = nodeType === 'iterator';
        
        let conditionMetPath = null;
        let conditionNotMetPath = null;
        let loopPath = null;
        let completePath = null;
        
        if (isDecisionNode) {
          connections.forEach(conn => {
            if (conn.sourceHandle === 'true') {
              conditionMetPath = conn.target;
            } else if (conn.sourceHandle === 'false') {
              conditionNotMetPath = conn.target;
            }
          });
        } else if (isIteratorNode) {
          connections.forEach(conn => {
            if (conn.sourceHandle === 'loop') {
              loopPath = conn.target;
            } else if (conn.sourceHandle === 'complete') {
              completePath = conn.target;
            }
          });
        }

        return {
          node_id: node.id,
          name: node.data?.name || node.name,
          displayName: node.data?.displayName || node.name,
          type: node.data?.type || node.type,
          description: node.data?.description || node.description,
          next: (isDecisionNode || isIteratorNode) ? [] : (node.data?.next || node.next || []),
          ...(isDecisionNode && { 
            conditionMetPath,
            conditionNotMetPath,
            next: [...(node.next || []), conditionMetPath, conditionNotMetPath].filter(Boolean)
          }),
          ...(isIteratorNode && {
            loopPath,
            completePath,
            next: [...(node.next || []), loopPath, completePath].filter(Boolean)
          }),
          inputParameters: node.data?.inputParameters || node.inputParameters || [],
          outputParameters: node.data?.outputParameters || node.outputParameters || []
        };
      }),
      edges: edges.map(edge => {
        let condition = edge.sourceHandle;
        if (condition === 'true') {
          condition = 'conditionMet';
        } else if (condition === 'false') {
          condition = 'conditionNotMet';
        }
        
        return {
          from: edge.source,
          to: edge.target,
          ...(condition && { condition })
        };
      })
    }
  };

  return specification;
};

export const {updateSpecification, setNodes, setEdges ,deleteNode, updateNodeConnections,updateNode} = studioSlice.actions;
export default studioSlice.reducer;