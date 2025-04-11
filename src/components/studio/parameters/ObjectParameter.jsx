"use client";
import React, { useState } from 'react';
import { Box, Typography, IconButton, Switch, Divider } from '@mui/material';
import { X, Trash2 } from 'lucide-react';
import InputBox from '@/components/Common/InputBox';
import DashedBox from '@/components/Common/DashedBox';
import KeyValueInput from './common/KeyValueInput';
import ObjectParameterHeader from './common/ObjectParameterHeader';

const ObjectParameter = ({ param, color = "#4f46e5", isAddNew = true, initialValues = {key:'key',value:'value'}, onChange, parameters, parameter, onUpdate }) => {
  const [objectValues, setObjectValues] = useState(param.value || initialValues);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState(null);

  const handleValueChange = (key, value) => {
    const updatedValues = { ...objectValues, [key]: value };
    setObjectValues(updatedValues);
    
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

export default ObjectParameter;
