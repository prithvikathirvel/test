import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import initialRootState from "../initialRootState";
import axios from "axios";
import { showToaster } from "@/utils/commonFunction";
import { sanitizeUserPayload } from "@/utils/userProfile";

const AUTH_HOST = "https://apidev.sifymodernization.digital";
const initialState = initialRootState.auth;

const persistSession = (accessToken) => {
  if (!accessToken || typeof window === "undefined") return;
  localStorage.setItem("token", accessToken);
  document.cookie = `token=${accessToken}; path=/; max-age=86400`;
};

const clearSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  document.cookie = "token=; path=/; max-age=0";
};

const toUser = (data) => {
  if (!data || typeof data !== "object") return null;
  const {
    access_token,
    accessToken,
    token,
    refresh_token,
    refreshToken,
    ...rest
  } = data;
  const nested = rest.user && typeof rest.user === "object" ? rest.user : null;
  const source = nested ? { ...rest, ...nested } : rest;
  delete source.user;
  return sanitizeUserPayload(source) || source;
};

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async () => {
  const response = await axios.get(`/userList`);
  return response.data;
});

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${AUTH_HOST}/login`,
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );
      const accessToken = data?.access_token || data?.accessToken || data?.token;
      persistSession(accessToken);
      return toUser(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Login failed";
      showToaster("error", errorMessage);
      return rejectWithValue({ message: errorMessage });
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, username, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${AUTH_HOST}/register`,
        { name, username, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      const accessToken = data?.access_token || data?.accessToken || data?.token;
      if (accessToken) {
        persistSession(accessToken);
        return { signedIn: true, user: toUser(data) };
      }
      return { signedIn: false, user: toUser(data) };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Could not create the account";
      showToaster("error", errorMessage);
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
      clearSession();
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
        state.authError = action.payload?.message || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.authLoader = true;
        state.authError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.authLoader = false;
        if (action.payload?.signedIn) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.authLoader = false;
        state.authError = action.payload?.message || "Registration failed";
      });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
