"use client";

import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { useSelector } from "react-redux";
import OutputParameterComponents from "./OutputParameterComponents";
import { truncateLongStrings } from "@/utils/commonFunction";

export default function JsonSpecView() {
  const specification = useSelector((state) => state.studio.specification);

  // Process specification to truncate long strings (especially base64 data)
  const processedSpec = React.useMemo(() => {
    if (!specification) return null;
    return truncateLongStrings(specification, 50);
  }, [specification]);

  return (
    // <Box 
    //   className="p-4 overflow-auto"
    //   sx={{ 
    //     height: '100%',
    //     width: '100%',
    //     maxWidth: '100%',
    //     boxSizing: 'border-box',
    //     display: 'flex',
    //     flexDirection: 'column'
    //   }}
    // >
    //   <Typography variant="h6" className="mb-4">
    //     Flow Specification
    //   </Typography>
    //   <Paper 
    //     elevation={0} 
    //     className="bg-gray-50 rounded-md overflow-auto"
    //     sx={{ 
    //       flex: 1,
    //       maxHeight: 'calc(100vh - 200px)',
    //       position: 'relative'
    //     }}
    //   >
    //     {processedSpec ? (
    //       <OutputParameterComponents param={processedSpec} />
    //     ) : (
    //       <Box p={3} className="text-gray-500">
    //         No specification available yet.
    //       </Box>
    //     )}
    //   </Paper>
    // </Box>

    <Box className="min-h-screen p-8">
      <Box className="max-w-4xl mx-auto">
        <Typography variant="h6">
          Flow Specification
        </Typography>

        <Box className="space-y-4">
          {specification ? 
          <Box className="rounded-md">

            <OutputParameterComponents param={processedSpec} />

          </Box> : 'Flow is not specified yet'}

        </Box>
      </Box>
    </Box>
  );
}
