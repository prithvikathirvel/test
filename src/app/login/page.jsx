"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/slices/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import BlurredLoader from "@/components/Common/BlurredLoader";
import { Suspense } from "react";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
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
      {authLoader && <BlurredLoader title="Signing in..." />}

      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex no-underline justify-center mb-5">
              <Image
                src="/agent-studio/branding/aurora-logo.png"
                alt="Sify Aurora"
                width={140}
                height={42}
                className="object-contain"
                priority
                unoptimized
              />
            </Link>
            <h1 className="text-[20px] font-semibold text-slate-900 tracking-tight">
              Sign in
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Enter your credentials to open your workspace
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {justRegistered && !error && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-[12px] text-emerald-800">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Account created. Sign in to continue.</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-[12px] text-red-700">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  Username
                </label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    required
                    placeholder="Enter your username or Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

          <p className="mt-5 text-center text-[13px] text-slate-500">
            New to Aurora?{" "}
            <Link href="/signup" className="font-medium text-slate-800 hover:underline no-underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
