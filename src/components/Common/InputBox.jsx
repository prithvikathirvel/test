"use client";
import React from 'react';
import { Box, InputBase, Typography } from '@mui/material';
import { Search } from 'lucide-react';
import { convertToTitleCase } from '@/utils/commonFunction';

const InputBox = ({
  placeholder = "Enter text...",
  isShowLabel = true,
  label = "",
  onChange,
  className = "",
  icon = null,
  value = '',
  disabled = false,
  width = '100%',
  height = '38px',
  type = 'text',
  error = false,
  ...props
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <Box className={className} style={{ width }}>
      {isShowLabel && label && (
        <Typography
          className={`!mb-1.5 !font-semibold !text-[12px] !tracking-tight ${
            error ? '!text-red-600' : '!text-slate-700'
          }`}
        >
          {convertToTitleCase(label)}
        </Typography>
      )}
      <Box
        className={`flex items-center gap-2 px-3 border rounded-lg bg-white transition-all duration-150 ${
          disabled ? 'bg-slate-50 opacity-60' : ''
        }`}
        sx={{
          borderColor: error ? '#ef4444' : '#e2e8f0',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
          '&:hover': {
            borderColor: error ? '#ef4444' : '#cbd5e1',
          },
          '&:focus-within': {
            borderColor: error ? '#ef4444' : '#2563eb',
            boxShadow: error
              ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
              : '0 0 0 3px rgba(37, 99, 235, 0.15)',
          },
        }}
        style={{ height }}
        {...props}
      >
        {icon}
        <InputBase
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className="flex-1 outline-none"
          disabled={disabled}
          type={type}
          sx={{
            fontSize: '13px',
            color: '#0f172a',
            '& input::placeholder': {
              color: '#94a3b8',
              opacity: 1,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default InputBox;
