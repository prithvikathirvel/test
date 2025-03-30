"use client"
import React,{useState} from 'react';
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
  color = '#6c5ce7',
  value = '',
  disabled = false,
  width = '100%',
  height = '40px',
  type = 'text',
  ...props
}) => {

  const [inputValue, setInputValue] = useState(value);

  const handleChange = (event) => {
    setInputValue(event.target.value);
    onChange(inputValue)
};

  return (
    <Box>
      {isShowLabel && <Typography className='!mb-2 !font-bold  !text-[13px]'>{convertToTitleCase(label)}</Typography>}

      <Box
        className={`flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md ${className} m-0`}
        sx={{
          '&:focus-within': {
            borderColor: color,
            boxShadow: '0 0 0 2px rgba(108, 92, 231, 0.1)',
          },
        }}
        style={{ width, height }}
        {...props}
      >
        {icon}
        <InputBase
          placeholder={placeholder}
          value={inputValue}
          onChange={(e)=>handleChange(e)}
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
