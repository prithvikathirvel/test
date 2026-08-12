"use client";

import { useState } from "react";
import { Dialog, Box, Typography, IconButton } from "@mui/material";
import {
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

export default function LoginDrawer({ open, setOpen, handleLogin, error = null }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!username.trim() || !password.trim()) return;
    setIsSubmitting(true);
    try {
      await handleLogin(username, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          p: { xs: 3, sm: 4 },
        },
      }}
    >
      {/* Top Close Button */}
      <div className="flex justify-end -mt-1 -mr-1 mb-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Brand & Title */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <Image
            src="/agent-studio/branding/aurora-logo.png"
            alt="Sify Aurora"
            width={140}
            height={42}
            className="object-contain"
            priority
            unoptimized
          />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Welcome to Aurora
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your credentials to access your workspace
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Username / Email
          </label>
          <div className="relative flex items-center">
            <User size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              autoFocus
              required
              placeholder="e.g. prithvi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Password
            </label>
            <span className="text-[11px] text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">
              Forgot?
            </span>
          </div>
          <div className="relative flex items-center">
            <Lock size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !username.trim() || !password.trim()}
          className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-xs shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          <span>{isSubmitting ? "Signing in..." : "Sign In to Workspace"}</span>
          <ArrowRight size={14} />
        </button>
      </form>

      {/* Security Footer Note */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck size={13} className="text-emerald-600" />
        <span>Enterprise encrypted workspace</span>
      </div>
    </Dialog>
  );
}
