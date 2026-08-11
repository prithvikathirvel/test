"use client";
import React from 'react';
import { Box } from '@mui/material';
import ParameterHeader from './common/ParameterHeader';

const DropdownParameter = ({
  param = {},
  color = '#4f46e5',
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
        title={param.key || param.name}
        description={param.description}
        type={param.type || 'select'}
      />
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
      >
        <option value="" disabled>Select an option</option>
        {dropdownOptions.map((opt, idx) => (
          <option key={idx} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label || opt.value : opt}
          </option>
        ))}
      </select>
    </Box>
  );
};

export default DropdownParameter;
