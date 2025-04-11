"use client";
import React from 'react';
import { Box, Switch } from '@mui/material';
import { Code } from 'lucide-react';
import ParameterHeader from './common/ParameterHeader';

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

export default BooleanParameter;
