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
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`http://1.6.37.35/login`, { username, password }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { access_token, ...user } = data;
      localStorage.setItem("token", access_token);
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      console.log(errorMessage,'errorMessage');
      console.log(error,'INSIDE thiss');
      showToaster('error', errorMessage);
      return rejectWithValue({ message: errorMessage });
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
    .addCase(loginUser.pending, (state) => {
      state.authLoader = true;
      state.authError = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.authLoader = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.authLoader = false;
      state.authError = action.payload?.message || 'Login failed';
    });
}
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;