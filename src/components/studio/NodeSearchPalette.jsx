"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { Bot, Cpu, Workflow, FileInput, CloudUpload, Layers, Server, CornerDownLeft } from "lucide-react";

const EMPTY_LIST = [];
const EMPTY_MAP = {};

const CATEGORY_META = {
  agent: { label: "Agents", icon: Bot, color: "text-emerald-600" },
  model: { label: "Models", icon: Cpu, color: "text-blue-600" },
  tool: { label: "Tools", icon: Workflow, color: "text-violet-600" },
  agentflow: { label: "AgentFlows", icon: Layers, color: "text-indigo-600" },
  input: { label: "Inputs", icon: FileInput, color: "text-cyan-600" },
  output: { label: "Outputs", icon: CloudUpload, color: "text-orange-600" },
  mcp: { label: "MCP tools", icon: Server, color: "text-slate-600" },
};

/**
 * A single flat, memoized catalog. Recomputed only when one of the underlying
 * Redux arrays actually changes identity, never per keystroke.
 */
const selectCatalog = createSelector(
  [
    (state) => state.studio.tools || EMPTY_LIST,
    (state) => state.studio.agents || EMPTY_LIST,
    (state) => state.studio.models || EMPTY_LIST,
    (state) => state.studio.inputs || EMPTY_LIST,
    (state) => state.studio.outputs || EMPTY_LIST,
    (state) => state.studio.prebuiltFlows || EMPTY_LIST,
    (state) => state.studio.mcpTools || EMPTY_MAP,
  ],
  (tools, agents, models, inputs, outputs, prebuiltFlows, mcpTools) => {
    const entries = [];

    const push = (items, category, prefix) => {
      (items || []).forEach((item, index) => {
        if (!item) return;
        entries.push({
          key: `${prefix}-${item.id ?? index}`,
          category,
          label: item.displayName || item.name || "Untitled",
          description: item.description || "",
          spec: {
            ...item,
            displayName: item.displayName || item.name,
            name: item.displayName || item.name,
          },
          nodeType: item.type || category,
        });
      });
    };

    push(agents, "agent", "agent");
    push(models, "model", "model");
    push(tools, "tool", "tool");
    push(inputs, "input", "input");
    push(outputs, "output", "output");

    (prebuiltFlows || []).forEach((flow, index) => {
      if (!flow) return;
      entries.push({
        key: `flow-${flow.id ?? index}`,
        category: "agentflow",
        label: flow.name || "Untitled flow",
        description: flow.description || "",
        spec: { ...flow, displayName: flow.name, name: flow.name, type: "agentflow" },
        nodeType: "agentflow",
      });
    });

    Object.keys(mcpTools || {}).forEach((serverName) => {
      (mcpTools[serverName] || []).forEach((tool, index) => {
        if (!tool) return;
        entries.push({
          key: `mcp-${serverName}-${index}`,
          category: "mcp",
          label: tool.displayName || tool.name || "Untitled",
          description: serverName,
          spec: {
            ...tool,
            displayName: tool.displayName || tool.name,
            name: tool.displayName || tool.name,
          },
          nodeType: tool.type || "tool",
        });
      });
    });

    return entries;
  }
);

/**
 * Ctrl+K palette: fuzzy-ish search across the whole component catalog, adds the
 * selected component to the middle of the current viewport.
 */
const NodeSearchPalette = memo(function NodeSearchPalette({ open, onClose, onSelect }) {
  const catalog = useSelector(selectCatalog);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return catalog.slice(0, 40);
    return catalog
      .filter(
        (entry) =>
          entry.label.toLowerCase().includes(term) ||
          entry.category.toLowerCase().includes(term) ||
          (entry.description || "").toLowerCase().includes(term)
      )
      .slice(0, 40);
  }, [catalog, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const entry = results[activeIndex];
      if (entry) {
        onSelect(entry);
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1400] flex items-start justify-center bg-slate-900/30 pt-[12vh] backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-[min(560px,92vw)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search agents, models, tools, flows…"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[46vh] overflow-y-auto py-1">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-slate-400">No components found</p>
          ) : (
            results.map((entry, index) => {
              const meta = CATEGORY_META[entry.category] || CATEGORY_META.tool;
              const Icon = meta.icon;
              const active = index === activeIndex;
              return (
                <button
                  key={entry.key}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    onSelect(entry);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                    active ? "bg-indigo-50" : "hover:bg-slate-50"
                  }`}
                >
                  <Icon size={15} className={meta.color} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {entry.label}
                    </span>
                    {entry.description && (
                      <span className="block truncate text-[11px] text-slate-400">
                        {entry.description}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                    {meta.label}
                  </span>
                  {active && <CornerDownLeft size={12} className="shrink-0 text-indigo-400" />}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-[10px] text-slate-400">
          <span>↑ ↓ to navigate · Enter to add</span>
          <span>{results.length} result{results.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
});

export default NodeSearchPalette;
