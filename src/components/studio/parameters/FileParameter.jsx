"use client";
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { FileText } from 'lucide-react';
import ParameterHeader from './common/ParameterHeader';
import UploadArea from './common/UploadArea';
import FilePreview from './common/FilePreview';

const FileParameter = ({ param = {}, onUpdate, parameters, parameter }) => {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(param.value || '');

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      const reader = new FileReader();

      reader.readAsDataURL(selectedFile);
      setFile(selectedFile);
      reader.onload = async () => {
        const base64Data = reader.result;
        const fileContent = base64Data.split(',')[1];
        
        const newFileId = 'file_' + Math.random().toString(36).substring(2, 10);
        setFileId(newFileId);

        if (onUpdate) {
          onUpdate({ ...param, value: fileContent }, parameter);
        }
      };
    }
  };

  return (
    <Box className="mb-2">
      <ParameterHeader
        title={param.key}
        icon={<FileText size={18} />}
        description={param.description}
      />

      {!file ? (
        <UploadArea
          onUpload={handleFileChange}
          paramKey={param.name}
        />
      ) : (
        <FilePreview
          file={file}
          fileId={fileId}
          onRemove={() => {
            setFile(null);
            setFileId('');
            if (onUpdate) {
              onUpdate({ ...param, value: null }, parameter);
            }
          }}
        />
      )}
    </Box>
  );
};

export default FileParameter;
