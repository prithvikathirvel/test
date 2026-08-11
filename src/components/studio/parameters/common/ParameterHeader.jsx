"use client";
import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { HelpCircle } from "lucide-react";
import { convertToTitleCase } from "@/utils/commonFunction";

const ParameterHeader = ({ title, icon, description, type }) => (
  <Box className="flex items-center justify-between gap-2 mb-2">
    <div className="flex items-center gap-1.5 min-w-0">
      {icon}
      <Typography className="!text-[12px] !font-semibold !text-slate-800 !tracking-tight">
        {convertToTitleCase(title)}
      </Typography>
      {description && (
        <Tooltip title={description} placement="top" arrow>
          <span className="text-slate-400 hover:text-slate-600 cursor-help inline-flex items-center">
            <HelpCircle size={13} />
          </span>
        </Tooltip>
      )}
    </div>

    {type && (
      <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
        {type}
      </span>
    )}
  </Box>
);

export default ParameterHeader;
