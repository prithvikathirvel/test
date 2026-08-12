"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import BlurredLoader from "@/components/Common/BlurredLoader";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();
  const { authLoader } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setError(null);

    try {
      await dispatch(loginUser({ username, password })).unwrap();
      router.push("/studio");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify and try again.");
    }
  };

  return (
    <>
      {authLoader && <BlurredLoader title="Authenticating..." />}

      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-8">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex no-underline justify-center mb-4">
              <Image
                src="/agent-studio/branding/aurora-logo.png"
                alt="Sify Aurora"
                width={160}
                height={48}
                className="object-contain"
                priority
                unoptimized
              />
            </Link>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Sign in to Aurora
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
              disabled={!username.trim() || !password.trim()}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-xs shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <span>Sign In to Workspace</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Security Footer Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Enterprise encrypted workspace</span>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors no-underline">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </>
  );
}
