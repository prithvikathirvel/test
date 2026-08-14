"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { adminLogin, isAdminAuthed } from "@/utils/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAdminAuthed()) router.replace("/admin/dashboard");
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError("Enter your username and password.");
      return;
    }
    if (adminLogin(username, password)) {
      router.replace("/admin/dashboard");
    } else {
      setError("Invalid credentials. Use the admin credentials to continue.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-[20px] font-semibold text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Restricted access — sign in to manage the registry
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-[12px] text-red-700">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Username</label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim() || !password.trim()}
              className="w-full mt-1 py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <span>Sign in</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[12px] text-slate-400">
          This area is for administrators only and is not shown to end users.
        </p>
      </div>
    </div>
  );
}
