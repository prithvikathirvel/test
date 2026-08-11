"use client";
import React from "react";
import { Tooltip } from "@mui/material";
import { HelpCircle } from "lucide-react";

const ParameterHeader = ({ title, icon, description, type }) => (
  <div className="flex items-center justify-between gap-2 mb-2">
    <div className="flex items-center gap-1.5 min-w-0">
      {icon}
      <span className="text-[11.5px] font-bold text-slate-700 uppercase tracking-wider truncate">
        {title || "Parameter"}
      </span>
      {description && (
        <Tooltip title={description} placement="top" arrow>
          <span className="text-slate-400 hover:text-slate-600 cursor-help inline-flex items-center">
            <HelpCircle size={13} />
          </span>
        </Tooltip>
      )}
    </div>

    {type && (
      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100/80">
        {type}
      </span>
    )}
  </div>
);

export default ParameterHeader;
