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
        const fileContent = base64Data;
        console.log('Base64 content:', fileContent);
        
        const newFileId = 'file_' + Math.random().toString(36).substring(2, 10);
        setFileId(newFileId);

        if (onUpdate && parameters) {
          console.log('File parameter updated:', param);
          const updatedParams = parameters.map(p => 
            p.key === param.key ? { ...p, value: fileContent } : p
          );
          onUpdate(updatedParams, parameter, true);
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
            if (onUpdate && parameters) {
              const updatedParams = parameters.map(p => 
                p.key === param.key ? { ...p, value: null } : p
              );
              onUpdate(updatedParams, parameter, true);
            }
          }}
        />
      )}
    </Box>
  );
};

export default FileParameter;
