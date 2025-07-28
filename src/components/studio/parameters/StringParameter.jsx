"use client";
import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import InputBox from '@/components/Common/InputBox';

const StringParameter = ({ param = {}, color, onUpdate, parameters, parameter }) => {
  const [localValue, setLocalValue] = useState(param.value || '');

  useEffect(() => {
    setLocalValue(param.value || '');
  }, [param.value]);

  const handleChange = (value) => {
    setLocalValue(value);
    const updatedParams = parameters.map(p => 
      p.key === param.key ? { ...p, value } : p
    );
    onUpdate(updatedParams, parameter, true);
  };

  return (
    <Box className="w-full">
      <InputBox
        placeholder={`Enter ${param.key}`}
        className="mb-4"
        icon={""}
        color={color}
        value={localValue}
        label={param.key}
        isShowLabel={true}
        onChange={handleChange}
      />
    </Box>
  );
};

export default StringParameter;
