import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import { 
  Bot, 
  Workflow, 
  Database, 
  Circle, 
  CloudUpload, 
  GitBranch, 
  RotateCcw, 
  TextCursorInput,
  HelpCircle,
  Dot
} from 'lucide-react';
import { useSelector } from "react-redux";
import { memo, useEffect, useMemo } from "react";
import { Tooltip } from "@mui/material";
import { createSelector } from "@reduxjs/toolkit";

const EMPTY_LIST = [];

/**
 * The catalog lookups below used to spread every Redux catalog and run `.find()`
 * inside each node on every render (O(nodes x catalog) per frame while dragging).
 * The catalogs are only ever used to answer "is this node type a known catalog
 * type?", so a single memoized Set is enough and keeps the identity stable
 * between renders.
 */
const selectCatalogTypes = createSelector(
  [
    (state) => state.studio.tools || EMPTY_LIST,
    (state) => state.studio.agents || EMPTY_LIST,
    (state) => state.studio.models || EMPTY_LIST,
    (state) => state.studio.inputs || EMPTY_LIST,
    (state) => state.studio.outputs || EMPTY_LIST,
    (state) => state.studio.flows || EMPTY_LIST,
  ],
  (tools, agents, models, inputs, outputs, agentflows) => {
    const types = new Set();
    [tools, agents, models, inputs, outputs, agentflows].forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((item) => {
        if (item?.type) types.add(item.type);
      });
    });
    return types;
  }
);

/** Sorted list of every node type that has to resolve to `CustomNode`. */
const selectNodeTypeKeys = createSelector([selectCatalogTypes], (types) =>
  [...types].sort()
);

const getNodeIcon = (type, catalogTypes) => {
  switch (type?.toLowerCase()) {
    case "react_agent":
    case "react_agent_v2": return <Bot size={16} />;
    case "decision": return <GitBranch size={16} />;
    case "iterator": return <RotateCcw size={16} />;
    case "inputs": return <TextCursorInput size={16} />;
    case "output": return <CloudUpload size={16} />;
    case "question": return <HelpCircle size={16} />;
    case "conditions": return <GitBranch size={16} />;
    case "condition": return <GitBranch size={16} />;
    case "start": return <Circle size={16} />;
  }

  if (!catalogTypes.has(type)) return <Workflow size={16} />;

  switch (type?.toLowerCase()) {
    case "tool": return <Workflow size={16} />;
    case "agent": return <Bot size={16} />;
    case "model": return <Database size={16} />;
    case "agentflow": return <Circle size={16} />;
    default: return <Circle size={16} />;
  }
};

/** Per-type solid accents — distinct colors, no gradients. */
const NODE_ACCENTS = {
  tool:       { bar: "#6366f1", iconBg: "bg-indigo-500",  chip: "bg-indigo-50 text-indigo-700 border-indigo-200",   ring: "rgba(99,102,241,0.18)", handle: "#6366f1" },
  agent:      { bar: "#10b981", iconBg: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "rgba(16,185,129,0.18)", handle: "#10b981" },
  react_agent:{ bar: "#10b981", iconBg: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "rgba(16,185,129,0.18)", handle: "#10b981" },
  react_agent_v2:{ bar: "#10b981", iconBg: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "rgba(16,185,129,0.18)", handle: "#10b981" },
  model:      { bar: "#8b5cf6", iconBg: "bg-violet-500",  chip: "bg-violet-50 text-violet-700 border-violet-200",   ring: "rgba(139,92,246,0.18)", handle: "#8b5cf6" },
  inputs:     { bar: "#0ea5e9", iconBg: "bg-sky-500",     chip: "bg-sky-50 text-sky-700 border-sky-200",           ring: "rgba(14,165,233,0.18)", handle: "#0ea5e9" },
  output:     { bar: "#64748b", iconBg: "bg-slate-500",   chip: "bg-slate-100 text-slate-600 border-slate-200",     ring: "rgba(100,116,139,0.18)", handle: "#64748b" },
  agentflow:  { bar: "#ec4899", iconBg: "bg-pink-500",    chip: "bg-pink-50 text-pink-700 border-pink-200",         ring: "rgba(236,72,153,0.18)", handle: "#ec4899" },
  decision:   { bar: "#f59e0b", iconBg: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200",     ring: "rgba(245,158,11,0.18)", handle: "#f59e0b" },
  conditions: { bar: "#f59e0b", iconBg: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200",     ring: "rgba(245,158,11,0.18)", handle: "#f59e0b" },
  condition:  { bar: "#f59e0b", iconBg: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200",     ring: "rgba(245,158,11,0.18)", handle: "#f59e0b" },
  iterator:   { bar: "#6366f1", iconBg: "bg-indigo-500",  chip: "bg-indigo-50 text-indigo-700 border-indigo-200",   ring: "rgba(99,102,241,0.18)", handle: "#6366f1" },
  question:   { bar: "#a855f7", iconBg: "bg-purple-500",  chip: "bg-purple-50 text-purple-700 border-purple-200",   ring: "rgba(168,85,247,0.18)", handle: "#a855f7" },
  start:      { bar: "#10b981", iconBg: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "rgba(16,185,129,0.18)", handle: "#10b981" },
};

const DEFAULT_ACCENT = { bar: "#94a3b8", iconBg: "bg-slate-400", chip: "bg-slate-100 text-slate-600 border-slate-200", ring: "rgba(100,116,139,0.18)", handle: "#94a3b8" };

const getNodeAccent = (type) => NODE_ACCENTS[type?.toLowerCase()] || DEFAULT_ACCENT;

/** Human-readable label for the type chip ("agentflow" -> "Agent Flow"). */
const TYPE_LABELS = {
  agentflow: "Agent Flow",
  inputs: "Input",
  conditions: "Condition",
  iterator: "Loop",
  react_agent: "ReAct Agent",
  react_agent_v2: "ReAct Agent",
};
const getTypeLabel = (type) => {
  if (!type) return "Node";
  const key = type.toLowerCase();
  if (TYPE_LABELS[key]) return TYPE_LABELS[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
};

/** Shared handle geometry so every port on the canvas looks identical. */
const handleStyle = (color, extra = {}) => ({
  background: color,
  border: `2px solid #ffffff`,
  width: 10,
  height: 10,
  borderRadius: 9999,
  ...extra,
});

/** Module scope: a new array literal per render would defeat every memo below. */
const OPTION_COLORS = [
  { bg: 'bg-blue-500', hex: '#3B82F6' },
  { bg: 'bg-emerald-500', hex: '#10B981' },
  { bg: 'bg-orange-500', hex: '#F97316' },
  { bg: 'bg-rose-500', hex: '#F43F5E' },
  { bg: 'bg-purple-500', hex: '#A855F7' },
  { bg: 'bg-cyan-500', hex: '#06B6D4' },
  { bg: 'bg-amber-500', hex: '#F59E0B' },
  { bg: 'bg-pink-500', hex: '#EC4899' }
];

/** Helper to detect dynamic template variables. */
const isDynamic = (val) => {
  if (!val) return false;
  const str = String(val).trim();
  return str.startsWith('{{') && str.endsWith('}}');
};

const CustomNode = memo(function CustomNode({ id, data, type, selected }) {
  // One memoized selector instead of six raw catalog subscriptions per node.
  const catalogTypes = useSelector(selectCatalogTypes);

  const accent = getNodeAccent(type);
  const icon = useMemo(() => getNodeIcon(type, catalogTypes), [type, catalogTypes]);
  const nodeType = type?.toLowerCase() || data?.type?.toLowerCase() || data?.nodeType?.toLowerCase();
  const optionColors = OPTION_COLORS;

  // Extract condition data from inputParameters for condition nodes
  const conditionData = useMemo(() => {
    if ((nodeType !== "conditions" && nodeType !== "condition") || !data.inputParameters) {
      return { conditions: [] };
    }

    const conditionParam = data.inputParameters.find(param => param.type === 'condition');
    const conditions = conditionParam?.value || [];

    return { conditions };
  }, [nodeType, data.inputParameters]);

  // Extract options data from inputParameters for question and inputs nodes
  const questionData = useMemo(() => {
    // Show options for question type OR inputs type with Question Node name
    const shouldShowOptions = nodeType === "question" || 
                             (nodeType === "inputs" && (data.name === "Question Node" || data.displayName === "Question Node"));
    
    if (!shouldShowOptions || !data.inputParameters) {
      return { questionText: '', options: {} };
    }

    const questionTextParam = data.inputParameters.find(param => param.key === 'question_text');
    const optionsParam = data.inputParameters.find(param => param.key === 'options');
    
    return {
      questionText: questionTextParam?.value || '',
      options: optionsParam?.value || {}
    };
  }, [nodeType, data.inputParameters, data.name, data.displayName]);

  // Check if should show options based on node type and name
  const shouldShowOptionsUI = nodeType === "question" || 
                             (nodeType === "inputs" && (data.name === "Question Node" || data.displayName === "Question Node"));

  // Process options to handle dynamic variables or stringified JSON
  const displayOptions = useMemo(() => {
    let opts = questionData.options;

    // Handle case where opts might be an array of characters
    if (Array.isArray(opts) && opts.length > 0 && opts.every(v => typeof v === 'string' && v.length === 1)) {
      opts = opts.join('');
    }

    // Handle case where opts might be an object map of characters (numeric keys)
    if (typeof opts === 'object' && opts !== null && !Array.isArray(opts)) {
      const keys = Object.keys(opts);
      if (keys.length > 0 && keys.every(k => !isNaN(parseInt(k)) && typeof opts[k] === 'string' && opts[k].length === 1)) {
        opts = Object.values(opts).join('');
      }
    }

    if (typeof opts === 'string') {
      try {
        // Try to parse if it's a valid JSON string (but not a template variable)
        const trimmed = opts.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          const parsed = JSON.parse(trimmed);
          if (typeof parsed === 'object' && parsed !== null) return parsed;
        }
      } catch (e) {
        // Ignore parsing errors for template variables like {{abc}}
      }
    }
    return opts;
  }, [questionData.options]);

  // Condition nodes render one source Handle per condition, so the handle set
  // changes at runtime. React Flow caches handle bounds when a node mounts and
  // will keep using stale positions (edges detach / land on the wrong row)
  // unless we tell it to re-measure. Keyed on the count so it only fires when
  // handles are actually added or removed, never on every render.
  /** Configured-field count shown in the header meta row. */
  const paramCount = useMemo(
    () => (Array.isArray(data.inputParameters) ? data.inputParameters.length : 0),
    [data.inputParameters]
  );

  const conditionCount = conditionData.conditions.length;
  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    if (!id) return;
    if (
      nodeType !== "conditions" &&
      nodeType !== "condition" &&
      nodeType !== "decision" &&
      nodeType !== "iterator"
    ) return;
    updateNodeInternals(id);
  }, [id, nodeType, conditionCount, updateNodeInternals]);

  // `backdrop-blur-sm` was a no-op behind the opaque `bg-white` but still
  // forced a GPU compositing layer for every node, and `transition-all`
  // animated the drag transform. Both are narrowed to what is visible.
  const typeLabel = getTypeLabel(nodeType);
  const nodeTitle = data.displayName || data.name || typeLabel;
  const isReactAgent = nodeType === "react_agent" || nodeType === "react_agent_v2";
  const paramValue = (key) => data.inputParameters?.find((param) => param.key === key)?.value;
  const reactAgentPrompt = isReactAgent ? paramValue("system_prompt") : null;

  return (
    <div
      className={`group relative w-[286px] rounded-xl border bg-white transition-[border-color,background-color,box-shadow] duration-200 ${
        selected ? "border-slate-400 bg-slate-50/40" : "border-slate-200 hover:border-slate-300"
      }`}
      style={selected ? { boxShadow: `0 0 0 3px ${accent.ring}` } : undefined}
    >
      {/* Accent bar */}
      <div className="h-1 rounded-t-[11px]" style={{ background: accent.bar }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-3.5 py-4">
        <div
          className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${accent.iconBg}`}
        >
          {nodeType === "iterator" ? (
            <span className="animate-[spin_3s_linear_infinite] text-white">{icon}</span>
          ) : (
            <span className="text-white">{icon}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Tooltip title={nodeTitle} placement="top" arrow>
            <h3 className="text-[13px] font-semibold text-slate-800 leading-5 truncate">
              {nodeTitle}
            </h3>
          </Tooltip>
          <div className="mt-0.5 flex items-center gap-1.5 min-h-[16px]">
            <span
              className={`inline-flex items-center px-1.5 h-[18px] rounded-md text-[9.5px] font-semibold uppercase tracking-wide border ${accent.chip}`}
            >
              {typeLabel}
            </span>
            {paramCount > 0 && (
              <span className="text-[10px] text-slate-400 tabular-nums">
                {paramCount} {paramCount === 1 ? "field" : "fields"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ReAct Agent Preview */}
      {isReactAgent && (
        <div className="px-3.5 pb-3 -mt-1">
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-400">Instruction</span>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-700">
                ReAct
              </span>
            </div>
            <p className="line-clamp-2 break-words text-[11px] leading-snug text-slate-600">
              {reactAgentPrompt || data.description || "Configure prompt, memory, tools and output from the node details panel."}
            </p>
          </div>
        </div>
      )}

      {/* Question/Options Content */}
      {shouldShowOptionsUI && (
        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/40">
          {questionData.questionText && !isDynamic(questionData.questionText) && (
            <p className="text-[11.5px] text-slate-600 leading-snug mb-2 line-clamp-2 break-words">
              {questionData.questionText}
            </p>
          )}

          {/* Options List */}
          {displayOptions && typeof displayOptions === 'object' && !isDynamic(displayOptions) && Object.keys(displayOptions).length > 0 && (
            <div className="space-y-1">
              <p className="text-[9.5px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">
                {Object.keys(displayOptions).length} option{Object.keys(displayOptions).length !== 1 ? 's' : ''}
              </p>

              {Object.entries(displayOptions).slice(0, 4).map(([key, value], index) => {
                const optionColor = optionColors[index % optionColors.length];

                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: optionColor.hex }}
                    />
                    <span className="text-[11px] text-slate-700 truncate">
                      {String(value)}
                    </span>
                  </div>
                );
              })}

              {Object.keys(displayOptions).length > 4 && (
                <p className="text-[10px] text-slate-400 pl-1 pt-0.5">
                  +{Object.keys(displayOptions).length - 4} more
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Condition Content */}
      {(nodeType === "conditions" || nodeType === "condition") && Array.isArray(conditionData.conditions) && conditionData.conditions.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/40">
          <p className="text-[9.5px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">
            {conditionData.conditions.length} condition{conditionData.conditions.length !== 1 ? 's' : ''}
          </p>

          {/* Conditions List with one inline handle per branch */}
          <div className="space-y-1.5">
            {conditionData.conditions.map((condition, index) => (
              <div
                key={index}
                className="relative flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 pr-4"
              >
                <span className="shrink-0 text-[9.5px] font-mono font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-px rounded">
                  {condition.operator}
                </span>
                <span className="text-[11px] text-slate-600 truncate">
                  {condition.comparisonValue || '(no value)'}
                </span>

                {/* Handle sits on the row it belongs to */}
                <Handle
                  key={index}
                  id={index.toString()}
                  type="source"
                  position={Position.Right}
                  className="!absolute !top-1/2 !-translate-y-1/2 hover:!scale-125 transition-transform"
                  style={handleStyle(accent.handle, { right: -6 })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Node Body */}
      {/* {!shouldShowOptionsUI && (
        <div className="px-4 py-3.5">
          {data.description && (
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              {data.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              <span className="text-xs text-gray-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      )} */}

      {/* --- HANDLES --- */}

      {/* Input Handle - exclude start node type */}
      {nodeType !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          className="hover:!scale-125 transition-transform"
          style={handleStyle("#94a3b8", { left: -6, zIndex: 10 })}
        />
      )}

      {/* Regular Output Handle */}
      {nodeType !== "output" && nodeType !== "decision" && nodeType !== "iterator" && nodeType !== "conditions" && nodeType !== "condition" && (
        <Handle
          type="source"
          position={Position.Right}
          className="hover:!scale-125 transition-transform"
          style={handleStyle(accent.handle, { right: -6, zIndex: 10 })}
        />
      )}

      {nodeType === "decision" && (
        <div className="px-3 pb-2.5 pt-0 space-y-1.5 border-t border-slate-100">
          <div className="relative flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 pr-4">
            <span className="text-[11px] font-medium text-slate-600">True</span>
            <span className="text-[10px] font-mono text-emerald-700">yes</span>
            <Handle
              id="true"
              type="source"
              position={Position.Right}
              className="!absolute !top-1/2 !-translate-y-1/2 hover:!scale-125 transition-transform"
              style={handleStyle("#3d8f73", { right: -6 })}
            />
          </div>
          <div className="relative flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 pr-4">
            <span className="text-[11px] font-medium text-slate-600">False</span>
            <span className="text-[10px] font-mono text-slate-500">no</span>
            <Handle
              id="false"
              type="source"
              position={Position.Right}
              className="!absolute !top-1/2 !-translate-y-1/2 hover:!scale-125 transition-transform"
              style={handleStyle("#b06a6a", { right: -6 })}
            />
          </div>
        </div>
      )}

      {nodeType === "iterator" && (
        <div className="px-3 pb-2.5 pt-0 space-y-1.5 border-t border-slate-100">
          <div className="relative flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 pr-4">
            <span className="text-[11px] font-medium text-slate-600">Loop body</span>
            <span className="text-[10px] font-mono text-indigo-700">loop</span>
            <Handle
              id="loop"
              type="source"
              position={Position.Right}
              className="!absolute !top-1/2 !-translate-y-1/2 hover:!scale-125 transition-transform"
              style={handleStyle("#5c6aa8", { right: -6 })}
            />
          </div>
          <div className="relative flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 pr-4">
            <span className="text-[11px] font-medium text-slate-600">Complete</span>
            <span className="text-[10px] font-mono text-slate-500">done</span>
            <Handle
              id="complete"
              type="source"
              position={Position.Right}
              className="!absolute !top-1/2 !-translate-y-1/2 hover:!scale-125 transition-transform"
              style={handleStyle("#94a3b8", { right: -6 })}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export const useNodeTypes = () => {
  const typeKeys = useSelector(selectNodeTypeKeys);
  // A joined signature keeps the map identity stable even when a refetch returns
  // a brand new (but identical) array. An unstable `nodeTypes` map makes React
  // Flow re-create every node component on each render (dev error #002).
  const typeSignature = typeKeys.join("|");

  return useMemo(() => {
    const nodeTypes = {
      decision: CustomNode,
      iterator: CustomNode,
      question: CustomNode,
      conditions: CustomNode,
      condition: CustomNode,
      inputs: CustomNode,
      start: CustomNode,
      react_agent: CustomNode,
      react_agent_v2: CustomNode,
    };

    typeSignature
      .split("|")
      .filter(Boolean)
      .forEach((type) => {
        nodeTypes[type] = CustomNode;
      });

    return nodeTypes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeSignature]);
};

export default CustomNode;
