"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  ArrowRight,
  KeyRound,
  AlertCircle,
  Command
} from "lucide-react";
import { loginUser } from "@/redux/slices/authSlice";
import InputBox from "@/components/Common/InputBox";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const { authLoader } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await dispatch(loginUser({ username: username || "admin", password: password || "admin" })).unwrap();
      router.push("/studio");
    } catch (err) {
      setError(err?.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername("admin");
    setPassword("admin");
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-zinc-100">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Command size={15} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-900">
            Sify Aurora
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-base font-semibold text-zinc-900">
            Sign in to your workspace
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Enter your email and password to continue.
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
            onClick={fillDemoCredentials}
            className="px-2.5 py-1 text-xs font-medium bg-white text-zinc-800 border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors"
          >
            Fill demo
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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

          <button
            type="submit"
            disabled={isSubmitting || authLoader}
            className="w-full py-2.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting || authLoader ? (
              <span>Signing in…</span>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
