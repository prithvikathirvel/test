"use client";
import React from 'react';
import { Box,Typography } from '@mui/material';
import {convertToTitleCase} from '@/utils/commonFunction'; 


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
      <Typography className='!mb-2 !font-bold  !text-[13px] '>
                {convertToTitleCase(param?.key)}
      </Typography>
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