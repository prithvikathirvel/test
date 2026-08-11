"use client";

import React from "react";
import { Dialog, Box, Typography, IconButton } from "@mui/material";
import { AlertTriangle, X, ArrowRight, Variable, CheckCircle2 } from "lucide-react";

export default function FlowValidationModal({
  open,
  onClose,
  errors = [],
  onFixNode,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          p: { xs: 3, sm: 4 },
        },
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              Output Variable Conflicts Detected
            </h3>
            <p className="text-xs text-slate-400">
              {errors.length} issue{errors.length !== 1 ? "s" : ""} must be resolved before proceeding
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-4 text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
        Every node output variable must have a unique name across the canvas. Conflicting variable names cause runtime overwrites and break downstream references.
      </div>

      {/* Conflicting Items List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {errors.map((err, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-white rounded-xl border border-amber-200/90 shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Variable size={14} className="text-indigo-600 shrink-0" />
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {`{{${err.variableName}}}`}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                Collision
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {err.message}
            </p>

            {/* Quick Action Buttons to jump to conflicting nodes */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
              {err.occurrences ? (
                err.occurrences.map((occ, oIdx) => (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => onFixNode?.(occ.nodeId, occ.node)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors"
                  >
                    <span>Rename in "{occ.nodeName}"</span>
                    <ArrowRight size={12} />
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => onFixNode?.(err.nodeId, err.node)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors"
                >
                  <span>Fix in "{err.nodeName}"</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Button */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Dismiss & Edit Canvas
        </button>
      </div>
    </Dialog>
  );
}
