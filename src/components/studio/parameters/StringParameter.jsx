"use client";
import React from 'react';
import { Box } from '@mui/material';
import InputBox from '@/components/Common/InputBox';

const StringParameter = ({ param = {}, color, onUpdate, parameters, parameter }) => {
  const handleChange = (value) => {
    const updatedParams = parameters.map(p => 
      p.key === param.key ? { ...p, value } : p
    );
    onUpdate(updatedParams, parameter);
  }

  return (
    <Box className="w-full">
      <InputBox
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
  );
};

export default StringParameter;
