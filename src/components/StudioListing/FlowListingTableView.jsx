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
  Button
} from '@mui/material';
import { Network, ArrowUpRight, Trash2 } from 'lucide-react';
import { timeAgo } from '@/utils/commonFunction';

const FlowListingTableView = ({ filteredFlows, handleRunFlow, handleOpenStudio , handleDeleteFlow}) => {
  return (
    <Box className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <TableContainer component={Paper} className="shadow-none">
        <Table className="min-w-full">
          <TableHead className="bg-slate-50">
            <TableRow>
              <TableCell className="px-6 py-3 text-left text-xs font-semibold text-slate-500  tracking-wider">
                Name
              </TableCell>
              <TableCell className="px-6 py-3 text-left text-xs font-semibold text-slate-500  tracking-wider">
                Description
              </TableCell>
              <TableCell className="px-6 py-3 text-left text-xs font-semibold text-slate-500  tracking-wider">
                Last Updated
              </TableCell>
              <TableCell className="!px-25 py-3 !text-right text-xs font-semibold text-slate-500  tracking-wider">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="bg-white divide-y divide-slate-200">

            {filteredFlows.map((flow) => (
              <TableRow key={flow.id || flow.agent_id} className="hover:bg-slate-50">
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <Box className="flex items-center">
                    <Box className="h-8 w-8 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center mr-3">
                      <Network size={15}className="!text-[var(--primary-color)]"/>
                    </Box>
                    <Typography className="!text-sm !font-semibold">
                      {flow.name || flow.agent_name || "Unnamed Flow"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Box className="!text-sm !text-slate-500 line-clamp-1">
                    {flow?.description || flow?.agent_description || "No description available"}
                  </Box>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <Box className="!text-sm !text-slate-500">{timeAgo(flow?.updatedAt)}</Box>
                </TableCell>

                <TableCell className="!px-6 py-4 !justify-end whitespace-nowrap">
                  <Box className="flex items-center justify-center">
                    <Button
                      onClick={() => handleOpenStudio(flow.id)}
                      color="secondary"
                    >
                      <ArrowUpRight size={18} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteFlow(flow.id)}
                      color="error"
                    >
                      <Trash2 size={18} />
                    </Button>
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