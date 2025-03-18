import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import initialRootState from "../initialRootState";

const initialState = initialRootState.auth;

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  try {
    const response = await APIKit.get(`/userList`);
    return response.data;
  } catch (error) {
    throw error;
  }

});


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;