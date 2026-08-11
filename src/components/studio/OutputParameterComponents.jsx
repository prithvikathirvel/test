"use client";

import React from "react";
import { Box, Typography, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Tooltip } from "@mui/material";
import { Trash2, Plus, Code, Variable } from "lucide-react";

const DATA_TYPES = [
  { value: "text", label: "Text / String" },
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "object", label: "Object (JSON)" },
  { value: "array", label: "Array / List" },
  { value: "file", label: "File / Blob" },
];

const OutputParameterComponents = ({ param, index, onUpdate, onDelete, color = "#4f46e5" }) => {
  const isObject = typeof param === "object" && param !== null;
  const keyName = isObject ? (param.key || param.name || "") : String(param || "");
  const paramType = isObject ? (param.type || "text") : "text";
  const paramDesc = isObject ? (param.description || "") : "";

  const handleKeyChange = (e) => {
    const newKey = e.target.value;
    if (onUpdate) {
      if (isObject) {
        onUpdate({ ...param, key: newKey, name: newKey });
      } else {
        onUpdate(newKey);
      }
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    if (onUpdate && isObject) {
      onUpdate({ ...param, type: newType });
    }
  };

  const handleDescChange = (e) => {
    const newDesc = e.target.value;
    if (onUpdate && isObject) {
      onUpdate({ ...param, description: newDesc });
    }
  };

  return (
    <Box className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Variable size={14} />
          </div>
          <Typography className="!text-xs !font-semibold !text-slate-700 !uppercase !tracking-wider">
            Output Variable #{index !== undefined ? index + 1 : 1}
          </Typography>
        </div>

        {onDelete && (
          <Tooltip title="Delete Variable">
            <IconButton
              onClick={() => onDelete(index)}
              size="small"
              className="!p-1 !text-slate-400 hover:!text-red-600 hover:!bg-red-50 !rounded-md"
            >
              <Trash2 size={14} />
            </IconButton>
          </Tooltip>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Variable Key Name */}
        <div className="sm:col-span-7">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Variable Name (Key)
          </label>
          <input
            type="text"
            value={keyName}
            onChange={handleKeyChange}
            placeholder="e.g. output_text, search_results"
            className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
          />
        </div>

        {/* Data Type */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Data Type
          </label>
          <select
            value={paramType}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
          >
            {DATA_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Box>
  );
};

export default OutputParameterComponents;
