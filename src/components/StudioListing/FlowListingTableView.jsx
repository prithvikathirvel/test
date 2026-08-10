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
  Tooltip
} from '@mui/material';
import { Workflow, ArrowUpRight, Play, Trash2 } from 'lucide-react';
import { timeAgo } from '@/utils/commonFunction';

const FlowListingTableView = ({ filteredFlows, handleRunFlow, handleOpenStudio, handleDeleteFlow }) => {
  return (
    <Box className="bg-white rounded-xl shadow-sm overflow-hidden border border-zinc-200">
      <TableContainer component={Paper} className="shadow-none">
        <Table className="min-w-full">
          <TableHead className="bg-zinc-50 border-b border-zinc-200">
            <TableRow>
              <TableCell className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Name
              </TableCell>
              <TableCell className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Description
              </TableCell>
              <TableCell className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Status
              </TableCell>
              <TableCell className="px-5 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Updated
              </TableCell>
              <TableCell className="px-5 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="bg-white divide-y divide-zinc-100">
            {filteredFlows.map((flow) => (
              <TableRow key={flow.id || flow.agent_id} className="hover:bg-zinc-50/70 transition-colors">
                <TableCell className="px-5 py-3.5 whitespace-nowrap">
                  <Box className="flex items-center gap-2.5">
                    <Box className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                      <Workflow size={15} className="text-zinc-700" />
                    </Box>
                    <span className="text-xs font-semibold text-zinc-900">
                      {flow.name || flow.agent_name || "Unnamed workflow"}
                    </span>
                  </Box>
                </TableCell>

                <TableCell className="px-5 py-3.5 max-w-xs">
                  <Box className="text-xs text-zinc-500 line-clamp-1">
                    {flow?.description || flow?.agent_description || "AI agent workflow"}
                  </Box>
                </TableCell>

                <TableCell className="px-5 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {flow.status || "Live"}
                  </span>
                </TableCell>

                <TableCell className="px-5 py-3.5 whitespace-nowrap">
                  <Box className="text-xs text-zinc-400">
                    {timeAgo(flow?.updatedAt)}
                  </Box>
                </TableCell>

                <TableCell className="px-5 py-3.5 whitespace-nowrap text-right">
                  <Box className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenStudio(flow.id)}
                      className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
                    >
                      Open
                    </button>

                    <button
                      onClick={() => handleRunFlow(flow)}
                      className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 transition-colors"
                      title="Run"
                    >
                      <Play size={14} />
                    </button>

                    <button
                      onClick={() => handleDeleteFlow(flow.id)}
                      className="p-1.5 rounded text-zinc-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
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
