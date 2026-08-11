import React from 'react';
import { Paper, Box } from '@mui/material';

const DetailsCard = ({ title, icon, flows, width = '80' }) => {
  return (
    <Paper
      elevation={0}
      className="!min-w-72 flex-1 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5">{flows?.length || 0}</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          {icon}
        </div>
      </div>
    </Paper>
  );
};

export default DetailsCard;
