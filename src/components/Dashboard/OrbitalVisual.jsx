"use client";

import React from "react";
import { Bot, Workflow, Database, Layers, Cpu, Sparkles, TrendingUp,BrainCircuit } from "lucide-react";

/**
 * Hero orbital visual.
 *
 * Sits to the right of the hero copy on large screens and communicates the
 * product model at a glance: an orchestration core with agents, tools, models
 * and knowledge sources revolving around it.
 *
 * Theme notes
 * -----------
 * The reference markup used a dark, high-saturation palette. This version is
 * re-skinned to the app shell (white surfaces, `slate` borders/text, `indigo`
 * as the single accent) so it reads as part of the same product as the header,
 * the studio canvas and the cards below it.
 *
 * Motion notes
 * ------------
 * Each ring rotates as a whole; every satellite carries the mirrored animation
 * with the identical duration so its own rotation is cancelled out and the card
 * never appears upside down. `prefers-reduced-motion` disables all of it via
 * `globals.css`.
 */

/** Fixed bar heights — deterministic between server and client render. */
const SPARKLINE = [38, 52, 44, 68, 58, 76, 64, 88];

const INNER_SATELLITES = [
  { id: "agents", label: "Agents", Icon: Bot, angle: 0, tone: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  { id: "tools", label: "Tools", Icon: Workflow, angle: 120, tone: "text-blue-600 bg-blue-50 border-blue-100" },
  { id: "models", label: "Models", Icon: Cpu, angle: 240, tone: "text-violet-600 bg-violet-50 border-violet-100" },
];

const OUTER_SATELLITES = [
  { id: "knowledge", label: "Knowledge", Icon: Database, angle: 60, tone: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { id: "mcp", label: "MCP Servers", Icon: Layers, angle: 180, tone: "text-cyan-600 bg-cyan-50 border-cyan-100" },
  { id: "flows", label: "Agent Flows", Icon: Sparkles, angle: 300, tone: "text-pink-600 bg-pink-50 border-pink-100" },
];

/**
 * Places a satellite on the ring edge from a polar angle (degrees).
 *
 * The result is rounded to a fixed number of decimals on purpose. Raw
 * `Math.cos`/`Math.sin` output differs in its last ULP between the Node server
 * runtime and the browser (e.g. `24.99999999999998` vs `25`), and React compares
 * the serialised style string during hydration — an unrounded value throws
 * "server rendered HTML didn't match the client". Rounding makes the string
 * deterministic across both runtimes.
 */
const satellitePosition = (angle) => {
  const radians = (angle * Math.PI) / 180;
  return {
    left: `${(50 + 50 * Math.cos(radians)).toFixed(3)}%`,
    top: `${(50 + 50 * Math.sin(radians)).toFixed(3)}%`,
  };
};

function Satellite({ label, Icon, angle, tone, counterClass, duration }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={satellitePosition(angle)}
    >
      {/* Counter-rotation keeps the card upright while the ring spins. */}
      <div
        className={counterClass}
        style={{ animationDuration: duration }}
      >
        <div className="flex items-center gap-2 rounded-xl border border-slate-300/90 bg-white px-3 py-2 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.22)] whitespace-nowrap">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${tone}`}>
            <Icon size={15} />
          </span>
          <span className="text-[12px] font-semibold text-slate-800 tracking-tight">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function OrbitalVisual({ className = "" }) {
  return (
    <div className={`relative mx-auto w-full max-w-[420px] aspect-square ${className}`}>
      {/* Ambient wash behind the rings, tinted to the hero gradient. */}
      <div className="pointer-events-none absolute inset-8 rounded-full bg-gradient-to-br from-indigo-200/40 via-violet-200/25 to-transparent blur-3xl animate-orbit-glow" />

      {/* Static guide rings (do not rotate, so the geometry stays calm). */}
      <div className="absolute inset-0 rounded-full border border-dashed border-slate-300" />
      <div className="absolute inset-[17%] rounded-full border border-dashed border-slate-300/80" />
      <div className="absolute inset-[34%] rounded-full border border-slate-200 bg-white/50" />

      {/* Outer ring */}
      <div className="absolute inset-0 animate-orbit" style={{ animationDuration: "34s" }}>
        {OUTER_SATELLITES.map((satellite) => (
          <Satellite
            key={satellite.id}
            {...satellite}
            counterClass="animate-orbit-reverse"
            duration="34s"
          />
        ))}
      </div>

      {/* Inner ring turns the other way for a subtle parallax. */}
      <div className="absolute inset-[17%] animate-orbit-reverse" style={{ animationDuration: "26s" }}>
        {INNER_SATELLITES.map((satellite) => (
          <Satellite
            key={satellite.id}
            {...satellite}
            counterClass="animate-orbit"
            duration="26s"
          />
        ))}
      </div>

      {/* Core — mirrors the metric-card language used on the dashboard and the
          dictionary page: uppercase micro-label, one large figure, a muted
          caption, and a slim delta row. Same vocabulary, no new visual style. */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
         <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-600 to-[var(--primary-color)] flex items-center justify-center shadow-xl shadow-blue-500/25 animate-float-slow">
                    <BrainCircuit size={36} className="text-white" />
        </div>
      </div>

    </div>
  );
}
