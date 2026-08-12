"use client";

import { memo } from "react";
import { Panel } from "reactflow";
import { Tooltip } from "@mui/material";
import {
  Undo2,
  Redo2,
  Maximize2,
  Grid3x3,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyStart,
  Search,
} from "lucide-react";

const buttonClass =
  "flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Floating canvas toolbar. Rendered inside a React Flow `<Panel>` so it lives in
 * the canvas DOM without being affected by pan/zoom transforms.
 */
const CanvasToolbar = memo(function CanvasToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onLayoutHorizontal,
  onLayoutVertical,
  onFitView,
  snapToGrid,
  onToggleSnap,
  onOpenSearch,
}) {
  return (
    <Panel position="top-right" className="!m-3">
      <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">
        <Tooltip title="Undo (Ctrl+Z)">
          <span>
            <button type="button" className={buttonClass} onClick={onUndo} disabled={!canUndo}>
              <Undo2 size={14} />
            </button>
          </span>
        </Tooltip>
        <Tooltip title="Redo (Ctrl+Shift+Z)">
          <span>
            <button type="button" className={buttonClass} onClick={onRedo} disabled={!canRedo}>
              <Redo2 size={14} />
            </button>
          </span>
        </Tooltip>

        <span className="mx-1 h-4 w-px bg-slate-200" />

        <Tooltip title="Auto layout — left to right">
          <button type="button" className={buttonClass} onClick={onLayoutHorizontal}>
            <AlignHorizontalJustifyStart size={14} />
          </button>
        </Tooltip>
        <Tooltip title="Auto layout — top to bottom">
          <button type="button" className={buttonClass} onClick={onLayoutVertical}>
            <AlignVerticalJustifyStart size={14} />
          </button>
        </Tooltip>
        <Tooltip title="Fit view (Shift+1)">
          <button type="button" className={buttonClass} onClick={onFitView}>
            <Maximize2 size={14} />
          </button>
        </Tooltip>

        <span className="mx-1 h-4 w-px bg-slate-200" />

        <Tooltip title={snapToGrid ? "Snap to grid: on" : "Snap to grid: off"}>
          <button
            type="button"
            onClick={onToggleSnap}
            className={`${buttonClass} ${
              snapToGrid ? "!bg-indigo-50 !text-indigo-600" : ""
            }`}
          >
            <Grid3x3 size={14} />
          </button>
        </Tooltip>
        <Tooltip title="Search & add node (Ctrl+K)">
          <button type="button" className={buttonClass} onClick={onOpenSearch}>
            <Search size={14} />
          </button>
        </Tooltip>
      </div>
    </Panel>
  );
});

export default CanvasToolbar;
