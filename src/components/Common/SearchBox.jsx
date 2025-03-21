import React, { useState } from 'react';
import { Box, InputBase, Typography } from '@mui/material';
import { Search } from 'lucide-react';
import { convertToTitleCase } from '@/utils/commonFunction';

/**
 * Reusable SearchBox component with customizable placeholder and onSearch handler
 */
const SearchBox = ({ 
  placeholder = "Enter",
  label = "",
  onSearch, 
  className = "" ,
  icon = <Search size={18} className="text-gray-400" />,
  color = '#6c5ce7',
  value = '',
  disabled = false,
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <Box>
      <Typography className='!mb-2 !font-bold  !text-[13px]'>{convertToTitleCase(label)}</Typography>
      <Box 
      className={`flex items-center gap-2 mb-4 px-3 py-1.5 border border-gray-300 rounded-md ${className}`}
      sx={{ 
        '&:focus-within': {
          borderColor: color,
          boxShadow: '0 0 0 2px rgba(108, 92, 231, 0.1)'
        }
      }}
      {...props}
    >
      {icon}
      <InputBase 
       disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={handleSearchChange}
        className="flex-1"
        sx={{
          fontSize: '14px',
          '& input::placeholder': {
            color: '#9ca3af',
            opacity: 1
          }
        }}
      />
    </Box>
    </Box>
  );
};

export default SearchBox;
