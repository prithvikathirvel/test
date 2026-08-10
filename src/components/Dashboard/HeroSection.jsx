"use client"

import { Box, Container } from "@mui/material"
import { Sparkles, ArrowRight, Workflow, Bot, Cpu, BrainCircuit, Database, MessageSquare } from "lucide-react"
import CustomGradientButton from "@/components/Common/CustomGradientButton"


export default function HeroSection({ handleDrawerOpen }) {

  return (
    <Box className="relative overflow-hidden bg-transparent min-h-[calc(100vh-60px)] flex items-center">
      {/* Section background blurs */}
      <div className="pointer-events-none absolute top-10 -left-40 w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-indigo-100/40 blur-[100px]" />

      <Container maxWidth="lg" className="!px-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-10 lg:py-0">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-3 py-1 rounded-full mb-4">
              <Sparkles size={14} />
              <span className="text-xs font-semibold tracking-wide">
                Future of AI Agent Development
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl  !text-slate-900 !leading-tight">
              Build Intelligent
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[var(--primary-color)]">
                AI Agents Effortlessly
              </span>
            </h1>

            <p className="text-[15px] text-slate-700 mt-4">
              Transform your ideas into powerful AI agents with our intuitive visual builder.
            </p>
            <p className="text-[15px] text-slate-700">
              No coding required—just drag, drop, and deploy intelligent automation solutions.
            </p>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--primary-color)]" />
                Visual node-based builder
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--primary-color)]" />
                Reusable workflows & templates
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--primary-color)]" />
                Multi-tool integrations
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--primary-color)]" />
                One-click deploy
              </li>
            </ul>

            <div className="mt-8 flex items-center gap-4">
              <CustomGradientButton text="Start Building" onClick={handleDrawerOpen} />
              <button className="flex items-center gap-2 text-[14px] font-medium text-slate-600 hover:text-[var(--primary-color)] transition-colors">
                Watch Demo
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Animated Orbital Visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-[380px] h-[380px]">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--primary-color)]/15 animate-pulse-ring" />
              {/* Middle ring */}
              <div className="absolute inset-8 rounded-full border border-[var(--primary-color)]/10" />
              {/* Inner ring */}
              <div className="absolute inset-20 rounded-full border border-blue-200/40" />

              {/* Center core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-[var(--primary-color)] flex items-center justify-center shadow-xl shadow-blue-500/25 animate-float-slow">
                    <BrainCircuit size={36} className="text-white" />
                  </div>
                  {/* Core glow */}
                  <div className="absolute -inset-3 rounded-2xl bg-blue-500/10 blur-xl" />
                </div>
              </div>

              {/* Orbiting node 1 - Bot */}
              <div className="absolute inset-0 animate-orbit">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-14 w-14 rounded-xl bg-white border border-blue-200 shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                    <Bot size={22} className="text-[var(--primary-color)]" />
                  </div>
                </div>
              </div>

              {/* Orbiting node 2 - Workflow */}
              <div className="absolute inset-0 animate-orbit" style={{ animationDelay: "-4s" }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-14 w-14 rounded-xl bg-white border border-purple-200 shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                    <Workflow size={22} className="text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Orbiting node 3 - Cpu */}
              <div className="absolute inset-0 animate-orbit" style={{ animationDelay: "-8s" }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-14 w-14 rounded-xl bg-white border border-green-200 shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                    <Cpu size={22} className="text-green-600" />
                  </div>
                </div>
              </div>

              {/* Inner orbiting node 1 - Database */}
              <div className="absolute inset-0 animate-orbit-reverse">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-10 w-10 rounded-lg bg-white border border-amber-200 shadow-md flex items-center justify-center">
                    <Database size={16} className="text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Inner orbiting node 2 - MessageSquare */}
              <div className="absolute inset-0 animate-orbit-reverse" style={{ animationDelay: "-5s" }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-10 w-10 rounded-lg bg-white border border-rose-200 shadow-md flex items-center justify-center">
                    <MessageSquare size={16} className="text-rose-500" />
                  </div>
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute top-6 right-12 h-2 w-2 rounded-full bg-blue-400/50 animate-float" />
              <div className="absolute bottom-12 left-8 h-1.5 w-1.5 rounded-full bg-purple-400/40 animate-float-slow" />
              <div className="absolute top-1/3 left-4 h-2.5 w-2.5 rounded-full bg-[var(--primary-color)]/20 animate-float" style={{ animationDelay: "-2s" }} />
              <div className="absolute bottom-8 right-16 h-2 w-2 rounded-full bg-green-400/30 animate-float-slow" style={{ animationDelay: "-1s" }} />
            </div>
          </div>
        </div>
      </Container>
    </Box>
  )
}