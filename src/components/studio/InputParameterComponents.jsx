"use client";
import React, { useState, useCallback, useEffect } from 'react';
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

const StringParameter = ({ param = {}, color, onUpdate, parameters, parameter }) => {
  const [localValue, setLocalValue] = useState(param.value || '');

  useEffect(() => {
    setLocalValue(param.value || '');
  }, [param.value]);

  const handleChange = (value) => {
    setLocalValue(value);
    const updatedParams = parameters.map(p => 
      p.key === param.key ? { ...p, value } : p
    );
    onUpdate(updatedParams, parameter, true);
  };

  return (
    <Box className="w-full">
      <InputBox
        placeholder={`Enter ${param.key}`}
        className="mb-4"
        icon={""}
        color={color}
        value={localValue}
        label={param.key}
        isShowLabel={true}
        onChange={handleChange}
      />
    </Box>
  );
};

const NumberParameter = ({ param = {}, color, onUpdate, parameters, parameter }) => {
  const handleChange = (value) => {
    if (onUpdate) {
      const updatedParams = parameters.map(p => 
        p.key === param.key ? { ...p, value: Number(value) } : p
      );
      onUpdate(updatedParams, parameter);
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
          value={param.value || ''}
          label={param.key}
          isShowLabel={true}
          onChange={handleChange}
        />
      </Box>
    </Box>
  );
};

const BooleanParameter = ({ param = {}, color, onUpdate, parameters, parameter }) => {
  const handleChange = (event) => {
    if (onUpdate) {
      const updatedParams = parameters.map(p => 
        p.key === param.key ? { ...p, value: event.target.checked } : p
      );
      onUpdate(updatedParams, parameter);
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

export const ObjectParameter = ({ param, color = "#4f46e5", isAddNew = true, initialValues = {key:'key',value:'value'}, onChange, parameters, parameter, onUpdate }) => {
  const [objectValues, setObjectValues] = useState(param.value || initialValues);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState(null);

  const handleValueChange = (key, value) => {
    const updatedValues = { ...objectValues, [key]: value };
    setObjectValues(updatedValues);
    
    // Update specification if onUpdate is provided
    if (onUpdate && parameters) {
      const updatedParams = parameters.map(p => 
        p.key === param.key ? { ...p, value: updatedValues } : p
      );
      onUpdate(updatedParams, parameter);
    }
    
    if (onChange) onChange(updatedValues);
  };

  const handleAddNewField = () => {
    if (!newKey.trim()) {
      setError("Key cannot be empty");
      return;
    }

    if (objectValues.hasOwnProperty(newKey)) {
      setError("Key already exists");
      return;
    }

    let processedValue = newValue;
    if (!isNaN(Number(newValue)) && newValue.trim() !== "") {
      processedValue = Number(newValue);
    } else if (newValue.toLowerCase() === "true") {
      processedValue = true;
    } else if (newValue.toLowerCase() === "false") {
      processedValue = false;
    }

    handleValueChange(newKey, processedValue);
    setNewKey("");
    setNewValue("");
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && newKey && newValue) {
      handleAddNewField();
    }
  };

  const renderKeyValuePair = (key, value) => (
    <Box key={key} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center mb-3">
      <InputBox
        value={key}
        isShowLabel={false}
        className="bg-white"
        height="30px"
        disabled={true}
        icon=''
        color={color}
      />
      {typeof value === "boolean" ? (
        <Box className="flex items-center gap-2">
          <Switch 
            checked={value} 
            onChange={(e) => handleValueChange(key, e.target.checked)} 
            color="primary" 
          />
          <Typography variant="body2">{value ? "True" : "False"}</Typography>
        </Box>
      ) : (
        <InputBox
          value={String(value)}
          isShowLabel={false}
          className="bg-white"
          color={color}
          height="30px"
          onChange={(newValue) => {
            const processedValue = typeof objectValues[key] === "number" && !isNaN(Number(newValue)) 
              ? Number(newValue) 
              : newValue;
            handleValueChange(key, processedValue);
          }}
          icon=''
        />
      )}
      <IconButton 
        onClick={() => {
          const newValues = { ...objectValues };
          delete newValues[key];
          setObjectValues(newValues);
          if (onChange) onChange(newValues);
        }} 
        size="small" 
        className="text-gray-500 hover:text-red-500"
      >
        <Trash2 size={16} />
      </IconButton>
    </Box>
  );

  return (
    <Box className="space-y-3">
      <ObjectParameterHeader 
        title={param.key}
        description={param.description}
      />

      <DashedBox className="!p-4">
        <Box className="grid grid-cols-[1fr_1fr_auto] gap-4 mb-3 px-1">
          <Typography variant="caption" className="font-medium text-gray-500">Key</Typography>
          <Typography variant="caption" className="font-medium text-gray-500">Value</Typography>
          <Box />
        </Box>

        <Box className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {Object.entries(objectValues).length === 0 ? (
            <Box className="text-center py-4 text-sm text-gray-500">
              No properties defined. Add a new key-value pair below.
            </Box>
          ) : (
            Object.entries(objectValues).map(([key, value]) => renderKeyValuePair(key, value))
          )}
        </Box>

        {isAddNew && (
          <Box className="pt-2">
            <Divider />
            <Box className={`grid gap-4 mt-4 ${error ? "mb-1" : "mb-3"}`}>
              <KeyValueInput 
                newKey={newKey}
                newValue={newValue}
                onKeyChange={(value) => {
                  setNewKey(value);
                  setError(null);
                }}
                onValueChange={setNewValue}
                onAdd={handleAddNewField}
                color={color}
                onKeyPress={handleKeyPress}
              />
            </Box>
            {error && (
              <Box className="flex items-center gap-2 text-red-500 text-sm mt-2 bg-red-50 p-2 rounded-md border border-red-200">
                <X size={14} />
                <Typography variant="caption" className="text-red-600 font-medium">
                  {error}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DashedBox>
    </Box>
  );
};

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

const ArrayParameter = ({ param, color, onUpdate, parameters, parameter }) => {
  const [arrayItems, setArrayItems] = useState(param.value || []);
  const [selectedType, setSelectedType] = useState('string');

  const fieldTypes = [
    { value: 'string', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'object', label: 'Object' },
    { value: 'file', label: 'File' }
  ];

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      type: selectedType,
      value: selectedType === 'boolean' ? false : selectedType === 'object' ? {} : ''
    };
    const updatedItems = [...arrayItems, newItem];
    setArrayItems(updatedItems);
    updateParentValue(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = arrayItems.filter((_, idx) => idx !== index);
    setArrayItems(updatedItems);
    updateParentValue(updatedItems);
  };

  const handleItemUpdate = (index, value) => {
    const updatedItems = arrayItems.map((item, idx) => 
      idx === index ? { ...item, value } : item
    );
    setArrayItems(updatedItems);
    updateParentValue(updatedItems);
  };

  const updateParentValue = (items) => {
    if (onUpdate) {
      const updatedParams = parameters.map(p => 
        p.key === param.key ? { ...p, value: items } : p
      );
      onUpdate(updatedParams, parameter);
    }
  };

  return (
    <Box className="space-y-3">
      <ParameterHeader
        title={param.key}
        icon={<Code size={18} />}
        description={param.description}
      />
      <DashedBox className="!p-4">
        <Box className="space-y-4">
          {arrayItems.map((item, index) => (
            <Box key={item.id} className="relative p-3 bg-gray-50 rounded-lg">
              <Box className="absolute right-2 top-2">
                <IconButton
                  onClick={() => handleRemoveItem(index)}
                  size="small"
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </IconButton>
              </Box>
              <Typography variant="caption" className="text-gray-500 mb-2 block">
                Item {index + 1}
              </Typography>
              {getParameterComponent(
                { ...param, type: item.type, value: item.value, key: `${param.key}[${index}]` },
                color,
                (_, __, value) => handleItemUpdate(index, value),
                parameters,
                parameter
              )}
            </Box>
          ))}
          <Box className="flex items-center gap-4 mt-4">
            <Box className="w-40">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                {fieldTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Box>
            <Button
              variant="outlined"
              onClick={handleAddItem}
              startIcon={<Plus size={16} />}
              size="small"
            >
              Add Item
            </Button>
          </Box>
        </Box>
      </DashedBox>
    </Box>
  );
};

const DropdownParameter = ({
  param = {},
  color,
  onUpdate,
  parameters,
  parameter,
}) => {
  const { key, value = '', dropdownOptions = [] } = param;

  const handleChange = (selectedValue) => {
    // Create updated parameters array with the new value
    const updatedParams = parameters.map(p => 
      p.key === param.key ? { ...p, value: selectedValue } : p
    );
    // Call onUpdate with the same signature as other parameter components
    onUpdate(updatedParams, parameter, true);
  };

  return (
    <Box className="w-full">
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{
          borderColor: color,
          backgroundColor: 'white',
          minHeight: '40px',
        }}
      >
        {dropdownOptions.map((option, index) => (
          <option key={index} value={option}>
            {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </option>
        ))}
      </select>
    </Box>
  );
};

export const getParameterComponent = (param, color, onUpdate, parameters, parameter) => {
  const props = { param, color, onUpdate, parameters, parameter };

  if (!param) {
    console.warn('Undefined parameter passed to getParameterComponent');
    return null;
  }

  console.log("parameter inside getParameterComponent", parameter);

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
    case 'array':
      return <ArrayParameter {...props} />;
    case 'dropdown':
      return <DropdownParameter {...props} />;
    default:
      return <StringParameter {...props} />;
  }
};
