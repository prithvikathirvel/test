import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import { Workflow, ArrowUpRight, Trash2 } from 'lucide-react';
import { timeAgo } from '@/utils/commonFunction';

const FlowListingTableView = ({ filteredFlows, handleOpenStudio, handleDeleteFlow }) => {
  return (
    <Box className="w-full bg-white rounded-xl shadow-2xs overflow-hidden border border-slate-200/80">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Flow Name
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Last Updated
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredFlows.map((flow) => (
              <tr key={flow.id || flow.agent_id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Workflow size={14} />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-800">
                      {flow.name || flow.agent_name || "Unnamed Flow"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[12.5px] text-slate-500 line-clamp-1 max-w-md block">
                    {flow?.description || flow?.agent_description || "No description available"}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="text-[12px] text-slate-400">{timeAgo(flow?.updatedAt)}</span>
                </td>

                <td className="px-5 py-3.5 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenStudio(flow.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                    >
                      Open Studio <ArrowUpRight size={13} />
                    </button>
                    <Tooltip title="Delete Flow">
                      <button
                        onClick={() => handleDeleteFlow(flow.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
};

export default FlowListingTableView;
