import React, { useState } from 'react';
import { Box, TextField, Typography, Paper, Button, Chip } from '@mui/material';
import { Upload, File, X, Check, FileText, Image, Video, AudioLines, Code } from 'lucide-react';
import SearchBox from '@/components/Common/SearchBox';

/**
 * Component for string type parameters
 */
export const StringParameter = ({ param, color }) => {
  const [value, setValue] = useState(param.value || '');
  console.log(param,'param')

  return (
    // <TextField
    //   fullWidth
    //   label={param.key}
    //   value={value}
    //   onChange={(e) => setValue(e.target.value)}
    //   variant="outlined"
    //   margin="dense"
    //   placeholder={`Enter ${param.key}`}
    //   className="rounded-lg"
    // />

    <SearchBox 
      placeholder={`Enter ${param.key}`} 
      className="mb-4"
      icon={""}
      color={color}
      value={value}
      label={param.key}
    />
  );
};

/**
 * Component for file type parameters with upload functionality
 */
export const FileParameter = ({ param }) => {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(param.value || '');
  
  // Determine file type icon
  const getFileIcon = (fileName) => {
    if (!fileName) return <File />;
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return <Image className="text-blue-500" />;
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return <Video className="text-purple-500" />;
    if (['mp3', 'wav', 'ogg'].includes(ext)) return <AudioLines className="text-green-500" />;
    if (['pdf'].includes(ext)) return <FileText className="text-red-500" />;
    return <File className="text-gray-500" />;
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setFileId('file_' + Math.random().toString(36).substring(2, 10));
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileId('');
  };

  return (
    <Box className="mb-2">
      <Typography variant="subtitle2" className="mb-1 font-medium text-gray-700">
        {param.key}
      </Typography>
      
      {!file ? (
        <Paper 
          variant="outlined" 
          className="p-4 border-dashed border-2 border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer flex flex-col items-center justify-center"
          onClick={() => document.getElementById(`file-upload-${param.key}`).click()}
        >
          <Upload className="mb-2 text-blue-500" />
          <Typography variant="body2" className="text-center text-gray-600">
            Click to upload or drag and drop<br />
            <span className="text-xs text-gray-500">Supported formats: PDF, DOC, JPG, PNG</span>
          </Typography>
          <input
            type="file"
            id={`file-upload-${param.key}`}
            onChange={handleFileChange}
            className="hidden"
          />
        </Paper>
      ) : (
        <Paper variant="outlined" className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center space-x-2">
              {getFileIcon(file.name)}
              <Box>
                <Typography 
                  variant="body2" 
                  className="font-medium line-clamp-1 max-w-[100px] text-gray-800"
                >
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
                onClick={removeFile}
                className="min-w-0 p-1"
              >
                <X size={18} />
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};


export const NumberParameter = ({ param }) => {
  const [value, setValue] = useState(param.value || '');

  return (
    <TextField
      hiddenLabel
      fullWidth
      label={param.key}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      variant="outlined"
      margin="dense"
      type="number"
      InputProps={{ inputProps: { min: 0 } }}
      placeholder={`Enter ${param.key}`}
     
    />
  );
};

/**
 * Component for boolean type parameters
 */
export const BooleanParameter = ({ param }) => {
  const [value, setValue] = useState(param.value === 'true' || param.value === true);

  return (
    <Box className="mb-2">
      <Typography variant="subtitle2" className="mb-1 font-medium text-gray-700">
        {param.key}
      </Typography>
      <Box className="flex space-x-2">
        <Button
          variant={value ? "contained" : "outlined"}
          color="primary"
          onClick={() => setValue(true)}
          className={`rounded-lg ${value ? 'bg-blue-500' : 'border-blue-500 text-blue-500'}`}
        >
          Yes
        </Button>
        <Button
          variant={!value ? "contained" : "outlined"}
          color="primary"
          onClick={() => setValue(false)}
          className={`rounded-lg ${!value ? 'bg-blue-500' : 'border-blue-500 text-blue-500'}`}
        >
          No
        </Button>
      </Box>
    </Box>
  );
};

/**
 * Component for object type parameters
 */
export const ObjectParameter = ({ param, color }) => {
  const [objectValues, setObjectValues] = useState(param.value || {});

  console.log(param,'objectValues')

  const handleValueChange = (key, value) => {
    setObjectValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Determine the type of each object value and render appropriate input
  const renderObjectValueInput = (key, value) => {
    const type = typeof value;
    
    switch (type) {
      case 'string':
        return (
          <SearchBox
            key={key}
            label={key}
            placeholder={`Enter ${key}`}
            value={value}
            color={color}
            className="mb-2"
            onSearch={(newValue) => handleValueChange(key, newValue)}
          />
        );
      case 'number':
        return (
          <TextField
            key={key}
            fullWidth
            label={key}
            type="number"
            value={value}
            onChange={(e) => handleValueChange(key, Number(e.target.value))}
            variant="outlined"
            margin="dense"
            className="mb-2"
          />
        );
      case 'boolean':
        return (
          <Box key={key} className="flex space-x-2 mb-2">
            <Button
              variant={value ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleValueChange(key, true)}
              className={`rounded-lg ${value ? 'bg-blue-500' : 'border-blue-500 text-blue-500'}`}
            >
              Yes
            </Button>
            <Button
              variant={!value ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleValueChange(key, false)}
              className={`rounded-lg ${!value ? 'bg-blue-500' : 'border-blue-500 text-blue-500'}`}
            >
              No
            </Button>
          </Box>
        );
      default:
        return (
          <SearchBox
            key={key}
            label={key}
            placeholder={`Enter ${key}`}
            value={String(value)}
            color={color}
            className="mb-2"
            onSearch={(newValue) => handleValueChange(key, newValue)}
          />
        );
    }
  };

  return (
    <Box className="!bg-red-500">
      <Typography variant="subtitle2" className="mb-2 flex items-center gap-2">
        <Code size={16} color={color} />
        {param.key}
      </Typography>
      <Paper 
        variant="outlined" 
        className="p-3 rounded-lg bg-gray-50 border-dashed "
      >
        {Object.entries(objectValues).map(([key, value]) => (
          <Box key={key} className="mb-2">
            {renderObjectValueInput(key, value)}
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

/**
 * Factory function to get the appropriate parameter component based on type
 */
export const getParameterComponent = (param, color) => {
  switch (param.type?.toLowerCase()) {
    case 'string':
    case 'text':
      return <StringParameter param={param} color={color} />;
    case 'file':
    case 'upload':
      return <FileParameter param={param} color={color} />;
    case 'number':
    case 'integer':
    case 'float':
      return <NumberParameter param={param} color={color} />;
    case 'boolean':
    case 'bool':
      return <BooleanParameter param={param} color={color} />;
    case 'object':
      return <ObjectParameter param={param} color={color} />;
    default:
      return <StringParameter param={param} color={color} />;
  }
};
