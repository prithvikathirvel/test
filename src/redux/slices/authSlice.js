import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import initialRootState from "../initialRootState";
import axios from "axios";
import { showToaster } from "@/utils/commonFunction";


const initialState = initialRootState.auth;

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  try {
    const response = await axios.get(`/userList`);
    return response.data;
  } catch (error) {
    throw error;
  }

});


export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`http://1.6.37.35/login`, { email, password }, {
        headers: {
          "Content-Type": "application/json",
        },
        
      });
      const { access_token, ...user } = data;
      localStorage.setItem("token", access_token);
      return user;
    } catch (error) {
      showToaster('error', error);
      return rejectWithValue(error.response?.data ?? { message: "Login failed" });
    }
  }
);


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
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  },
  extraReducers: (builder) => {
  builder
    .addCase(loginUser.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase(loginUser.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
    });
}
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;