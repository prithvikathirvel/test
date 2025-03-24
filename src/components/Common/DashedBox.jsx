import React from 'react';
import { Paper } from '@mui/material';

const DashedBox = ({ children, className = '', elevation = 0, ...props }) => {
  return (
    <Paper
      variant="outlined"
      elevation={elevation}
      className={`!bg-gray-50 !border-dashed ${className}`}
      {...props}
    >
      {children}
    </Paper>
  );
};

export default DashedBox;
