"use client";

import React from "react";
import { Box, Typography, Tooltip, IconButton, CircularProgress } from "@mui/material";
import {
  ArrowLeft,
  Workflow,
  Code,
  Play,
  Save,
  Rocket,
  Sliders,
  Mic,
  MicOff,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const StudioHeader = ({
  flow,
  flowId,
  toggleViewMode,
  onToggleViewMode,
  voiceEnabled,
  onVoiceToggle,
  onVoiceSettingsClick,
  onConfigureInputsClick,
  onRunFlow,
  isFlowRunning,
  onSaveFlow,
  isSavingFlow,
  onDeployFlow,
}) => {
  return (
    <Box className="w-full bg-white border-b border-gray-200/80 px-4 py-2 flex items-center justify-between min-h-[52px] z-30 shadow-2xs">
      {/* Left: Breadcrumbs & Flow Identity */}
      <Box className="flex items-center gap-3 min-w-0">
        <Link href="/studio" className="no-underline">
          <Tooltip title="Back to Flows">
            <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={16} />
            </button>
          </Tooltip>
        </Link>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Workflow size={14} />
          </div>

          <div className="min-w-0 flex items-center gap-2">
            <Typography className="!text-[13.5px] !font-semibold !text-slate-900 !tracking-tight !truncate max-w-[180px] sm:max-w-[280px]">
              {flow?.name || "Agent Workflow"}
            </Typography>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
              v{flow?.version || "1.0.0"}
            </span>
            <div className="hidden md:flex items-center gap-1.5 ml-2 text-[11px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Saved</span>
            </div>
          </div>
        </div>
      </Box>

      {/* Center: Canvas / Code Switcher & Voice AI */}
      <Box className="hidden lg:flex items-center gap-2.5">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/60">
          <button
            onClick={() => toggleViewMode && onToggleViewMode()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              !toggleViewMode
                ? "bg-white text-slate-900 font-semibold shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Workflow size={13} /> Canvas
          </button>
          <button
            onClick={() => !toggleViewMode && onToggleViewMode()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              toggleViewMode
                ? "bg-white text-slate-900 font-semibold shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code size={13} /> JSON Spec
          </button>
        </div>

        {/* Voice AI Trigger */}
        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
          <Tooltip title={voiceEnabled ? "Voice Agent Active" : "Enable Voice Agent Mode"}>
            <button
              onClick={onVoiceToggle}
              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                voiceEnabled
                  ? "text-emerald-700 bg-emerald-50 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {voiceEnabled ? <Mic size={13} className="text-emerald-600" /> : <MicOff size={13} />}
              <span>{voiceEnabled ? "Voice On" : "Voice Off"}</span>
            </button>
          </Tooltip>

          {voiceEnabled && (
            <Tooltip title="Voice Settings">
              <IconButton onClick={onVoiceSettingsClick} size="small" className="!p-1 !text-slate-400 hover:!text-slate-700">
                <Settings size={13} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </Box>

      {/* Right: Studio Primary Action Toolbar */}
      <Box className="flex items-center gap-2">
        <button
          onClick={onConfigureInputsClick}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors"
        >
          <Sliders size={13} /> Inputs
        </button>

        <button
          onClick={onRunFlow}
          disabled={isFlowRunning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors disabled:opacity-60"
        >
          {isFlowRunning ? <CircularProgress size={12} color="inherit" /> : <Play size={13} className="fill-slate-800 text-slate-800" />}
          <span>{isFlowRunning ? "Running..." : "Test Run"}</span>
        </button>

        <button
          onClick={onSaveFlow}
          disabled={isSavingFlow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors disabled:opacity-60"
        >
          {isSavingFlow ? <CircularProgress size={12} color="inherit" /> : <Save size={13} />}
          <span>{isSavingFlow ? "Saving..." : "Save"}</span>
        </button>

        <button
          onClick={onDeployFlow}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors"
        >
          <Rocket size={13} /> Deploy
        </button>
      </Box>
    </Box>
  );
};

export default StudioHeader;
