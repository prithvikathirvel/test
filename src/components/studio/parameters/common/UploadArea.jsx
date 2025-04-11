"use client";
import React from 'react';
import { Box, Typography } from '@mui/material';
import { Upload } from 'lucide-react';
import DashedBox from '@/components/Common/DashedBox';

const UploadArea = ({ onUpload, paramKey }) => (
  <DashedBox
    className="p-4 border-2 hover:bg-gray-100 transition-all cursor-pointer flex flex-col items-center justify-center"
  >
    <Box
      onClick={() => document.getElementById(`file-upload-${paramKey}`).click()}
      className="w-full h-full flex flex-col items-center"
    >
      <Upload className="mb-2 text-blue-500" />
      <Typography variant="body2" className="text-center text-gray-600">
        Click to upload or drag and drop<br />
        <span className="text-xs text-gray-500">Supported formats: PDF, DOC, JPG, PNG</span>
      </Typography>
      <input
        type="file"
        id={`file-upload-${paramKey}`}
        onChange={onUpload}
        className="hidden"
      />
    </Box>
  </DashedBox>
);

export default UploadArea;
