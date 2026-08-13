import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import initialRootState from "../initialRootState";
import APIKit from "@/utils/APIKit";
import { showToaster } from "@/utils/commonFunction";
import axios from "axios";
import { sanitizeOutput } from "@/utils/commonFunction";
import { serializeFlowInputs } from "@/utils/templateRef";

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

/**
 * An empty-but-valid flow shell.
 *
 * `getFlowById` used to return `undefined` for every failure mode other than a
 * literal HTTP 500 (the `throw` was commented out), so `getFlowById.fulfilled`
 * assigned `state.flow = undefined` and every downstream `flow.graphSpec` read
 * threw "Cannot read properties of null (reading 'graphSpec')". Normalising the
 * payload here means the studio always has a renderable, empty canvas instead of
 * an intermittent runtime crash.
 */
const EMPTY_FLOW_SHELL = () => ({
  graphSpec: { nodes: [], edges: [] },
  inputs: [],
});

/** Guarantees a flow object that is always safe to read `graphSpec` from. */
const normalizeFlow = (flow) => {
  if (!flow || typeof flow !== 'object' || Array.isArray(flow)) {
    return EMPTY_FLOW_SHELL();
  }
  const graphSpec = flow.graphSpec && typeof flow.graphSpec === 'object' ? flow.graphSpec : {};
  return {
    ...flow,
    graphSpec: {
      ...graphSpec,
      nodes: Array.isArray(graphSpec.nodes) ? graphSpec.nodes : [],
      edges: Array.isArray(graphSpec.edges) ? graphSpec.edges : [],
    },
    inputs: Array.isArray(flow.inputs) ? flow.inputs : [],
  };
};

export const getFlowById = createAsyncThunk('flow/getFlowById', async (data) => {
  try {
    const response = await APIKit.get(`/agent-flow/${data.id}`);
    return normalizeFlow(response.data);
  } catch (error) {
    showToaster('error', error);
    // Never resolve with `undefined`: the fulfilled reducer and the studio page
    // both dereference `.graphSpec` on the result.
    return EMPTY_FLOW_SHELL();
  }
});

export const updateFlow = createAsyncThunk('flow/updateFlow', async (data) => {
  console.log('Updating flow data...');
  try {
    const { id, updatedData, onSuccess } = data
    const payload = updatedData && typeof updatedData === "object"
      ? { ...updatedData, inputs: serializeFlowInputs(updatedData.inputs) }
      : updatedData;
    const response = await APIKit.put(`/agent-flow/${id}`, payload);
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


export const saveFlow = createAsyncThunk('studio/saveFlow', async ({ data, onSuccess }) => {
  try {
    console.log(data, 'hey222');
    const response = await APIKit.post(`/agent-flow`, data);
    showToaster('success', 'Flow saved successfully');
    onSuccess();
    return response.data;
  } catch (error) {
    showToaster('error', error);
    throw error;
  }
});

export const runFlow = createAsyncThunk('studio/runFlow', async ({ data, onSuccess }) => {
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

export const deleteFlow = createAsyncThunk('studio/deleteFlow', async ({ data, onSuccess }) => {
  try {
    console.log(data, 'hey222');
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
    const response = await axios.get(`https://apidev.sifymodernization.digital/engine/mcp/tools`);
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
        // When dropping a flow, add all its nodes.
        // `graphSpec` can be missing entirely when the dropped flow came from a
        // listing response that failed or was trimmed — guard both levels.
        const flowSpec = action.payload.graphSpec || {};
        const incoming = Array.isArray(flowSpec.nodes) ? flowSpec.nodes : [];
        state.nodes = [...(state.nodes || []), ...incoming];
      } else {
        // Handle normal node addition
        const { nodes, flow } = action.payload;
        state.nodes = nodes?.map(newNode => {
          const existingNode = state.nodes ? state.nodes.find(node => node.id === newNode.id) : null;
          if (existingNode) {
            // Preserve all existing data when updating nodes (e.g., position changes)
            return {
              ...newNode,
              data: {
                ...existingNode.data,
                ...newNode.data,
                // Ensure inputParameters are preserved, especially for condition nodes
                inputParameters: existingNode.data?.inputParameters || newNode.data?.inputParameters || [],
                outputParameters: existingNode.data?.outputParameters || newNode.data?.outputParameters || []
              },
              next: existingNode?.next || newNode.next || []
            };
          }
          return {
            ...newNode,
            next: newNode.next || []
          };
        });
        if (Array.isArray(state.nodes) && Array.isArray(state.edges)) {
          state.specification = generateSpecification(flow, state.nodes, state.edges);
        } else {
          state.specification = {};
        }
      }
    },
    setEdges: (state, action) => {
      if (action.payload.type === "flow") {
        // When dropping a flow, add all its edges (same guard as `setNodes`).
        const flowSpec = action.payload.graphSpec || {};
        const incoming = Array.isArray(flowSpec.edges) ? flowSpec.edges : [];
        state.edges = [...(state.edges || []), ...incoming];
      } else {
        // Handle normal edge addition
        const { edges, flow } = action.payload;
        state.edges = edges;
        if (Array.isArray(state.nodes) && Array.isArray(state.edges)) {
          state.specification = generateSpecification(flow, state.nodes, state.edges);
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
      state.nodes = state.nodes.map(node => {
        const updatedNode = {
          ...node,
          next: node.next.filter(nextId => nextId !== nodeId)
        };

        // Clean up condition nextNode references for condition/conditions nodes
        if ((node.type === 'conditions' || node.type === 'condition' || node.data?.type === 'conditions' || node.data?.type === 'condition')
          && node.data?.inputParameters) {
          updatedNode.data = {
            ...node.data,
            inputParameters: node.data.inputParameters.map(param => {
              if (param.type === 'condition' && param.value && Array.isArray(param.value)) {
                return {
                  ...param,
                  value: param.value.map(condition => ({
                    ...condition,
                    nextNode: condition.nextNode === nodeId ? '' : condition.nextNode
                  }))
                };
              }
              return param;
            })
          };
        }

        return updatedNode;
      });
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
          }
          // For condition nodes, update the specific condition's nextNode
          else if (node.type === 'conditions' || node.type === 'condition' || node.data?.type === 'conditions' || node.data?.type === 'condition') {
            const conditionIndex = parseInt(sourceHandle);

            if (!isNaN(conditionIndex) && node.data?.inputParameters) {
              // Create a deep copy of the node to avoid mutations
              const updatedNode = {
                ...node,
                data: {
                  ...node.data,
                  inputParameters: node.data.inputParameters.map(param => {
                    if (param.type === 'condition' && param.value && Array.isArray(param.value)) {
                      return {
                        ...param,
                        value: param.value.map((condition, index) => {
                          if (index === conditionIndex) {
                            return { ...condition, nextNode: target };
                          }
                          // Preserve existing nextNode values for other conditions
                          return { ...condition };
                        })
                      };
                    }
                    return { ...param };
                  })
                }
              };

              return {
                ...updatedNode,
                next: [...(node.next || []), target].filter(Boolean)
              };
            }

            // If conditionIndex is invalid, just return the node with updated next array
            return {
              ...node,
              next: [...(node.next || []), target].filter(Boolean)
            };
          }
          else {
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
      const { flow, nodeId, updatedNode, parameter } = action.payload;

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

      // Built once and shared: this used to run the (O(nodes + edges)) spec
      // generator twice for every single parameter edit.
      const specification = generateSpecification(flow, state.nodes, state.edges);
      state.specification = specification;
      state.flow = specification;
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
    clearNewFlowId: (state) => {
      state.newFlowId = null;
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
      // Defensive: `normalizeFlow` already guarantees the shape, but a rejected
      // -then-recovered thunk or a future caller must never be able to put
      // `null`/`undefined` into `state.flow` — every consumer reads `.graphSpec`.
      const flow = normalizeFlow(action.payload);
      state.flow = flow;
      state.specification = flow;
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
      state.prebuiltFlows = action.payload;
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
      state.tokenUsage = action.payload.token_usage ?? null;
      state.priceUsage = action.payload.price_usage ?? null;
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
    inputs: serializeFlowInputs(flow?.inputs),
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
          interrupt: node.data?.interrupt || node.interrupt || false,
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

export const { updateSpecification, setNodes, setEdges, deleteNode, updateNodeConnections, updateNode, clearNewFlowId } = studioSlice.actions;
export default studioSlice.reducer;