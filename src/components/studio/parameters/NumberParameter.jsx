"use client";
import React from 'react';
import { Box } from '@mui/material';
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
        title={param.key || param.name}
        description={param.description}
        type={param.type || 'number'}
      />
      <InputBox
        type="number"
        placeholder={`Enter ${param.key || 'number'}...`}
        icon={""}
        color={color}
        value={param.value ?? ''}
        label=""
        isShowLabel={false}
        onChange={handleChange}
      />
    </Box>
  );
};

export default NumberParameter;
