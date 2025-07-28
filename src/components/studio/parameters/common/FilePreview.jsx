"use client";
import React from 'react';
import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import { Check, X } from 'lucide-react';
import { FileTypeIcon } from '@/utils/commonFunction';

const FilePreview = ({ file, fileId, onRemove }) => (
  <Paper variant="outlined" className="p-3 rounded-lg bg-blue-50 border border-blue-200">
    <Box className="flex items-center justify-between">
      <Box className="flex items-center space-x-2">
        <FileTypeIcon fileName={file.name} />
        <Box>
          <Typography variant="body2" className="font-medium line-clamp-1 max-w-[100px] text-gray-800">
            {file.name}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {(file.size / 1024).toFixed(1)} KB • ID: {fileId.substring(0, 8)}
          </Typography>
        </Box>
      </Box>
      <Box className="flex space-x-1">
        <Chip
          icon={<Check size={14} />}
          label="Uploaded"
          size="small"
          className="bg-green-100 text-green-700 mr-2"
        />
        <Button
          variant="text"
          color="error"
          size="small"
          onClick={onRemove}
          className="min-w-0 p-1"
        >
          <X size={18} />
        </Button>
      </Box>
    </Box>
  </Paper>
);


export default FilePreview;
