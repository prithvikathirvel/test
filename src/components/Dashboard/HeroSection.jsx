"use client";

import { Box, Container } from "@mui/material";
import {
  ArrowRight,
  Bot,
  Sparkles,
  Workflow,
  Cpu,
  BrainCircuit,
  Database,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import AnimatedText from "@/components/Common/AnimatedText";

export default function HeroSection({ handleDrawerOpen }) {
  const router = useRouter();

  return (
    <Box className="relative overflow-hidden bg-[#fafafa] py-16 sm:py-24 border-b border-zinc-200">
      <Container maxWidth="lg" className="!px-4 sm:!px-6 lg:!px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Minimal Sify Aurora Copy Column */}
          <div className="lg:col-span-7 animate-fade-in">
            <p className="text-xs font-semibold text-[#0d47a1] uppercase tracking-widest mb-4">
              Sify Aurora • Enterprise Agent Platform
            </p>

            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight leading-[1.15] mb-4">
              Turn your documents, APIs, and models into autonomous AI workflows.
            </h1>

            <div className="mb-6 min-h-[48px]">
              <AnimatedText
                texts={[
                  "Visual ReAct Agent Builder with multi-model routing",
                  "Hybrid Vector + Neo4j Graph RAG retrieval pipelines",
                  "One-click HTTP & webhook edge deployment",
                  "Built-in test playground and voice TTS/STT agents"
                ]}
              />
            </div>

            <p className="text-sm text-zinc-600 mb-8 max-w-xl leading-relaxed">
              An intuitive visual platform to design, test, and deploy intelligent multi-agent systems — without writing custom boilerplate.
            </p>

            {/* Sify Blue Primary Action Button */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={handleDrawerOpen}
                className="px-5 py-2.5 rounded-lg bg-[#0d47a1] hover:bg-[#0a3880] text-white font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Start free</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="px-5 py-2.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-medium text-sm transition-colors"
              >
                Explore console
              </button>
            </div>

            {/* Minimal Sify Aurora trust caption */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
              <span>No credit card required</span>
              <span>•</span>
              <span>No model training</span>
              <span>•</span>
              <span>Enterprise SOC2 Type II</span>
            </div>
          </div>

          {/* Animated Orbital Visual from dev.sifymodernization.digital/agent-studio/ */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-[360px] h-[360px] flex items-center justify-center">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#0d47a1]/20 animate-pulse-ring" />
              {/* Middle ring */}
              <div className="absolute inset-8 rounded-full border border-[#0d47a1]/15" />
              {/* Inner ring */}
              <div className="absolute inset-16 rounded-full border border-zinc-200" />

              {/* Center Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0d47a1] to-[#1565c0] flex items-center justify-center shadow-lg shadow-[#0d47a1]/25 animate-float-slow">
                    <BrainCircuit size={32} className="text-white" />
                  </div>
                  <div className="absolute -inset-3 rounded-2xl bg-[#0d47a1]/10 blur-xl" />
                </div>
              </div>

              {/* Orbiting node 1 - Bot */}
              <div className="absolute inset-0 animate-orbit">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-12 w-12 rounded-xl bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:scale-110 transition-transform">
                    <Bot size={20} className="text-[#0d47a1]" />
                  </div>
                </div>
              </div>

              {/* Orbiting node 2 - Workflow */}
              <div className="absolute inset-0 animate-orbit" style={{ animationDelay: "-4s" }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-12 w-12 rounded-xl bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:scale-110 transition-transform">
                    <Workflow size={20} className="text-[#0d47a1]" />
                  </div>
                </div>
              </div>

              {/* Orbiting node 3 - Cpu */}
              <div className="absolute inset-0 animate-orbit" style={{ animationDelay: "-8s" }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-12 w-12 rounded-xl bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:scale-110 transition-transform">
                    <Cpu size={20} className="text-[#0d47a1]" />
                  </div>
                </div>
              </div>

              {/* Inner orbiting node 1 - Database */}
              <div className="absolute inset-0 animate-orbit-reverse">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-10 w-10 rounded-lg bg-white border border-zinc-200 shadow-sm flex items-center justify-center">
                    <Database size={16} className="text-zinc-700" />
                  </div>
                </div>
              </div>

              {/* Inner orbiting node 2 - MessageSquare */}
              <div className="absolute inset-0 animate-orbit-reverse" style={{ animationDelay: "-5s" }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-10 w-10 rounded-lg bg-white border border-zinc-200 shadow-sm flex items-center justify-center">
                    <MessageSquare size={16} className="text-zinc-700" />
                  </div>
                </div>
              </div>

              {/* Subtle floating particles */}
              <div className="absolute top-6 right-10 h-2 w-2 rounded-full bg-[#0d47a1]/40 animate-float" />
              <div className="absolute bottom-10 left-8 h-1.5 w-1.5 rounded-full bg-[#0d47a1]/30 animate-float-slow" />
              <div className="absolute top-1/3 left-4 h-2.5 w-2.5 rounded-full bg-[#0d47a1]/20 animate-float" style={{ animationDelay: "-2s" }} />
            </div>
          </div>
        </div>
      </Container>
    </Box>
  );
}
