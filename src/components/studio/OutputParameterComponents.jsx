"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { Variable } from "lucide-react";

const OutputParameterComponents = ({ param, index, onUpdate, color = "#4f46e5" }) => {
  const isObject = typeof param === "object" && param !== null;
  const keyName = isObject ? (param.key || param.name || "") : String(param || "");
  const paramType = isObject ? (param.type || "text") : "text";

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

  return (
    <Box className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Variable size={13} />
          </div>
          <Typography className="!text-[11px] !font-semibold !text-slate-600 !uppercase !tracking-wider">
            Output #{index !== undefined ? index + 1 : 1}
          </Typography>
        </div>

        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
          {paramType}
        </span>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-slate-500 mb-1">
          Output Variable Name
        </label>
        <input
          type="text"
          value={keyName}
          onChange={handleKeyChange}
          placeholder="e.g. output_result"
          className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
        />
      </div>
    </Box>
  );
};

export default OutputParameterComponents;
