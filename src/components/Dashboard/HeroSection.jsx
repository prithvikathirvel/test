"use client"

import { Box, Container } from "@mui/material"
import { Sparkles } from "lucide-react"


export default function HeroSection() {

  return (
    <Box className="relative overflow-hidden bg-transparent">
      {/* <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full bg-[var(--primary-color)]/10 blur-3xl" /> */}
      {/* <div className="pointer-events-none absolute -right-16 w-72 h-72 rounded-full bg-[var(--primary-color)]/20 blur-3xl" /> */}

      <Container maxWidth="lg" className="!px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-14">
          <div>
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
          </div>
        </div>

      </Container>
    </Box>
  )
}