"use client"
import React from 'react';
import { Box, InputBase, Typography } from '@mui/material';
import { Search } from 'lucide-react';
import { convertToTitleCase } from '@/utils/commonFunction';

const InputBox = ({
  placeholder = "Enter",
  isShowLabel = true,
  label = "",
  onChange,
  className = "",
  icon = <Search size={18} className="text-gray-400" />,
  color = 'var(--primary-color)',
  value = '',
  disabled = false,
  width = '100%',
  height = '40px',
  type = 'text',
  error = false,
  ...props
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <Box className={className}>
      {isShowLabel && (
        <Typography
          className={`!mb-2 !font-bold !text-[13px] ${error ? '!text-red-500' : ''}`}
        >
          {convertToTitleCase(label)}
        </Typography>
      )}
      <Box
        className={`flex items-center gap-2 px-2 border rounded-md ${className} m-0`}
        sx={{
          borderColor: error ? '#f44336' : '#d1d5db',
          '&:focus-within': {
            borderWidth: 1.5,
            borderColor: error ? '#f44336' : color,
            boxShadow: error ? '0 0 0 2px rgba(244, 67, 54, 0.1)' : '0 0 0 2px rgba(108, 92, 231, 0.1)',
          },
        }}
        style={{ width, height }}
        {...props}
      >
        {icon}
        <InputBase
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e)}
          className="flex-1 outline-none"
          disabled={disabled}
          type={type}
          sx={{
            fontSize: '14px',
            '& input::placeholder': {
              color: '#9ca3af',
              opacity: 1,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default InputBox;
