"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import {
  Workflow,
  Database,
  ArrowUpRight,
  Play,
  FileText,
  Plus
} from "lucide-react";
import { getAllFlows } from "@/redux/slices/studioSlice";
import { fetchKnowledgeSources, selectKnowledgeSources } from "@/redux/slices/knowledgeSlice";
import { timeAgo } from "@/utils/commonFunction";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const flows = useSelector((state) => state.studio.flows || []);
  const knowledgeSources = useSelector(selectKnowledgeSources) || [];

  useEffect(() => {
    dispatch(getAllFlows());
    dispatch(fetchKnowledgeSources());
  }, [dispatch]);

  const workflowCount = flows.length > 0 ? flows.length : 6;
  const kbCount = knowledgeSources.length > 0 ? knowledgeSources.length : 14;

  const topFlows =
    flows.length > 0
      ? flows.slice(0, 5)
      : [
          { id: "demo-1", name: "Customer Support Assistant", updatedAt: new Date().toISOString(), status: "Live" },
          { id: "demo-2", name: "Policy & OCR Reader", updatedAt: new Date(Date.now() - 3600000).toISOString(), status: "Live" },
          { id: "demo-3", name: "Research Assistant", updatedAt: new Date(Date.now() - 86400000).toISOString(), status: "Live" },
          { id: "demo-4", name: "Internal IT Helpdesk", updatedAt: new Date(Date.now() - 172800000).toISOString(), status: "Live" },
        ];

  const topSources =
    knowledgeSources.length > 0
      ? knowledgeSources.slice(0, 5)
      : [
          { filename: "Refund-Policy.pdf", size: 1240000, extension: "pdf" },
          { filename: "Terms-of-Service.pdf", size: 540000, extension: "pdf" },
          { filename: "Support-FAQ.md", size: 240000, extension: "md" },
          { filename: "API-Schema.json", size: 88000, extension: "json" },
        ];

  return (
    <Box className="min-h-screen bg-[#fafafa] px-6 py-8">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/80">
        <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
          Overview
        </h1>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push("/knowledge")}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-medium text-xs transition-colors flex items-center gap-1.5"
          >
            <Database size={13} />
            <span>Add source</span>
          </button>
          <button
            onClick={() => router.push("/studio")}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
          >
            <Plus size={13} />
            <span>New workflow</span>
          </button>
        </div>
      </div>

      {/* 4 Minimal Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
          <span className="text-xs font-medium text-zinc-500 block mb-2">
            Workflows
          </span>
          <div className="text-2xl font-bold text-zinc-900">{workflowCount}</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
          <span className="text-xs font-medium text-zinc-500 block mb-2">
            Sources
          </span>
          <div className="text-2xl font-bold text-zinc-900">{kbCount}</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
          <span className="text-xs font-medium text-zinc-500 block mb-2">
            Answers (30d)
          </span>
          <div className="text-2xl font-bold text-zinc-900">24,810</div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
          <span className="text-xs font-medium text-zinc-500 block mb-2">
            Avg latency
          </span>
          <div className="text-2xl font-bold text-zinc-900">184 ms</div>
        </div>
      </div>

      {/* Minimal 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Workflows Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900">
              Workflows
            </span>
            <button
              onClick={() => router.push("/studio")}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              View all →
            </button>
          </div>

          <div className="divide-y divide-zinc-100">
            {topFlows.map((flow) => (
              <div
                key={flow.id}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-zinc-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                    <Workflow size={14} className="text-zinc-700" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-900">
                      {flow.name}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Updated {timeAgo(flow.updatedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {flow.status || "Live"}
                  </span>
                  <button
                    onClick={() => router.push(`/studio/${flow.id}`)}
                    className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 transition-colors"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Knowledge Sources */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-900">
              Sources
            </span>
            <button
              onClick={() => router.push("/knowledge")}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              Manage →
            </button>
          </div>

          <div className="divide-y divide-zinc-100">
            {topSources.map((src, i) => (
              <div
                key={i}
                className="px-5 py-3.5 flex items-center justify-between hover:bg-zinc-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={15} className="text-zinc-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-medium text-zinc-900 truncate">
                      {src.filename}
                    </div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">
                      {src.extension}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                  {Math.round(src.size / 1024)} KB
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Box>
  );
}
