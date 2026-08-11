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
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import CustomButton from "@/components/Common/CustomButton";

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
    <Box className="w-full bg-white border-b border-slate-200/90 px-4 py-2.5 flex items-center justify-between min-h-[58px] z-30 shadow-2xs">
      {/* Left: Breadcrumbs & Flow Identity */}
      <Box className="flex items-center gap-3 min-w-0">
        <Link href="/studio" className="no-underline">
          <Tooltip title="Back to All Flows">
            <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={16} />
            </div>
          </Tooltip>
        </Link>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80">
            <Workflow size={15} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Typography className="!text-[14px] !font-bold !text-slate-900 !tracking-tight !truncate max-w-[200px] sm:max-w-[320px]">
                {flow?.name || "Agentic Workflow Studio"}
              </Typography>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                v{flow?.version || "1.0.0"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Auto-synced to cluster</span>
            </div>
          </div>
        </div>
      </Box>

      {/* Center: Canvas / Code Switcher & Voice AI */}
      <Box className="hidden lg:flex items-center gap-2">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/80">
          <button
            onClick={() => toggleViewMode && onToggleViewMode()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              !toggleViewMode
                ? "bg-white text-slate-900 font-semibold shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Workflow size={13} /> Visual Canvas
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
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/80">
          <Tooltip title={voiceEnabled ? "Voice Agent Active - Click to Disable" : "Enable Voice Agent Mode"}>
            <button
              onClick={onVoiceToggle}
              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                voiceEnabled
                  ? "text-emerald-700 bg-emerald-50 font-semibold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {voiceEnabled ? <Mic size={14} className="text-emerald-600" /> : <MicOff size={14} />}
              <span>{voiceEnabled ? "Voice Active" : "Voice Off"}</span>
            </button>
          </Tooltip>

          {voiceEnabled && (
            <Tooltip title="Voice Configuration">
              <IconButton onClick={onVoiceSettingsClick} size="small" className="!p-1 !text-slate-400 hover:!text-slate-700">
                <Settings size={14} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </Box>

      {/* Right: Studio Primary Action Toolbar */}
      <Box className="flex items-center gap-2">
        <CustomButton
          variant="outlined"
          size="small"
          startIcon={<Sliders size={14} />}
          onClick={onConfigureInputsClick}
          className="!hidden md:!inline-flex"
        >
          Inputs
        </CustomButton>

        <CustomButton
          variant="outlined"
          size="small"
          startIcon={isFlowRunning ? <CircularProgress size={13} color="inherit" /> : <Play size={14} className="fill-blue-600 text-blue-600" />}
          onClick={onRunFlow}
          disabled={isFlowRunning}
          className="!border-blue-200 !bg-blue-50/50 !text-blue-700 hover:!bg-blue-100/70"
        >
          {isFlowRunning ? "Testing..." : "Test Run"}
        </CustomButton>

        <CustomButton
          variant="outlined"
          size="small"
          startIcon={isSavingFlow ? <CircularProgress size={13} color="inherit" /> : <Save size={14} />}
          onClick={onSaveFlow}
          disabled={isSavingFlow}
        >
          {isSavingFlow ? "Saving..." : "Save"}
        </CustomButton>

        <CustomButton
          variant="contained"
          size="small"
          startIcon={<Rocket size={14} />}
          onClick={onDeployFlow}
          className="!shadow-sm !shadow-blue-500/20"
        >
          Deploy
        </CustomButton>
      </Box>
    </Box>
  );
};

export default StudioHeader;
