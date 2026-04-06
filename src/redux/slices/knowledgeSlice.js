import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { bytesToSize, showToaster } from '@/utils/commonFunction';

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default headers
const api = axios.create({
  baseURL: 'https://apidev.sifymodernization.digital/kb/api/v1',
  maxContentLength: 100 * 1024 * 1024, // 100MB
  maxBodyLength: 100 * 1024 * 1024, // 100MB
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      showToaster('error', 'Session Expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export const fetchKnowledgeSources = createAsyncThunk(
  'knowledge/fetchSources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/knowledge-base');
      return response.data.knowledge_bases.map(item => ({
        id: item.id,
        filename: item.file_name,
        type: item.file_type,
        size: item.file_size ? bytesToSize(item.file_size) : '--',
        createdAt: item.created_at,
        knowledgeBase: item.knowledge_base
      }));
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Session Expired');
      }
      const errorMessage = typeof error.response?.data === 'string' && error.response.data.startsWith('<')
        ? 'Authentication failed. Please check your credentials.'
        : error.response?.data?.message || 'Failed to fetch knowledge bases';

      return rejectWithValue(errorMessage);
    }
  }
);

export const uploadKnowledgeSource = createAsyncThunk(
  'knowledge/uploadSource',
  async (payload, { rejectWithValue, dispatch }) => {
    // 1. Destructure chunk_words here
    const { files, knowledge_base_names, content_types, chunk_words } = payload;

    try {
      const uploadPromises = files.map((file, index) => {
        const formData = new FormData();

        // Append the actual file
        formData.append('file', file);

        // Append knowledge_base_name
        const kbName = knowledge_base_names && knowledge_base_names[index]
          ? knowledge_base_names[index]
          : file.name;

        formData.append('knowledge_base_name', kbName);

        // Append content_type
        if (content_types && content_types[index]) {
          formData.append('content_type', content_types[index]);
        }

        // 2. Append chunk_word (THE FIX)
        // We check if the array exists and if the specific index has a value
        if (chunk_words && chunk_words[index]) {
          formData.append('chunk_word', chunk_words[index]);
        }

        return api.post('/knowledge-base/ingest', formData, {
          // headers: {
          //   'Content-Type': 'multipart/form-data',
          // },
        });
      });

      // Execute all uploads in parallel
      await Promise.all(uploadPromises);

      // Refresh list after all uploads are done
      await dispatch(fetchKnowledgeSources());

      return { message: 'All files uploaded successfully!', success: true };

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
      const response = await api.delete(`/knowledge-base/${sourceId}`);
      await dispatch(fetchKnowledgeSources());
      showToaster('success', response?.data?.message || "Knowledge deleted successfully");
      return sourceId; // Return ID to help reducer if needed
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
  uploadStatus: 'idle',
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
        state.error = action.payload;
      })

      // Delete Source
      .addCase(deleteKnowledgeSource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteKnowledgeSource.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally filter locally to prevent UI flicker before refetch finishes
        state.sources = state.sources.filter(source => source.id !== action.payload);
      })
      .addCase(deleteKnowledgeSource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetUploadStatus, setUploadProgress } = knowledgeSlice.actions;

export const selectKnowledgeSources = (state) => state.knowledge.sources;
export const selectKnowledgeLoading = (state) => state.knowledge.loading;
export const selectKnowledgeError = (state) => state.knowledge.error;
export const selectUploadStatus = (state) => state.knowledge.uploadStatus;
export const selectUploadProgress = (state) => state.knowledge.uploadProgress;

export default knowledgeSlice.reducer;
