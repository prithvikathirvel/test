import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {Zap ,Loader  } from 'lucide-react';

const BlurredLoader = ({title="Loading"}) => {
  return (
    <Box className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <Paper className="p-4 bg-white rounded-xl shadow-xl">
        <Box className="flex items-center space-x-3">
          <Box className="animate-spin">
            <Loader className="h-6 w-6 text-purple-600" />
          </Box>
          <Typography className="!text-slate-700 !font-xs">
            {title}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default BlurredLoader;