"use client";

import React from "react";
import { Dialog } from "@mui/material";
import { AlertTriangle, Info, Trash2, X } from "lucide-react";

/**
 * Shared confirmation dialog.
 *
 * Used anywhere a destructive or lossy action needs an explicit acknowledgement
 * (deleting a flow, leaving the studio with unsaved work, deleting a global
 * dictionary variable...). Styling intentionally mirrors the rest of the
 * enterprise surface: white card, slate borders, indigo/red accents.
 */
const TONES = {
  danger: {
    icon: Trash2,
    iconWrap: "bg-red-50 text-red-600 border-red-100",
    confirmBtn: "bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-red-500/20",
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: "bg-amber-50 text-amber-600 border-amber-100",
    confirmBtn: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-amber-500/20",
  },
  info: {
    icon: Info,
    iconWrap: "bg-indigo-50 text-indigo-600 border-indigo-100",
    confirmBtn: "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-500/20",
  },
};

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  description = "",
  details = null,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  secondaryLabel = null,
  tone = "danger",
  busy = false,
  onConfirm,
  onSecondary,
  onCancel,
}) => {
  const toneConfig = TONES[tone] || TONES.danger;
  const ToneIcon = toneConfig.icon;

  return (
    <Dialog
      open={Boolean(open)}
      onClose={busy ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <div className="p-5">
        <div className="flex items-start gap-3.5">
          <div
            className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center ${toneConfig.iconWrap}`}
          >
            <ToneIcon size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-semibold text-slate-800 tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
                {description}
              </p>
            )}
            {details && (
              <div className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11.5px] font-mono text-slate-600 break-all">
                {details}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              disabled={busy}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              {secondaryLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-60 ${toneConfig.confirmBtn}`}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
