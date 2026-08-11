"use client";

import React, { useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useSelector } from "react-redux";
import { Copy, Check, Download, Code, Layers, FileJson } from "lucide-react";
import { truncateLongStrings } from "@/utils/commonFunction";

export default function JsonSpecView() {
  const specification = useSelector((state) => state.studio.specification);
  const [copied, setCopied] = useState(false);

  const processedSpec = React.useMemo(() => {
    if (!specification) return null;
    return truncateLongStrings(specification, 100);
  }, [specification]);

  const jsonString = React.useMemo(() => {
    if (!processedSpec) return "{}";
    try {
      return JSON.stringify(processedSpec, null, 2);
    } catch {
      return "{}";
    }
  }, [processedSpec]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${specification?.name || "flow-specification"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const nodeCount = specification?.graphSpec?.nodes?.length || 0;
  const edgeCount = specification?.graphSpec?.edges?.length || 0;

  return (
    <Box className="min-h-full p-6 max-w-5xl mx-auto">
      {/* Header & Meta Bar */}
      <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-400">Flow Specification</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              v{specification?.version || "1.0.0"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {specification?.name || "Flow Graph Specification"}
          </h2>
        </div>

        <Box className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy JSON"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download size={14} /> Download
          </button>
        </Box>
      </Box>

      {/* Stats row */}
      <Box className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Box className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Nodes</span>
          <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">{nodeCount}</span>
        </Box>
        <Box className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Edges</span>
          <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">{edgeCount}</span>
        </Box>
        <Box className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Voice Mode</span>
          <span className="text-xs font-medium text-slate-700 mt-1 block">
            {specification?.voice_enabled ? "Enabled" : "Disabled"}
          </span>
        </Box>
        <Box className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Type</span>
          <span className="text-xs font-medium text-slate-700 mt-1 block uppercase">
            {specification?.type || "Flow"}
          </span>
        </Box>
      </Box>

      {/* JSON Schema Code Box */}
      <Box className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <Box className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson size={14} className="text-slate-400" />
            <span className="text-xs font-mono text-slate-300">specification.json</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {jsonString.split("\n").length} lines
          </span>
        </Box>

        <pre className="p-5 overflow-auto text-xs font-mono leading-relaxed text-slate-200 max-h-[600px] select-text">
          <code>{jsonString}</code>
        </pre>
      </Box>
    </Box>
  );
}
