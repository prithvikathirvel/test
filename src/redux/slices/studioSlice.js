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
    const {id,updatedData}=data
    console.log('Flow ID:', id);
    console.log('Updated Data:', updatedData);
    const response = await APIKit.put(`/agent-flow/${id}`, updatedData);
    showToaster('success', 'Flow updated successfully');
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
      const response = await axios.post('http://127.0.0.1:5000/execute-graph', {
        agent_id: data
      });
      showToaster('success', 'Flow Executed successfully');
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

const studioSlice = createSlice({
  name: "studio",
  initialState,
  reducers: {

    setNodes: (state, action) => {
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
    },
    setEdges: (state, action) => {
      const { edges, flow } = action.payload;
      state.edges = edges;
      if (Array.isArray(state.nodes) && Array.isArray(state.edges)) {
        state.specification = generateSpecification(flow,state.nodes, state.edges);
      } else {
        state.specification = {};
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
      //state.specification = action.payload;
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
        console.log("flow output", state.flowOutput)
      });
      builder.addCase(runFlow.rejected, (state, action) => {
        state.isFlowRunning = false;
      });

  
  }
});


const generateSpecification = (flow, nodes, edges) => {
  if (!nodes.length) return null;

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return {};
  }
  const specification = {
  ...flow, 
  graphSpec: {
    nodes: nodes.map(node => ({
      node_id: node.id,  
      name: node.data?.name || node.name,
      displayName: node.data?.displayName || node.name,
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
  }
  };

  return specification;
};

export const {updateSpecification, setNodes, setEdges ,deleteNode, updateNodeConnections,updateNode} = studioSlice.actions;
export default studioSlice.reducer;