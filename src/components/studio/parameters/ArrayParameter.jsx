"use client";
import React, { useState } from 'react';
import { Box, Typography, IconButton,Button } from '@mui/material';
import { Trash2 } from 'lucide-react';
import ParameterHeader from './common/ParameterHeader';
import DashedBox from '@/components/Common/DashedBox';
import { Code,Plus } from 'lucide-react'; 
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

export default ArrayParameter;