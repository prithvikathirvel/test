"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import BlurredLoader from "@/components/Common/BlurredLoader";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const dispatch = useDispatch();
  const { authLoader } = useSelector((state) => state.auth);

  const canSubmit =
    name.trim() &&
    username.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError(null);
    try {
      const result = await dispatch(
        registerUser({ name: name.trim(), username: username.trim(), email: email.trim(), password })
      ).unwrap();
      if (result?.signedIn) {
        router.push("/studio");
      } else {
        router.push("/login?registered=1");
      }
    } catch (err) {
      setError(err.message || "Could not create the account. Please try again.");
    }
  };

  return (
    <>
      {authLoader && <BlurredLoader title="Creating account..." />}

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
              Create your account
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Set up access to your Aurora workspace
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-[12px] text-red-700">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Field
                label="Full name"
                icon={<User size={15} className="text-slate-400" />}
                type="text"
                autoFocus
                required
                placeholder="Jane Doe"
                value={name}
                onChange={setName}
              />
              <Field
                label="Username"
                icon={<User size={15} className="text-slate-400" />}
                type="text"
                required
                placeholder="jane"
                value={username}
                onChange={setUsername}
              />
              <Field
                label="Work email"
                icon={<Mail size={15} className="text-slate-400" />}
                type="email"
                required
                placeholder="jane@company.com"
                value={email}
                onChange={setEmail}
              />

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 8 characters"
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

              <Field
                label="Confirm password"
                icon={<Lock size={15} className="text-slate-400" />}
                type={showPassword ? "text" : "password"}
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full mt-1 py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>Create account</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-[13px] text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-slate-800 hover:underline no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

function Field({ label, icon, onChange, ...inputProps }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-3 pointer-events-none">{icon}</span>
        <input
          {...inputProps}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
        />
      </div>
    </div>
  );
}
