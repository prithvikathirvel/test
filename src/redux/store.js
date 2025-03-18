import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import studioReducer from "./slices/studioSlice";
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist/es/constants";
import initialRootState from "./initialRootState";
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  whitelist: ["auth"], 
  stateReconciler: autoMergeLevel2
};

const rootReducer = combineReducers({
  auth: authReducer,
  studio: studioReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  preloadedState: initialRootState
});

export const persistor = persistStore(store);