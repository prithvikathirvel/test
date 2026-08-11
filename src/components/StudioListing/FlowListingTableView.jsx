import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box,
  Paper,
  Typography,
  Tooltip
} from '@mui/material';
import { Workflow, ArrowUpRight, Trash2, Play } from 'lucide-react';
import { timeAgo } from '@/utils/commonFunction';

const FlowListingTableView = ({ filteredFlows, handleRunFlow, handleOpenStudio, handleDeleteFlow }) => {
  return (
    <Box className="bg-white rounded-xl shadow-2xs overflow-hidden border border-slate-200/80">
      <TableContainer component={Paper} className="shadow-none">
        <Table className="min-w-full">
          <TableHead className="bg-slate-50/80 border-b border-slate-200/80">
            <TableRow>
              <TableCell className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Workflow Name
              </TableCell>
              <TableCell className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Description
              </TableCell>
              <TableCell className="px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Last Modified
              </TableCell>
              <TableCell className="px-6 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="bg-white divide-y divide-slate-100">
            {filteredFlows.map((flow) => (
              <TableRow key={flow.id || flow.agent_id} className="hover:bg-slate-50/60 transition-colors">
                <TableCell className="px-6 py-3.5 whitespace-nowrap">
                  <Box className="flex items-center gap-2.5">
                    <Box className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <Workflow size={14} />
                    </Box>
                    <Typography className="!text-[13px] !font-semibold !text-slate-900">
                      {flow.name || flow.agent_name || "Unnamed Flow"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell className="px-6 py-3.5">
                  <Box className="!text-[12.5px] !text-slate-500 line-clamp-1 max-w-md">
                    {flow?.description || flow?.agent_description || "No description provided"}
                  </Box>
                </TableCell>
                <TableCell className="px-6 py-3.5 whitespace-nowrap">
                  <Box className="!text-[12px] !text-slate-500">{timeAgo(flow?.updatedAt)}</Box>
                </TableCell>

                <TableCell className="px-6 py-3.5 whitespace-nowrap text-right">
                  <Box className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleRunFlow?.(flow)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md shadow-2xs transition-colors"
                    >
                      <Play size={11} className="fill-slate-700 text-slate-700" /> Run
                    </button>
                    <button
                      onClick={() => handleOpenStudio(flow.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md shadow-2xs transition-colors"
                    >
                      Open <ArrowUpRight size={12} />
                    </button>
                    <Tooltip title="Delete Flow">
                      <button
                        onClick={() => handleDeleteFlow(flow.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FlowListingTableView;
