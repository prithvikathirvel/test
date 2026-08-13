"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Boxes,
  Bot,
  Users,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { isAdminAuthed, adminLogout } from "@/utils/adminAuth";
import RegistrySection from "@/components/admin/RegistrySection";
import UsersSection from "@/components/admin/UsersSection";
import AnalyticsSection from "@/components/admin/AnalyticsSection";

const NAV = [
  { id: "analytics", label: "Analytics", icon: LayoutDashboard },
  { id: "tools", label: "Tools Registry", icon: Wrench },
  { id: "models", label: "Models Registry", icon: Boxes },
  { id: "agents", label: "Agents Registry", icon: Bot },
  { id: "users", label: "Users Registry", icon: Users },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState("analytics");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminAuthed()) {
      router.replace("/admin");
    } else {
      setReady(true);
    }
  }, [router]);

  const handleLogout = () => {
    adminLogout();
    router.replace("/admin");
  };

  if (!ready) return null;

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[232px] shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="flex items-center gap-2.5 px-4 min-h-[52px] border-b border-slate-100">
          <div className="h-7 w-7 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <ShieldCheck size={15} />
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-bold text-slate-800">Admin Console</p>
            <p className="text-[10.5px] text-slate-400 uppercase tracking-wider">Registry</p>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2.5 space-y-0.5">
          <p className="px-2 pb-1.5 pt-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Management
          </p>
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`relative flex items-center gap-2.5 w-full rounded-md px-2.5 py-[7px] transition-colors cursor-pointer text-left ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 inset-y-[5px] w-[2px] rounded-r-full bg-slate-700" />
                )}
                <Icon size={16} strokeWidth={1.75} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                <span className={`text-[13px] ${isActive ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-2.5 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full rounded-md px-2.5 py-[7px] text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors text-[13px] font-medium"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Studio-style top header */}
        <div className="w-full bg-white border-b border-slate-200/80 px-5 py-2.5 flex items-center justify-between min-h-[52px] shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <ShieldCheck size={14} />
            </div>
            <span className="text-[13.5px] font-semibold text-slate-800 tracking-tight truncate">
              {NAV.find((n) => n.id === active)?.label || "Admin Console"}
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
            restricted
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 max-w-6xl">
            {active === "analytics" && <AnalyticsSection />}
            {active === "tools" && <RegistrySection kind="tools" />}
            {active === "models" && <RegistrySection kind="models" />}
            {active === "agents" && <RegistrySection kind="agents" />}
            {active === "users" && <UsersSection />}
          </div>
        </div>
      </main>
    </div>
  );
}
