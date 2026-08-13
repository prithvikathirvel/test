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
/**
 * Muted SaaS accents — recognisable by type, never neon.
 * Rail is a 2px left border; the tile/chip stay pale so titles stay readable.
 */
const NODE_ACCENTS = {
  tool:       { rail: "#5b7fa6", tile: "bg-slate-50 text-slate-600 border-slate-200",     chip: "bg-slate-50 text-slate-600 border-slate-200",     ring: "rgba(91,127,166,0.28)" },
  agent:      { rail: "#3d8f73", tile: "bg-emerald-50/70 text-emerald-700 border-emerald-100", chip: "bg-emerald-50 text-emerald-700 border-emerald-100", ring: "rgba(61,143,115,0.28)" },
  model:      { rail: "#6f63a3", tile: "bg-violet-50/70 text-violet-700 border-violet-100", chip: "bg-violet-50 text-violet-700 border-violet-100", ring: "rgba(111,99,163,0.28)" },
  inputs:     { rail: "#4d8f9a", tile: "bg-cyan-50/70 text-cyan-700 border-cyan-100",     chip: "bg-cyan-50 text-cyan-700 border-cyan-100",       ring: "rgba(77,143,154,0.28)" },
  output:     { rail: "#b67a4a", tile: "bg-orange-50/70 text-orange-700 border-orange-100", chip: "bg-orange-50 text-orange-700 border-orange-100", ring: "rgba(182,122,74,0.28)" },
  agentflow:  { rail: "#a06b84", tile: "bg-rose-50/70 text-rose-700 border-rose-100",     chip: "bg-rose-50 text-rose-700 border-rose-100",       ring: "rgba(160,107,132,0.28)" },
  decision:   { rail: "#b08a3e", tile: "bg-amber-50/70 text-amber-700 border-amber-100",  chip: "bg-amber-50 text-amber-700 border-amber-100",     ring: "rgba(176,138,62,0.28)" },
  conditions: { rail: "#b08a3e", tile: "bg-amber-50/70 text-amber-700 border-amber-100",  chip: "bg-amber-50 text-amber-700 border-amber-100",     ring: "rgba(176,138,62,0.28)" },
  condition:  { rail: "#b08a3e", tile: "bg-amber-50/70 text-amber-700 border-amber-100",  chip: "bg-amber-50 text-amber-700 border-amber-100",     ring: "rgba(176,138,62,0.28)" },
  iterator:   { rail: "#5c6aa8", tile: "bg-indigo-50/70 text-indigo-700 border-indigo-100", chip: "bg-indigo-50 text-indigo-700 border-indigo-100", ring: "rgba(92,106,168,0.28)" },
  question:   { rail: "#6f63a3", tile: "bg-violet-50/70 text-violet-700 border-violet-100", chip: "bg-violet-50 text-violet-700 border-violet-100", ring: "rgba(111,99,163,0.28)" },
  start:      { rail: "#4a9a6e", tile: "bg-emerald-50/70 text-emerald-700 border-emerald-100", chip: "bg-emerald-50 text-emerald-700 border-emerald-100", ring: "rgba(74,154,110,0.28)" },
};

const DEFAULT_ACCENT = {
  rail: "#94a3b8",
  tile: "bg-slate-50 text-slate-600 border-slate-200",
  chip: "bg-slate-50 text-slate-600 border-slate-200",
  ring: "rgba(100,116,139,0.28)",
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
  border: `1.5px solid ${color}`,
  width: 9,
  height: 9,
  borderRadius: 9999,
  boxShadow: "0 0 0 2px #ffffff",
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

  return (
    <div
      className={`group relative w-[264px] bg-white rounded-lg border border-slate-200 transition-[box-shadow,border-color] duration-150 ${
        selected ? "border-slate-300" : "hover:border-slate-300"
      }`}
      style={{
        borderLeftWidth: 2,
        borderLeftColor: accent.rail,
        boxShadow: selected
          ? `0 0 0 3px ${accent.ring}, 0 6px 16px -8px rgba(15,23,42,0.18)`
          : "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div
          className={`shrink-0 h-7 w-7 rounded-md border flex items-center justify-center ${accent.tile}`}
        >
          {nodeType === "iterator" ? (
            <span className="animate-[spin_3s_linear_infinite]">{icon}</span>
          ) : (
            icon
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Tooltip title={nodeTitle} placement="top" arrow>
            <h3 className="text-[13px] font-semibold text-slate-800 leading-5 truncate tracking-tight">
              {nodeTitle}
            </h3>
          </Tooltip>
          <div className="mt-0.5 flex items-center gap-1.5 min-h-[16px]">
            <span
              className={`inline-flex items-center px-1.5 h-4 rounded text-[9.5px] font-medium uppercase tracking-wide border ${accent.chip}`}
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
