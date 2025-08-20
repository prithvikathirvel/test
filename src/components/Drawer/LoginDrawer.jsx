"use client";

import { useState } from "react";
import { Drawer } from "@mui/material";
import {
  X,
  User,
  Lock,
  ArrowRight,
  KeyRound,
  UserPlus
} from "lucide-react";
import CustomButton from "../Common/CustomButton";
import InputBox from "../Common/InputBox";

export default function LoginDrawer({ open, setOpen, handleLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginClick = (e) => {
    e.preventDefault();
    handleLogin(username, password);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        className:
          "w-[420px] bg-white/20 backdrop-blur-2xl shadow-2xl rounded-l-[10px] p-8 transition-all duration-300 border border-gray-200/50",
      }}
    >

      <button
        onClick={() => setOpen(false)}
        className="absolute top-5 right-5 p-2 rounded-full bg-gray-200/50 hover:bg-gray-300 transition-all"
      >
        <X size={20} className="text-gray-600" />
      </button>

      <div className="text-center mt-4 mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">Welcome!</h2>
        <p className="text-gray-500 text-sm mt-1">
          Sign in to access your account
        </p>
      </div>

      <form onSubmit={handleLoginClick} className="flex flex-col gap-5">
        
      <InputBox
            isShowLabel={false}
            placeholder="Username"
            value={username}
            height="45px"
            onChange={setUsername}
            icon={<User size={18} className="text-gray-400" />}
          />

  <InputBox
            isShowLabel={false}
            placeholder="Password"
            value={password}
            height="45px"
            onChange={setPassword}
            icon={<Lock size={18} className="text-gray-400" />}
          />

       

       <CustomButton onClick={handleLoginClick}>
        Sign In
       </CustomButton>

        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <button
            type="button"
            className="flex items-center gap-1 hover:text-blue-600 transition-all"
          >
            <KeyRound size={14} />
            Forgot Password?
          </button>
          <button
            type="button"
            className="flex items-center gap-1 hover:text-blue-600 transition-all"
          >
            <UserPlus size={14} />
            Create Account
          </button>
        </div>
      </form>
    </Drawer>
  );
}
