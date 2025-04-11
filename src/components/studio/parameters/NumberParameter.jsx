"use client";
import React from 'react';
import { Box } from '@mui/material';
import { Code } from 'lucide-react';
import InputBox from '@/components/Common/InputBox';
import ParameterHeader from './common/ParameterHeader';

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

export default NumberParameter;
