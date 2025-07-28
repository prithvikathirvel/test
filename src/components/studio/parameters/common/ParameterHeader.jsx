"use client";
import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { convertToTitleCase } from '@/utils/commonFunction';

const ParameterHeader = ({ title, icon, description }) => (
  <Box className="flex items-center gap-2 mb-2">
    {icon}
    <Typography variant="subtitle2" className="font-medium">
      {convertToTitleCase(title)}
    </Typography>
    {description && (
      <Tooltip title={description} arrow>
        <Box className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs !cursor-help">
          ?
        </Box>
      </Tooltip>
    )}
  </Box>
);


export default ParameterHeader;
