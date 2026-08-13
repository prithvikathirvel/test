"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  X,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Braces,
  Zap,
  Variable,
  RotateCcw,
} from "lucide-react";

const NODE_TEST_URL =
  "https://apidev.sifymodernization.digital/engine/nodes/test";

const EMPTY_VAR = { key: "", value: "" };

const formatValue = (value) => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
};

/**
 * Fresh "Node Test" experience.
 *
 * Executes the selected node in isolation via `POST /engine/nodes/test` using
 * the node's own input/output parameters (and any optional variables the user
 * supplies). Shows a compact, readable result instead of the old drawer that
 * relied on a running flow.
 */
const NodeTestModal = ({ open, onClose, node }) => {
  const [variables, setVariables] = useState([{ ...EMPTY_VAR }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Reset state each time the modal opens for a (possibly different) node.
  useEffect(() => {
    if (open) {
      setVariables([{ ...EMPTY_VAR }]);
      setResult(null);
      setError(null);
    }
  }, [open, node]);

  const nodeName = node?.data?.name || node?.name || "Node";
  const inputParams = node?.data?.inputParameters || [];
  const outputParams = node?.data?.outputParameters || [];

  const updateVariable = (index, field, value) => {
    setVariables((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const addVariable = () =>
    setVariables((prev) => [...prev, { ...EMPTY_VAR }]);

  const removeVariable = (index) =>
    setVariables((prev) => prev.filter((_, i) => i !== index));

  const handleRunTest = useCallback(async () => {
    if (!node) return;

    const variablesObj = variables
      .filter((v) => v.key.trim() !== "")
      .reduce((acc, v) => {
        acc[v.key.trim()] = v.value;
        return acc;
      }, {});

    const payload = {
      node_name: nodeName,
      node_config: {
        inputParameters: inputParams,
        outputParameters: outputParams,
      },
      ...(Object.keys(variablesObj).length > 0 ? { variables: variablesObj } : {}),
    };

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(NODE_TEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err?.message || "Something went wrong while testing this node.");
    } finally {
      setLoading(false);
    }
  }, [node, nodeName, inputParams, outputParams, variables]);

  const success = result?.success === true;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.08)",
          backgroundColor: "#f8fafc",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200/80 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Zap size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] font-bold text-slate-800 leading-tight truncate">
              Test Node
            </h2>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {nodeName}
            </p>
          </div>
        </div>
        <IconButton onClick={onClose} size="small" className="!text-slate-400 hover:!text-slate-700">
          <X size={16} />
        </IconButton>
      </div>

      <DialogContent sx={{ p: 0 }}>
        <div className="p-6 space-y-5">
          {/* What will be tested */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-3">
              <Braces size={13} className="text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Payload Preview
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px]">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                <p className="text-slate-400 font-medium mb-1">Input Parameters</p>
                <p className="text-slate-700 font-mono">
                  {inputParams.length} parameter{inputParams.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                <p className="text-slate-400 font-medium mb-1">Output Parameters</p>
                <p className="text-slate-700 font-mono">
                  {outputParams.length} parameter{outputParams.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
              The node's own input/output parameters are sent to the engine
              automatically. Add variables below to resolve template placeholders
              like {"{{name}}"} or {"{{CHAT_QUERY}}"}.
            </p>
          </div>

          {/* Optional variables */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Variable size={13} className="text-indigo-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Variables <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </span>
              </div>
              <button
                type="button"
                onClick={addVariable}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <Plus size={13} /> Add
              </button>
            </div>

            <div className="space-y-2">
              {variables.map((v, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={v.key}
                    onChange={(e) => updateVariable(index, "key", e.target.value)}
                    placeholder="Variable name (e.g. name)"
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                  />
                  <input
                    value={v.value}
                    onChange={(e) => updateVariable(index, "value", e.target.value)}
                    placeholder="Value (e.g. Alice)"
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                  />
                  <IconButton
                    onClick={() => removeVariable(index)}
                    size="small"
                    className="!text-slate-400 hover:!text-red-500 hover:!bg-red-50 !p-1.5"
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              ))}
            </div>
          </div>

          {/* Run button */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRunTest}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg shadow-xs transition-colors"
            >
              {loading ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <Play size={13} className="fill-white" />
              )}
              {loading ? "Running..." : "Run Test"}
            </button>
          </div>

          {/* Result */}
          {(result || error) && (
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {error ? (
                    <XCircle size={15} className="text-red-500" />
                  ) : success ? (
                    <CheckCircle2 size={15} className="text-emerald-500" />
                  ) : (
                    <XCircle size={15} className="text-amber-500" />
                  )}
                  <span className="text-[12px] font-semibold text-slate-700">
                    {error ? "Test failed" : success ? "Test succeeded" : "Completed"}
                  </span>
                </div>
                {result?.duration_ms != null && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Clock size={12} />
                    {(result.duration_ms / 1000).toFixed(2)}s
                  </span>
                )}
              </div>

              {error && (
                <p className="px-4 py-3 text-[12px] text-red-600">{error}</p>
              )}

              {result && (
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Braces size={12} className="text-slate-400" />
                    <span className="font-medium text-slate-400 uppercase tracking-wider">Output</span>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11.5px] font-mono leading-relaxed whitespace-pre-wrap break-words max-h-64 overflow-auto">
                    {formatValue(result.output ?? result)}
                  </pre>

                  {(result.token_usage?.total_tokens != null ||
                    result.messages_added != null) && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      {result.token_usage?.total_tokens != null && (
                        <span className="font-mono">
                          {result.token_usage.total_tokens} tokens
                        </span>
                      )}
                      {result.messages_added != null && (
                        <span className="font-mono">
                          {result.messages_added} message
                          {result.messages_added === 1 ? "" : "s"} added
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NodeTestModal;
