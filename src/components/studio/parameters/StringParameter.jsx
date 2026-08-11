"use client";
import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import InputBox from '@/components/Common/InputBox';
import ParameterHeader from './common/ParameterHeader';

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
      <ParameterHeader
        title={param.key || param.name}
        description={param.description}
        type={param.type || 'text'}
      />
      <InputBox
        placeholder={`Enter ${param.key || 'value'}...`}
        icon={""}
        color={color}
        value={localValue}
        label=""
        isShowLabel={false}
        onChange={handleChange}
      />
    </Box>
  );
};

export default StringParameter;
