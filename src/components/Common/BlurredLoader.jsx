import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Workflow, Sparkles } from 'lucide-react';

const BlurredLoader = ({title="Loading"}) => {
  return (
    <Box className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/35 backdrop-blur-sm">
      <Paper className="border border-slate-200/80 bg-white/95 rounded-2xl shadow-[0_24px_70px_-35px_rgba(15,23,42,0.65)] overflow-hidden">
        <Box className="flex items-center gap-3 px-5 py-4">
          <Box className="relative h-10 w-10 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="absolute inset-0 rounded-xl animate-ping bg-indigo-400/20" />
            <Workflow className="relative h-5 w-5" />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-emerald-500" />
          </Box>
          <Box>
            <Typography className="!text-[13px] !font-semibold !text-slate-800">
              {title}
            </Typography>
            <Typography className="!text-[11px] !text-slate-400">
              Preparing your agent workflow…
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default BlurredLoader;