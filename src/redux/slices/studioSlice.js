import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import initialRootState from "../initialRootState";
import APIKit from "@/utils/APIKit";

const initialState = initialRootState.studio;

export const fetchTools = createAsyncThunk('studio/fetchTools', async () => {
  try {
    const response = await APIKit.get(`/products`);
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
  }
});

export const { setTools, addTool, removeTool, updateToolState } = studioSlice.actions;
export default studioSlice.reducer;