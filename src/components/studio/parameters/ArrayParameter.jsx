"use client";
import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Switch } from '@mui/material';
import { Trash2 } from 'lucide-react';
import ParameterHeader from './common/ParameterHeader';
import DashedBox from '@/components/Common/DashedBox';
import { Code, Plus } from 'lucide-react';

const ArrayParameter = ({ param, color, onUpdate, parameters, parameter }) => {
  // Check if the value is a string (indicating it was edited in text mode)
  const isStringValue = typeof param.value === 'string';
  const [arrayItems, setArrayItems] = useState(isStringValue ? [] : param.value || []);
  const [useTextInput, setUseTextInput] = useState(isStringValue);
  const [selectedType, setSelectedType] = useState('string');
  const [textInputValue, setTextInputValue] = useState('');
  const [error, setError] = useState(null);

  // Initialize component based on input type
  useEffect(() => {
    const isString = typeof param.value === 'string';
    setUseTextInput(isString);
    
    if (isString) {
      setTextInputValue(param.value);
    } else {
      setArrayItems(param.value || []);
      setTextInputValue(JSON.stringify(param.value || [], null, 2));
    }
  }, [param.value]);

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

  const handleTextInputChange = (value) => {
    setTextInputValue(value);
    if (onUpdate && parameters) {
      const updatedParams = parameters.map(p => 
        p.key === param.key ? { ...p, value } : p
      );
      onUpdate(updatedParams, parameter);
    }
  };

  const toggleInputMode = () => {
    if (!useTextInput) {
      setTextInputValue(
        typeof arrayItems === 'string' 
          ? arrayItems 
          : JSON.stringify(arrayItems || [], null, 2)
      );
    }
    setUseTextInput(!useTextInput);
  };

  return (
    <Box className="space-y-3">
      <Box className="flex justify-between items-center">
        <ParameterHeader
          title={param.key}
          icon={<Code size={18} />}
          description={param.description}
        />
        <Box className="flex items-center">
          <Typography variant="caption" className="mr-1 text-gray-500">
            Use Text Input
          </Typography>
          <Switch
            size="small"
            checked={useTextInput}
            onChange={toggleInputMode}
            color="primary"
          />
        </Box>
      </Box>
      <DashedBox className="!p-4">
        {useTextInput ? (
          <Box className="space-y-2">
            <InputBox
              value={textInputValue}
              onChange={handleTextInputChange}
              isShowLabel={false}
              multiline
              rows={6}
              className="font-mono text-sm"
              color={color}
              placeholder='Enter JSON array (e.g., ["item1", "item2"])'
            />
            {error && (
              <Typography color="error" variant="caption" className="text-red-600 text-xs">
                {error}
              </Typography>
            )}
          </Box>
        ) : arrayItems.length === 0 ? (
          <Typography variant="body2" className="text-gray-500 p-2">
            {param.description}
          </Typography>
        ) : (
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
        )}
      </DashedBox>
    </Box>
  );
};

export default ArrayParameter;