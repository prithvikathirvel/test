import React from 'react';
import { Box, Card, Typography, Tooltip } from '@mui/material';
import { Play, ArrowUpRight, Clock, Trash2, Workflow } from 'lucide-react';
import { timeAgo } from "@/utils/commonFunction";

const FlowListingGridView = ({ flows, handleRunFlow, handleOpenStudio, handleDeleteFlow }) => {
  return (
    <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flows.map((flow) => (
        <Card
          key={flow.id || flow.agent_id}
          className="group relative bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between"
        >
          <Box className="p-4 flex-1 flex flex-col">
            <Box className="flex items-start justify-between gap-3 mb-1.5">
              <Box className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                  <Workflow size={14} />
                </div>
                <Typography className="!text-[13.5px] !font-bold !text-slate-900 !tracking-tight line-clamp-1">
                  {flow.name || flow.agent_name || "Unnamed Flow"}
                </Typography>
              </Box>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200">
                v1.0
              </span>
            </Box>

            <Typography className="!text-[12.5px] !text-slate-500 !mb-3 !line-clamp-2 !leading-relaxed flex-1">
              {flow.description || flow.agent_description || "No description provided for this workflow."}
            </Typography>

            <Box className="flex items-center text-[11px] text-slate-400 gap-1.5 pt-2.5 border-t border-slate-100">
              <Clock className="h-3 w-3" />
              <span>{timeAgo(flow.updatedAt)}</span>
            </Box>
          </Box>

          <Box className="flex items-center justify-between px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 gap-2">
            <button
              onClick={() => handleRunFlow(flow)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
            >
              <Play size={11} className="fill-slate-700 text-slate-700" /> Run
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleOpenStudio(flow.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
              >
                Open <ArrowUpRight size={12} />
              </button>

              <Tooltip title="Delete Flow">
                <button
                  onClick={() => handleDeleteFlow(flow.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </Tooltip>
            </div>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default FlowListingGridView;
