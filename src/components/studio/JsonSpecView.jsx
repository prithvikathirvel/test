"use client";

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useSelector } from "react-redux";
import OutputParameterComponents from "./OutputParameterComponents";

export default function JsonSpecView() {
  const specification = useSelector((state) => state.studio.specification);

  return (
    <Box className="p-4 h-full overflow-auto">
      <Typography variant="h6" className="mb-4">
        Flow Specification
      </Typography>
      <Paper elevation={0} className="bg-gray-50 rounded-md">
        {/* <pre className="text-sm font-mono overflow-auto max-h-[calc(100vh-200px)]">
          {specification ? JSON.stringify(specification, null, 2) : "No specification available yet."}
        </pre> */} 

      {specification ? <OutputParameterComponents param={specification} /> : "No specification available yet."}
      </Paper>
    </Box>
  );
}
