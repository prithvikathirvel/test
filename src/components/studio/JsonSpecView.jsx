"use client";

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useSelector } from "react-redux";

export default function JsonSpecView() {
  const specification = useSelector((state) => state.flow.specification);

  return (
    <Box className="p-4 h-full overflow-auto">
      <Typography variant="h6" className="mb-4">
        Flow Specification
      </Typography>
      <Paper elevation={0} className="p-4 bg-gray-50 rounded-md">
        <pre className="text-sm font-mono overflow-auto max-h-[calc(100vh-200px)]">
          {specification ? JSON.stringify(specification, null, 2) : "No specification available yet."}
        </pre>
      </Paper>
    </Box>
  );
}
