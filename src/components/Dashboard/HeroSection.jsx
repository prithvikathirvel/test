"use client";

import React from "react";
import { Box, Container } from "@mui/material";
import {
  Sparkles,
  ArrowRight,
  Workflow,
  Bot,
  Cpu,
  Database,
  CheckCircle2,
  Play,
  Layers,
  Zap,
} from "lucide-react";

export default function HeroSection({ handleDrawerOpen }) {
  return (
    <Box className="relative overflow-hidden bg-[#f8fafc] pt-16 pb-20 lg:pt-24 lg:pb-32">
      {/* Ambient background mesh lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-100/40 rounded-full blur-[120px]" />

      <Container maxWidth="lg" className="!px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200/90 shadow-2xs px-3.5 py-1.5 rounded-full mb-6">
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700 tracking-tight">
              Enterprise Agentic Orchestration
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-indigo-600 font-medium">v2.4 Studio</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15]">
            Build & Orchestrate Autonomous
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
              AI Agent Workflows
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-500 mt-6 max-w-2xl leading-relaxed">
            Design multi-agent pipelines with visual graph execution, native MCP tool connectors, 
            and contextual knowledge retrieval—built for enterprise reliability.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDrawerOpen}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-xs shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={handleDrawerOpen}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <Play size={13} className="fill-slate-700" />
              <span>Explore Live Studio</span>
            </button>
          </div>

          {/* Feature Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Visual Canvas
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Native MCP Servers
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" /> Zero Code Deployment
            </span>
          </div>
        </div>

        {/* Interactive Canvas Mockup */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Window Topbar */}
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span className="text-xs font-mono text-slate-400 ml-2">studio/customer-support-triage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Execution: 42ms
                </span>
              </div>
            </div>

            {/* Canvas Body Mockup */}
            <div className="p-8 bg-[#fafbfc] min-h-[320px] flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl items-center relative">
                {/* Node 1 */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">User Query Trigger</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">INPUT</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono bg-slate-50 p-1.5 rounded">
                    `How do I connect database?`
                  </p>
                </div>

                {/* Node 2 (Center Agent) */}
                <div className="p-4 bg-white rounded-xl border-2 border-indigo-500 shadow-md space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Support Agent</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold">GPT-4O</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Autonomous reasoning loop with document retrieval.
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                    <Zap size={11} /> 2 tools evaluated
                  </div>
                </div>

                {/* Node 3 */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Knowledge RAG</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">TOOL</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono bg-slate-50 p-1.5 rounded">
                    docs/db-integration.md (0.94 score)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Box>
  );
}
