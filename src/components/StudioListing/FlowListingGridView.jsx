import React from 'react';
import { Box, Card, Typography, Tooltip } from '@mui/material';
import { Play, ArrowUpRight, Clock, Trash2, Network } from 'lucide-react';
import { timeAgo } from "@/utils/commonFunction";
import CustomButton from "@/components/Common/CustomButton";

const FlowListingGridView = ({ flows, handleRunFlow, handleOpenStudio, handleDeleteFlow }) => {
  return (
    <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {flows.map((flow) => (
        <Card
          key={flow.id || flow.agent_id}
          className="group relative bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
        >
          <Box className="p-5 flex-1 flex flex-col">
            <Box className="flex items-start justify-between gap-3 mb-2">
              <Box className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Network size={16} />
                </div>
                <Typography className="!text-[15px] !font-bold !text-slate-900 !tracking-tight line-clamp-1">
                  {flow.name || flow.agent_name || "Unnamed Flow"}
                </Typography>
              </Box>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                v1.0
              </span>
            </Box>

            <Typography className="!text-[13px] !text-slate-500 !mb-4 !line-clamp-2 !leading-relaxed flex-1">
              {flow.description || flow.agent_description || "No description provided for this flow."}
            </Typography>

            <Box className="flex items-center text-[11px] text-slate-400 gap-1.5 pt-3 border-t border-slate-100">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeAgo(flow.updatedAt)}</span>
            </Box>
          </Box>

          <Box className="flex items-center justify-between px-5 py-3 bg-slate-50/70 border-t border-slate-100 gap-2">
            <button
              onClick={() => handleRunFlow(flow)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 transition-colors"
            >
              <Play size={13} className="fill-blue-700" /> Run
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleOpenStudio(flow.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors"
              >
                Studio <ArrowUpRight size={13} />
              </button>

              <Tooltip title="Delete Flow">
                <button
                  onClick={() => handleDeleteFlow(flow.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
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
