"use client";
 
import { useState } from "react";
import { Drawer } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
 
export default function LoginDrawer({ open, setOpen, handleLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
 
  const handleLoginClick = (e) => {
    e.preventDefault();
    handleLogin(username,password)
  };
 
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        className:
          "w-[420px] bg-white/20 backdrop-blur-2xl shadow-2xl rounded-l-[30px] p-8 transition-all duration-300 border border-gray-200/50",
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => setOpen(false)}
        className="absolute top-5 right-5 p-2 rounded-full bg-gray-200/50 hover:bg-gray-300 transition-all"
      >
        <CloseIcon className="text-gray-600" />
      </button>
 
      {/* Logo or Icon */}
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl font-bold">🚀</span>
        </div>
      </div>
 
      {/* Title */}
      <h2 className="text-3xl font-extrabold text-center text-gray-800">
        Welcome Back
      </h2>
      <p className="text-gray-500 text-sm text-center mb-8">
        Sign in to access your account
      </p>
 
      {/* Login Form */}
      <form onSubmit={handleLoginClick} className="flex flex-col gap-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-4 pl-12 rounded-xl bg-white/70 shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <span className="absolute top-4 left-4 text-gray-400">👤</span>
        </div>
 
        <div className="relative">
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 pl-12 rounded-xl bg-white/70 shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="absolute top-4 left-4 text-gray-400">🔒</span>
        </div>
 
        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-4 mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          Login
        </button>
 
        {/* Forgot Password & Signup */}
        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <button className="hover:text-indigo-600 transition-all">Forgot Password?</button>
          <button className="hover:text-indigo-600 transition-all">Create an Account</button>
        </div>
      </form>
    </Drawer>
  );
}