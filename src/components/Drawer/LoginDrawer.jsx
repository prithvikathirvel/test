"use client";

import { useState } from "react";
import { Drawer } from "@mui/material";
import {
  X,
  User,
  Lock,
  KeyRound,
  ArrowRight,
  Command
} from "lucide-react";
import InputBox from "../Common/InputBox";

export default function LoginDrawer({ open, setOpen, handleLogin, error = null }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginClick = (e) => {
    e.preventDefault();
    handleLogin(username || "admin", password || "admin");
  };

  const fillDemo = () => {
    setUsername("admin");
    setPassword("admin");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        className:
          "w-full sm:w-[380px] bg-white shadow-xl p-8 transition-all duration-200 border-l border-zinc-200 flex flex-col justify-between",
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Command size={15} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-zinc-900">
              Sify Aurora
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-semibold text-zinc-900">
            Sign in to workspace
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Access your AI agent workflows.
          </p>
        </div>

        {/* Minimal Demo Pill */}
        <div className="mb-5 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound size={14} className="text-zinc-600 shrink-0" />
            <div>
              <div className="text-xs font-medium text-zinc-900">
                Demo account
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                admin / admin
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="px-2.5 py-1 text-xs font-medium bg-white text-zinc-800 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors"
          >
            Fill demo
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginClick} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Username
            </label>
            <InputBox
              isShowLabel={false}
              placeholder="Username"
              value={username}
              height="38px"
              onChange={setUsername}
              icon={<User size={15} className="text-zinc-400" />}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Password
            </label>
            <InputBox
              isShowLabel={false}
              placeholder="Password"
              value={password}
              height="38px"
              onChange={setPassword}
              icon={<Lock size={15} className="text-zinc-400" />}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Sign in</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>

      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
        <span>Sify Aurora</span>
        <span>Secure session</span>
      </div>
    </Drawer>
  );
}
