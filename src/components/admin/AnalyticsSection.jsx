"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Wrench, Boxes, Bot, Users, Workflow, Layers, CheckCircle2 } from "lucide-react";
import { listRegistry, listUsers, listFlows } from "@/utils/adminAPI";

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
    <div className={`h-10 w-10 rounded-lg border flex items-center justify-center ${accent}`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[22px] font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-[11.5px] text-slate-500 mt-1 font-medium uppercase tracking-wide">{label}</p>
    </div>
  </div>
);

const DistributionBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-400 font-mono">{count}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const AnalyticsSection = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ tools: [], models: [], agents: [], users: [], flows: [] });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tools, models, agents, users, flows] = await Promise.allSettled([
        listRegistry("tools"),
        listRegistry("models"),
        listRegistry("agents"),
        listUsers(),
        listFlows(),
      ]);
      setData({
        tools: tools.status === "fulfilled" ? tools.value : [],
        models: models.status === "fulfilled" ? models.value : [],
        agents: agents.status === "fulfilled" ? agents.value : [],
        users: users.status === "fulfilled" ? users.value : [],
        flows: flows.status === "fulfilled" ? flows.value : [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const typeDistribution = useMemo(() => {
    const map = {};
    [...data.tools, ...data.models, ...data.agents].forEach((item) => {
      const t = item.type || "other";
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const totalActive =
    [...data.tools, ...data.models, ...data.agents].filter(
      (i) => i.isActive !== false && i.status !== false
    ).length;
  const totalResources = data.tools.length + data.models.length + data.agents.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <CircularProgress size={24} className="!text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-800">Analytics Dashboard</h2>
        <p className="text-[12.5px] text-slate-500">
          High-level overview of the registry and workspace usage.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard icon={Wrench} label="Tools" value={data.tools.length} accent="bg-violet-50 text-violet-600 border-violet-100" />
        <StatCard icon={Boxes} label="Models" value={data.models.length} accent="bg-blue-50 text-blue-600 border-blue-100" />
        <StatCard icon={Bot} label="Agents" value={data.agents.length} accent="bg-emerald-50 text-emerald-600 border-emerald-100" />
        <StatCard icon={Users} label="Users" value={data.users.length} accent="bg-amber-50 text-amber-600 border-amber-100" />
        <StatCard icon={Workflow} label="Flows" value={data.flows.length} accent="bg-indigo-50 text-indigo-600 border-indigo-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Type distribution */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={15} className="text-indigo-600" />
            <h3 className="text-[13px] font-semibold text-slate-800">Resource Type Distribution</h3>
          </div>
          {typeDistribution.length === 0 ? (
            <p className="text-[12.5px] text-slate-400 py-6 text-center">No resources registered yet.</p>
          ) : (
            <div className="space-y-3">
              {typeDistribution.map(({ type, count }, i) => (
                <DistributionBar
                  key={type}
                  label={type}
                  count={count}
                  total={totalResources}
                  color={["bg-indigo-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-blue-500"][i % 5]}
                />
              ))}
            </div>
          )}
        </div>

        {/* Health / activity */}
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <h3 className="text-[13px] font-semibold text-slate-800">Registry Health</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[20px] font-bold text-slate-800">{totalResources}</p>
              <p className="text-[11.5px] text-slate-500">Total resources</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-100">
              <p className="text-[20px] font-bold text-emerald-700">{totalActive}</p>
              <p className="text-[11.5px] text-emerald-700/70">Active resources</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 col-span-2">
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="text-slate-600 font-medium">Activation rate</span>
                <span className="text-slate-400 font-mono">
                  {totalResources > 0 ? Math.round((totalActive / totalResources) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${totalResources > 0 ? Math.round((totalActive / totalResources) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
