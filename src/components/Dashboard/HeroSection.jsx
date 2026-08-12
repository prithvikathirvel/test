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
import OrbitalVisual from "./OrbitalVisual";

export default function HeroSection({ handleDrawerOpen }) {
  return (
    <Box className="relative overflow-hidden bg-[#f8fafc] pt-16 pb-20 lg:pt-24 lg:pb-32">
      {/* Animated ambient blobs */}
      <div className="pointer-events-none absolute -top-48 -left-40 w-[640px] h-[640px] bg-indigo-200/30 rounded-full blur-[130px] animate-blob" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[520px] h-[520px] bg-violet-200/25 rounded-full blur-[110px] animate-blob" style={{ animationDelay: "4s" }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[260px] bg-sky-100/20 rounded-full blur-[140px] animate-blob" style={{ animationDelay: "8s" }} />

      <Container maxWidth="lg" className="!px-4 relative z-10">
        {/* Two-column hero: copy on the left, orbital product visual on the
            right. Below `lg` it collapses back to the original single centred
            column so the mobile layout is unchanged. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-12 lg:gap-10 items-center mb-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-3xl mx-auto lg:mx-0">
          {/* Top Pill Tag */}
          <div
            className="inline-flex items-center gap-2 bg-white border border-slate-200/90 shadow-2xs px-3.5 py-1.5 rounded-full mb-6 animate-fade-up"
          >
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700 tracking-tight">
              Enterprise Agentic Orchestration
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-indigo-600 font-medium">v2.4 Studio</span>
          </div>

          {/* Main Title */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15] animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            Build &amp; Orchestrate Autonomous
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-700 animate-gradient-x">
              AI Agent Workflows
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base sm:text-lg text-slate-500 mt-6 max-w-2xl lg:max-w-xl leading-relaxed animate-fade-up"
            style={{ animationDelay: "220ms" }}
          >
            Design multi-agent pipelines with visual graph execution, native MCP tool connectors,
            and contextual knowledge retrieval—built for enterprise reliability.
          </p>

          {/* Call to Actions */}
          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto animate-fade-up"
            style={{ animationDelay: "320ms" }}
          >
            <button
              onClick={handleDrawerOpen}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-xs shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:shadow-md flex items-center justify-center gap-2"
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
          <div
            className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 animate-fade-up"
            style={{ animationDelay: "420ms" }}
          >
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

          {/* Orbital product visual */}
          <div
            className="hidden md:block animate-fade-up"
            style={{ animationDelay: "460ms" }}
            aria-hidden="true"
          >
            <OrbitalVisual />
          </div>
        </div>

        {/* Interactive Canvas Mockup */}
        <div
          className="relative max-w-4xl mx-auto animate-fade-up"
          style={{ animationDelay: "540ms" }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            {/* Window chrome */}
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-300" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-300" />
                <span className="text-xs font-mono text-slate-400 ml-2">studio/customer-support-triage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Execution: 42ms
                </span>
              </div>
            </div>

            {/* Canvas Body */}
            <div className="p-8 bg-[#fafbfc] min-h-[320px] flex items-center justify-center">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_48px_1fr_48px_1fr] gap-0 w-full max-w-3xl items-center">

                {/* Node 1: Input */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 animate-float">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">User Query Trigger</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">INPUT</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono bg-slate-50 p-1.5 rounded">
                    `How do I connect database?`
                  </p>
                </div>

                {/* Connector 1 */}
                <div className="hidden md:flex items-center justify-center px-1">
                  <div className="relative w-full h-px bg-slate-200 overflow-visible">
                    <div className="absolute top-1/2 -translate-y-1/2 h-2 w-5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full animate-flow-dot" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-slate-400" />
                  </div>
                </div>

                {/* Node 2: Center Agent — pulsing */}
                <div className="p-4 bg-white rounded-xl border-2 border-indigo-500 shadow-md space-y-2 relative animate-pulse-ring">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Support Agent</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">GPT-4O</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Autonomous reasoning loop with document retrieval.
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                    <Zap size={11} /> 2 tools evaluated
                  </div>
                </div>

                {/* Connector 2 */}
                <div className="hidden md:flex items-center justify-center px-1">
                  <div className="relative w-full h-px bg-slate-200 overflow-visible">
                    <div className="absolute top-1/2 -translate-y-1/2 h-2 w-5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full animate-flow-dot" style={{ animationDelay: "1.25s" }} />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent border-l-slate-400" />
                  </div>
                </div>

                {/* Node 3: Tool */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 animate-float-slow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Knowledge RAG</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">TOOL</span>
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
