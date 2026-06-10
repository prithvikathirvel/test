"use client";
import React from 'react';
import { Box } from '@mui/material';
import ParameterHeader from './common/ParameterHeader';


const DropdownParameter = ({
  param = {},
  color,
  onUpdate,
  parameters,
  parameter,
}) => {
  const { key, value = '', dropdownOptions = [] } = param;

  const handleChange = (selectedValue) => {
    const updatedParams = parameters.map(p => 
      p.key === param.key ? { ...p, value: selectedValue } : p
    );
    onUpdate(updatedParams, parameter, true);
  };

  return (
    <Box className="w-full">
      <ParameterHeader
        title={param.key}
        description={param.description}
      />
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

export default DropdownParameter;