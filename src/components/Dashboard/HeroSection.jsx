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
          {/* <div
            className="inline-flex items-center gap-2 bg-white border border-slate-200/90 shadow-2xs px-3.5 py-1.5 rounded-full mb-6 animate-fade-up"
          >
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700 tracking-tight">
              Enterprise Agentic Orchestration
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-indigo-600 font-medium">v2.4 Studio</span>
          </div> */}

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
          
        </div>
      </Container>
    </Box>
  );
}
