"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Tooltip, IconButton, CircularProgress, Dialog } from "@mui/material";
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
  Pencil,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  isDirty = false,
  onRequestNavigate,
  onUpdateFlowDetails,
}) => {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [draftDetails, setDraftDetails] = useState({ name: flow?.name || "", description: flow?.description || "" });

  useEffect(() => {
    setDraftDetails({ name: flow?.name || "", description: flow?.description || "" });
  }, [flow?.name, flow?.description]);

  const navigateToFlows = React.useCallback(() => {
    try {
      router.push("/studio");
    } catch {
      window.location.href = "/studio";
    }
  }, [router]);

  const handleBackToFlows = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    // Route through the parent's guard so unsaved canvas changes can be
    // confirmed before we leave the studio.
    if (typeof onRequestNavigate === "function") {
      onRequestNavigate(navigateToFlows);
      return;
    }
    navigateToFlows();
  };

  return (
    <Box className="w-full bg-white border-b border-gray-200/80 px-4 py-2 flex items-center justify-between min-h-[52px] z-30 shadow-2xs">
      {/* Left: Back Navigation & Flow Identity */}
      <Box className="flex items-center gap-3 min-w-0">
        <Tooltip title="Back to All Flows">
          <button
            type="button"
            onClick={handleBackToFlows}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
            <Workflow size={14} />
          </div>

          <div className="min-w-0 flex items-center gap-2">
            <Typography className="!text-[13.5px] !font-semibold !text-slate-800 !tracking-tight !truncate max-w-[180px] sm:max-w-[280px]">
              {flow?.name || "Agent Workflow"}
            </Typography>
            <Tooltip title="Edit flow name and description">
              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                className="hidden sm:inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <Pencil size={12} />
              </button>
            </Tooltip>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200">
              v{flow?.version || "1.0.0"}
            </span>
            {/* Real save status — was previously hardcoded to "Saved". */}
            <Tooltip
              title={
                isDirty
                  ? "This workflow has changes that have not been saved yet"
                  : "All changes are saved"
              }
            >
              <div
                className={`hidden md:flex items-center gap-1.5 ml-2 text-[11px] ${
                  isDirty ? "text-amber-600" : "text-slate-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isDirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                  }`}
                />
                <span>{isDirty ? "Unsaved changes" : "Saved"}</span>
              </div>
            </Tooltip>
          </div>
        </div>
      </Box>

      {/* Center: Canvas / Code Switcher & Voice AI */}
      <Box className="hidden lg:flex items-center gap-2.5">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/60">
          <button
            type="button"
            onClick={() => toggleViewMode && onToggleViewMode()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              !toggleViewMode
                ? "bg-white text-slate-800 font-semibold shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Workflow size={13} /> Canvas
          </button>
          <button
            type="button"
            onClick={() => !toggleViewMode && onToggleViewMode()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              toggleViewMode
                ? "bg-white text-slate-800 font-semibold shadow-2xs"
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
              type="button"
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
          type="button"
          onClick={onConfigureInputsClick}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors"
        >
          <Sliders size={13} /> Dictionary
        </button>


        <button
          type="button"
          onClick={() => onSaveFlow && onSaveFlow()}
          disabled={isSavingFlow}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-2xs transition-colors disabled:opacity-60 ${
            isDirty
              ? "text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200"
              : "text-slate-700 bg-white hover:bg-slate-50 border-slate-200"
          }`}
        >
          {isSavingFlow ? <CircularProgress size={12} color="inherit" /> : <Save size={13} />}
          <span>{isSavingFlow ? "Saving..." : isDirty ? "Save changes" : "Save"}</span>
        </button>

        <button
          type="button"
          onClick={onDeployFlow}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
        >
          <Rocket size={13} /> Deploy
        </button>
      </Box>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 20px 45px -28px rgba(15,23,42,0.45)" } }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">Edit flow details</h3>
            <p className="mt-0.5 text-[11.5px] text-slate-400">Updates are saved through the workflow update API.</p>
          </div>
          <IconButton onClick={() => setDetailsOpen(false)} size="small" className="!text-slate-400 hover:!text-slate-700">
            <X size={15} />
          </IconButton>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold text-slate-600">Flow name</label>
            <input
              value={draftDetails.name}
              onChange={(event) => setDraftDetails((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold text-slate-600">Description</label>
            <textarea
              value={draftDetails.description}
              onChange={(event) => setDraftDetails((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <button onClick={() => setDetailsOpen(false)} className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white">Cancel</button>
          <button
            onClick={() => { onUpdateFlowDetails?.(draftDetails); setDetailsOpen(false); }}
            disabled={!draftDetails.name?.trim() || !draftDetails.description?.trim()}
            className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
          >
            Save details
          </button>
        </div>
      </Dialog>
    </Box>
  );
};

export default StudioHeader;
