import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import initialRootState from "../initialRootState";
import APIKit from "@/utils/APIKit";
import { showToaster } from "@/utils/commonFunction";

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
  try {
    const response = await APIKit.put(`/agent-flow/${data.id}`, data);
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


const studioSlice = createSlice({
  name: "studio",
  initialState,
  reducers: {
    updateSpecification: (state, action) => {
      state.specification = action.payload;
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
        state.newFlowId = action.payload.data.id; 
      })
      .addCase(saveFlow.rejected, (state) => {
        state.studioSaveFlowLoader = false;
      });


      builder.addCase(getFlowById.fulfilled, (state, action) => {
        state.flow = action.payload;
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
        state.flow = action.payload;
        state.studioUpdateFlowLoader = false;
        state.specification = action.payload;
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
  }
});

export const { updateSpecification } = studioSlice.actions;
export default studioSlice.reducer;