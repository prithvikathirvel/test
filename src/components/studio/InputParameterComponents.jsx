"use client";
import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Chip, IconButton, Switch, Divider, Tooltip } from '@mui/material';
import { Upload, X, Check, FileText, Code, Plus, Trash2 } from 'lucide-react';
import InputBox from '@/components/Common/InputBox';
import { convertToTitleCase, FileTypeIcon } from '@/utils/commonFunction';
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

// File Preview Component
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

const ObjectParameterHeader = ({ title, description }) => (
  <ParameterHeader
    title={title}
    icon={<Code size={18} />}
    description={description}
  />
);

const KeyValueInput = ({
  newKey,
  newValue,
  onKeyChange,
  onValueChange,
  onAdd,
  color,
  onKeyPress,
  disabled = false
}) => (
  <Box className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
    <InputBox
      placeholder="New key"
      value={newKey}
      height="30px"
      onChange={onKeyChange}
      icon=''
      color={color}
      onKeyDown={onKeyPress}
      disabled={disabled}
    />
    <InputBox
      placeholder="New value"
      value={newValue}
      isShowLabel={false}
      height="30px"
      onChange={onValueChange}
      color={color}
      icon=''
      onKeyDown={onKeyPress}
    />
    <Button
      className="h-[25px] !min-w-[25px] w-[25px] border !rounded-[100%]"
      style={{ backgroundColor: color }}
      size="small"
      onClick={onAdd}
      disabled={!newKey || !newValue}
    >
      <Plus size={15} color="white" />
    </Button>
  </Box>
);

const StringParameter = ({ param = {}, color, onUpdate, parameters }) => {

  const handleChange = (value) => {
    if (onUpdate) {
      // Create a new set of parameters with the updated value
      const updatedParams = parameters.map(p => 
        p.key === param.key ? { ...p, value } : p
      );
      onUpdate(updatedParams);
    }
  };

  return (
    <Box className="w-full">

      <InputBox
        placeholder={`Enter ${param.key}`}
        className="mb-4"
        icon={""}
        color={color}
        value={param.value}
        label={param.key}
        isShowLabel={true}
        onChange={handleChange}
      />
    </Box>
  );
};

const NumberParameter = ({ param = {}, color, onUpdate, parameters }) => {
  const handleChange = (value) => {
    if (onUpdate) {
      // Create a new set of parameters with the updated value
      const updatedParams = parameters.map(p => 
        p.key === param.key ? { ...p, value } : p
      );
      onUpdate(updatedParams);
    }
  };

  return (
    <Box className="w-full">
      <ParameterHeader
        title={param.name}
        description={param.description}
        icon={<Code size={16} />}
      />
      <Box className="w-full">

        <InputBox
          type="number"
          placeholder={`Enter ${param.key}`}
          className="mb-4"
          icon={""}
          color={color}
          value={param.value}
          label={param.key}
          isShowLabel={true}
          onChange={() => handleChange}
        />
      </Box>
    </Box>
  );
};

const BooleanParameter = ({ param = {}, color, onUpdate, parameters }) => {
  const handleChange = (event) => {
    if (onUpdate) {
      // Create a new set of parameters with the updated value
      const updatedParams = parameters.map(p => 
        p.key === param.key ? { ...p, value: event.target.checked } : p
      );
      onUpdate(updatedParams);
    }
  };

  return (
    <Box className="w-full">
      <Box className="flex items-center justify-between">
        <ParameterHeader
          title={param.name}
          description={param.description}
          icon={<Code size={16} />}
        />
        <Switch
          checked={param.value || false}
          onChange={handleChange}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: color,
              '&:hover': { backgroundColor: `${color}14` },
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: color,
            },
          }}
        />
      </Box>
    </Box>
  );
};

const ObjectParameter = ({ param = {}, onUpdate, parameters }) => {
  const [objectValue, setObjectValue] = useState(param.value || {});

  const handleChange = (newValue) => {
    setObjectValue(newValue);
    if (onUpdate) {
      const updatedParams = parameters.map(p => 
        p.key === param.key ? { ...p, value: newValue } : p
      );
      onUpdate(updatedParams);
    }
  };

  return (
    <Box className="w-full">
      <ParameterHeader
        title={param.key}
        description={param.description}
        icon={<Code size={16} />}
      />
      <DashedBox className="mt-2 p-4">
        {/* Object parameter editing UI */}
        <pre className="text-sm">{JSON.stringify(objectValue, null, 2)}</pre>
      </DashedBox>
    </Box>
  );
};

const FileParameter = ({ param = {}, onUpdate, parameters }) => {
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
        console.log('Base64 content:', fileContent);
        
        const newFileId = 'file_' + Math.random().toString(36).substring(2, 10);
        setFileId(newFileId);

        if (onUpdate) {
          console.log('File parameter updated:', param);  
          onUpdate({
        });
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
              onUpdate({ ...param, value: null });
            }
          }}
        />
      )}
    </Box>
  );
};

export const getParameterComponent = (param, color, onUpdate, parameters) => {
  const props = { param, color, onUpdate, parameters };

  if (!param) {
    console.warn('Undefined parameter passed to getParameterComponent');
    return null;
  }

  switch (param.type?.toLowerCase()) {
    case 'string':
      return <StringParameter {...props} />;
    case 'number':
      return <NumberParameter {...props} />;
    case 'boolean':
      return <BooleanParameter {...props} />;
    case 'object':
      return <ObjectParameter {...props} />;
    case 'file':
      return <FileParameter {...props} />;
    default:
      return <StringParameter {...props} />;
  }
};
