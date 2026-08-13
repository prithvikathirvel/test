"use client";

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { LogOut, Mail, User as UserIcon, Settings } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { logout } from "@/redux/slices/authSlice";
import {
  getDisplayName,
  getEmail,
  getInitials,
  getPublicProfileFields,
  getUsername,
} from "@/utils/userProfile";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const fields = useMemo(() => getPublicProfileFields(user), [user]);
  const displayName = getDisplayName(user);
  const email = getEmail(user);
  const username = getUsername(user);
  const initials = getInitials(user);

  const handleSignOut = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <Box className="min-h-screen bg-[#f8fafc]">
      <Box className="px-6 lg:px-5 py-5 max-w-3xl">
        <PageHeader
          icon={Settings}
          title="Settings"
          description="Your account details for this workspace"
        />

        {!isAuthenticated || !user ? (
          <div className="rounded-lg border border-slate-200 bg-white px-5 py-10 text-center">
            <p className="text-[13px] font-semibold text-slate-700">You are not signed in</p>
            <p className="text-[12px] text-slate-400 mt-1">
              Sign in to view your profile information.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-4 inline-flex items-center px-3.5 py-1.5 rounded-md text-[12px] font-medium text-white bg-slate-900 hover:bg-slate-800"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3.5">
                <span className="h-11 w-11 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-[13px] font-semibold flex items-center justify-center">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-slate-800 truncate">
                    {displayName}
                  </p>
                  <p className="text-[12px] text-slate-500 truncate">
                    {email || username || "Signed in"}
                  </p>
                </div>
              </div>

              <dl className="divide-y divide-slate-100">
                {fields.length > 0 ? (
                  fields.map((row) => (
                    <div
                      key={row.label}
                      className="px-5 py-3 grid grid-cols-[140px_minmax(0,1fr)] gap-4 items-start"
                    >
                      <dt className="text-[12px] font-medium text-slate-500">{row.label}</dt>
                      <dd className="text-[13px] text-slate-800 break-words">{row.value}</dd>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-6 text-[12.5px] text-slate-500 space-y-2">
                    <p className="flex items-center gap-2">
                      <UserIcon size={14} className="text-slate-400" />
                      {displayName}
                    </p>
                    {email && (
                      <p className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        {email}
                      </p>
                    )}
                  </div>
                )}
              </dl>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 bg-white transition-colors"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </Box>
    </Box>
  );
}
