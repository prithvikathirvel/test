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

/**
 * Node accent tokens.
 *
 * The previous design painted a full-bleed saturated gradient bar across the
 * top of every node. At canvas zoom levels those bars dominated the viewport,
 * fought with the app's calm slate/indigo shell, and made the node titles
 * (white on mid-tone gradients) hard to read. The refreshed treatment keeps the
 * same per-type hues for instant recognition but applies them as a thin rail +
 * tinted icon tile on a white card, matching the enterprise surface used by the
 * header, sidebar and modals.
 */
const NODE_ACCENTS = {
  tool:       { rail: "#3b82f6", tile: "bg-blue-50 text-blue-600 border-blue-100",       chip: "bg-blue-50 text-blue-700 border-blue-100",       ring: "rgba(59,130,246,0.35)" },
  agent:      { rail: "#10b981", tile: "bg-emerald-50 text-emerald-600 border-emerald-100", chip: "bg-emerald-50 text-emerald-700 border-emerald-100", ring: "rgba(16,185,129,0.35)" },
  model:      { rail: "#a855f7", tile: "bg-purple-50 text-purple-600 border-purple-100",  chip: "bg-purple-50 text-purple-700 border-purple-100",  ring: "rgba(168,85,247,0.35)" },
  inputs:     { rail: "#06b6d4", tile: "bg-cyan-50 text-cyan-600 border-cyan-100",        chip: "bg-cyan-50 text-cyan-700 border-cyan-100",        ring: "rgba(6,182,212,0.35)" },
  output:     { rail: "#f97316", tile: "bg-orange-50 text-orange-600 border-orange-100",  chip: "bg-orange-50 text-orange-700 border-orange-100",  ring: "rgba(249,115,22,0.35)" },
  agentflow:  { rail: "#ec4899", tile: "bg-pink-50 text-pink-600 border-pink-100",        chip: "bg-pink-50 text-pink-700 border-pink-100",        ring: "rgba(236,72,153,0.35)" },
  decision:   { rail: "#f59e0b", tile: "bg-amber-50 text-amber-600 border-amber-100",     chip: "bg-amber-50 text-amber-700 border-amber-100",     ring: "rgba(245,158,11,0.35)" },
  conditions: { rail: "#f59e0b", tile: "bg-amber-50 text-amber-600 border-amber-100",     chip: "bg-amber-50 text-amber-700 border-amber-100",     ring: "rgba(245,158,11,0.35)" },
  condition:  { rail: "#f59e0b", tile: "bg-amber-50 text-amber-600 border-amber-100",     chip: "bg-amber-50 text-amber-700 border-amber-100",     ring: "rgba(245,158,11,0.35)" },
  iterator:   { rail: "#6366f1", tile: "bg-indigo-50 text-indigo-600 border-indigo-100",  chip: "bg-indigo-50 text-indigo-700 border-indigo-100",  ring: "rgba(99,102,241,0.35)" },
  question:   { rail: "#8b5cf6", tile: "bg-violet-50 text-violet-600 border-violet-100",  chip: "bg-violet-50 text-violet-700 border-violet-100",  ring: "rgba(139,92,246,0.35)" },
  start:      { rail: "#22c55e", tile: "bg-green-50 text-green-600 border-green-100",     chip: "bg-green-50 text-green-700 border-green-100",     ring: "rgba(34,197,94,0.35)" },
};

const DEFAULT_ACCENT = {
  rail: "#94a3b8",
  tile: "bg-slate-100 text-slate-600 border-slate-200",
  chip: "bg-slate-50 text-slate-600 border-slate-200",
  ring: "rgba(100,116,139,0.35)",
};

const getNodeAccent = (type) => NODE_ACCENTS[type?.toLowerCase()] || DEFAULT_ACCENT;

/** Human-readable label for the type chip ("agentflow" -> "Agent Flow"). */
const TYPE_LABELS = {
  agentflow: "Agent Flow",
  inputs: "Input",
  conditions: "Condition",
  iterator: "Loop",
};
const getTypeLabel = (type) => {
  if (!type) return "Node";
  const key = type.toLowerCase();
  if (TYPE_LABELS[key]) return TYPE_LABELS[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
};

/** Shared handle geometry so every port on the canvas looks identical. */
const handleStyle = (color, extra = {}) => ({
  background: "#ffffff",
  border: `2px solid ${color}`,
  width: 10,
  height: 10,
  borderRadius: 9999,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.18)",
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
  const nodeType = type?.toLowerCase() || data?.type?.toLowerCase();
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
    if (nodeType !== "conditions" && nodeType !== "condition") return;
    updateNodeInternals(id);
  }, [id, nodeType, conditionCount, updateNodeInternals]);

  // `backdrop-blur-sm` was a no-op behind the opaque `bg-white` but still
  // forced a GPU compositing layer for every node, and `transition-all`
  // animated the drag transform. Both are narrowed to what is visible.
  const typeLabel = getTypeLabel(nodeType);
  const nodeTitle = data.displayName || data.name || typeLabel;

  return (
    <div
      className={`group relative min-w-[250px] max-w-[300px] bg-white rounded-xl border border-slate-200 transition-[box-shadow,border-color] duration-200 ${
        selected ? "border-slate-300" : "shadow-sm hover:shadow-md hover:border-slate-300"
      }`}
      style={{
        // The type rail is the card's own left border, so it follows the
        // rounded corners exactly instead of sitting as a detached bar. Using
        // a real border also keeps it inside the element box, which means the
        // card no longer needs `overflow-hidden` — and the connection handles,
        // which are deliberately positioned 6px outside the card, stop being
        // clipped into half-circles.
        borderLeftWidth: 3,
        borderLeftColor: accent.rail,
        ...(selected
          ? { boxShadow: `0 0 0 3px ${accent.ring}, 0 8px 20px -6px rgba(15,23,42,0.22)` }
          : null),
      }}
    >

      {/* Header */}
      <div className="flex items-start gap-2.5 pl-3.5 pr-3 py-2.5 border-b border-slate-100 bg-white rounded-tr-[10px]">
        <div
          className={`shrink-0 mt-0.5 h-7 w-7 rounded-lg border flex items-center justify-center ${accent.tile}`}
        >
          {nodeType === "iterator" ? (
            <span className="animate-[spin_3s_linear_infinite]">{icon}</span>
          ) : (
            icon
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Tooltip title={nodeTitle} placement="top" arrow>
            <h3 className="text-[13px] font-semibold text-slate-800 leading-tight truncate tracking-tight">
              {nodeTitle}
            </h3>
          </Tooltip>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center px-1.5 py-px rounded text-[9.5px] font-medium uppercase tracking-wide border ${accent.chip}`}
            >
              {typeLabel}
            </span>
            {paramCount > 0 && (
              <span className="text-[10px] text-slate-400 font-mono">
                {paramCount} {paramCount === 1 ? "field" : "fields"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Question/Options Content */}
      {shouldShowOptionsUI && (
        <div className="pl-3.5 pr-3 py-2.5 border-b border-slate-100 bg-slate-50/50">
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
        <div className="pl-3.5 pr-3 py-2.5 border-b border-slate-100 bg-slate-50/50">
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
                  style={handleStyle(accent.rail, { right: -6 })}
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
          style={handleStyle(accent.rail, { right: -6, zIndex: 10 })}
        />
      )}

      {/* Decision Node Handles - labelled so the true/false branch is obvious */}
      {nodeType === "decision" && (
        <>
          <span
            className="absolute right-2 text-[9px] font-semibold uppercase tracking-wide text-emerald-600 pointer-events-none"
            style={{ top: '40%', transform: 'translateY(-50%)' }}
          >
            true
          </span>
          <Tooltip title="True branch" placement="right" arrow>
            <Handle
              id="true"
              type="source"
              position={Position.Right}
              className="hover:!scale-125 transition-transform"
              style={handleStyle("#10b981", { right: -6, top: '40%' })}
            />
          </Tooltip>

          <span
            className="absolute right-2 text-[9px] font-semibold uppercase tracking-wide text-rose-600 pointer-events-none"
            style={{ top: '60%', transform: 'translateY(-50%)' }}
          >
            false
          </span>
          <Tooltip title="False branch" placement="right" arrow>
            <Handle
              id="false"
              type="source"
              position={Position.Right}
              className="hover:!scale-125 transition-transform"
              style={handleStyle("#f43f5e", { right: -6, top: '60%' })}
            />
          </Tooltip>
        </>
      )}

      {/* Iterator Node Handles */}
      {nodeType === "iterator" && (
        <>
          <span
            className="absolute right-2 text-[9px] font-semibold uppercase tracking-wide text-indigo-600 pointer-events-none"
            style={{ top: '40%', transform: 'translateY(-50%)' }}
          >
            loop
          </span>
          <Tooltip title="Loop body" placement="right" arrow>
            <Handle
              id="loop"
              type="source"
              position={Position.Right}
              className="hover:!scale-125 transition-transform"
              style={handleStyle("#6366f1", { right: -6, top: '40%' })}
            />
          </Tooltip>

          <span
            className="absolute right-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500 pointer-events-none"
            style={{ top: '70%', transform: 'translateY(-50%)' }}
          >
            done
          </span>
          <Tooltip title="Complete" placement="right" arrow>
            <Handle
              id="complete"
              type="source"
              position={Position.Right}
              className="hover:!scale-125 transition-transform"
              style={handleStyle("#94a3b8", { right: -6, top: '70%' })}
              focusable={true}
            />
          </Tooltip>
        </>
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
