"use client";

import React from "react";
import { Bot, Workflow, Database, Layers, Cpu, Sparkles } from "lucide-react";

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

/** Places a satellite on the ring edge from a polar angle (degrees). */
const satellitePosition = (angle) => {
  const radians = (angle * Math.PI) / 180;
  return {
    left: `${50 + 50 * Math.cos(radians)}%`,
    top: `${50 + 50 * Math.sin(radians)}%`,
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
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 shadow-sm whitespace-nowrap">
          <span className={`flex h-6 w-6 items-center justify-center rounded-lg border ${tone}`}>
            <Icon size={13} />
          </span>
          <span className="text-[11px] font-semibold text-slate-700 tracking-tight">
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
      <div className="absolute inset-0 rounded-full border border-dashed border-slate-200" />
      <div className="absolute inset-[17%] rounded-full border border-dashed border-slate-200/90" />
      <div className="absolute inset-[34%] rounded-full border border-slate-100 bg-white/40" />

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

      {/* Core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl text-center w-[168px]">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white/90 animate-pulse" />
            Live
          </span>

          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25">
            <Sparkles size={18} />
          </div>

          <p className="text-[13px] font-bold text-slate-900 tracking-tight leading-tight">
            Orchestration Core
          </p>
          <p className="mt-1 text-[10.5px] text-slate-500 leading-snug">
            Graph runtime &amp; state
          </p>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-2">
            <span className="text-[9.5px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-px">
              42ms
            </span>
            <span className="text-[9.5px] font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded px-1.5 py-px">
              6 nodes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
