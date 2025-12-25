import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { bytesToSize,showToaster } from '@/utils/commonFunction';

const API_BASE_URL = 'https://api.yourdomain.com/api';

export const fetchKnowledgeSources = createAsyncThunk(
  'knowledge/fetchSources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/knowledge-base');
      return response.data.knowledge_bases.map(item => ({
        id: item.id,
        filename: item.file_name,
        type: item.file_type,
        size: item.file_size ? bytesToSize(item.file_size) : '--',
        createdAt: item.created_at,
        knowledgeBase: item.knowledge_base
      }));
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch knowledge bases');
    }
  }
);

// Upload only the last selected file
export const uploadKnowledgeSource = createAsyncThunk(
  'knowledge/uploadSource',
  async ({ files, knowledgeBaseName = 'telecom_industry_sop' }, { rejectWithValue, dispatch }) => {
    try {
      const file = files[files.length - 1];   // <-- only last file
      const name = file?.name

      const formData = new FormData();
      formData.append('file', file, file.name);  // field name MUST be "file"
      formData.append('knowledge_base_name', name);

      await axios.post(
        'http://127.0.0.1:8000/knowledge-base/ingest',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Refresh list
      await dispatch(fetchKnowledgeSources());

      return { message: 'Files uploaded successfully!', success: true };

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Upload failed. Please try again.'
      );
    }
  }
);

export const deleteKnowledgeSource = createAsyncThunk(
  'knowledge/deleteSource',
  async (sourceId, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/knowledge-base/${sourceId}`);
      // Refresh the list after successful deletion
      await dispatch(fetchKnowledgeSources());
      console.log(response,"Response from Knowledge Delete")
      showToaster('success', response?.data?.message || "Knowledge deleted successfully");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Failed to delete source'
      );
    }
  }
);


const initialState = {
  sources: [],
  loading: false,
  error: null,
  uploadStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  uploadProgress: 0,
};

const knowledgeSlice = createSlice({
  name: 'knowledge',
  initialState,
  reducers: {
    resetUploadStatus: (state) => {
      state.uploadStatus = 'idle';
      state.uploadProgress = 0;
      state.error = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch sources
    builder
      .addCase(fetchKnowledgeSources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKnowledgeSources.fulfilled, (state, action) => {
        state.loading = false;
        state.sources = action.payload;
      })
      .addCase(fetchKnowledgeSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload source
      .addCase(uploadKnowledgeSource.pending, (state) => {
        state.uploadStatus = 'loading';
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadKnowledgeSource.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.uploadProgress = 100; 
      })
      .addCase(uploadKnowledgeSource.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        // state.error = action.payload;
      })
    .addCase(deleteKnowledgeSource.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteKnowledgeSource.fulfilled, (state, action) => {
      state.loading = false;
      state.sources = state.sources.filter(source => source.id !== action.payload);
    })
    .addCase(deleteKnowledgeSource.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
  },
});

export const { resetUploadStatus, setUploadProgress } = knowledgeSlice.actions;

export const selectKnowledgeSources = (state) => state.knowledge.sources;
export const selectKnowledgeLoading = (state) => state.knowledge.loading;
export const selectKnowledgeError = (state) => state.knowledge.error;
export const selectUploadStatus = (state) => state.knowledge.uploadStatus;
export const selectUploadProgress = (state) => state.knowledge.uploadProgress;

export default knowledgeSlice.reducer;
