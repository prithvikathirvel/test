"use client";
import React from 'react';
import { Box, Switch } from '@mui/material';
import ParameterHeader from './common/ParameterHeader';

const BooleanParameter = ({ param = {}, color = '#4f46e5', onUpdate, parameters, parameter }) => {
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
      <div className="flex items-center justify-between">
        <ParameterHeader
          title={param.key || param.name}
          description={param.description}
          type={param.type || 'boolean'}
        />
        <Switch
          checked={Boolean(param.value)}
          onChange={handleChange}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: color,
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: color,
            },
          }}
        />
      </div>
    </Box>
  );
};

export default BooleanParameter;
