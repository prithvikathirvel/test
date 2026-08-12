import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { Workflow, ArrowUpRight, Trash2, Info } from 'lucide-react';
import { timeAgo } from '@/utils/commonFunction';

const getFirst5Words = (text) => {
  if (!text) return "No description available";
  const words = text.trim().split(/\s+/);
  if (words.length <= 5) return text;
  return words.slice(0, 5).join(' ') + '...';
};

const FlowListingTableView = ({ filteredFlows, handleOpenStudio, handleDeleteFlow }) => {
  return (
    <Box className="w-full bg-white rounded-xl shadow-2xs overflow-hidden border border-slate-200/80">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80">
            <th className="w-[32%] px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Flow Name
            </th>
            <th className="w-[30%] px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Description
            </th>
            <th className="w-[20%] px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Last Updated
            </th>
            <th className="w-[14%] px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {filteredFlows.map((flow) => {
            const fullDesc = flow?.description || flow?.agent_description || "No description available";
            const shortDesc = getFirst5Words(fullDesc);

            return (
              <tr key={flow.id || flow.agent_id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 align-middle">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Workflow size={14} />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-800 truncate block">
                      {flow.name || flow.agent_name || "Unnamed Flow"}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-3.5 align-middle">
                  <Tooltip
                    title={
                      <div className="p-1 space-y-1 max-w-xs">
                        <div className="text-[10.5px] font-semibold text-slate-300 uppercase tracking-wider">
                          Full Description
                        </div>
                        <div className="text-[12px] text-white leading-relaxed">
                          {fullDesc}
                        </div>
                      </div>
                    }
                    placement="top-start"
                    arrow
                    slotProps={{
                      popper: {
                        sx: {
                          '& .MuiTooltip-tooltip': {
                            backgroundColor: '#0f172a',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            border: '1px solid #334155',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                          },
                          '& .MuiTooltip-arrow': {
                            color: '#0f172a',
                          },
                        },
                      },
                    }}
                  >
                    <span className="text-[12.5px] text-slate-600 hover:text-slate-900 cursor-pointer inline-flex items-center gap-1 group">
                      <span className="font-medium underline decoration-slate-300 underline-offset-2 group-hover:decoration-indigo-500">
                        {shortDesc}
                      </span>
                    </span>
                  </Tooltip>
                </td>

                <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                  <span className="text-[12px] text-slate-400">{timeAgo(flow?.updatedAt)}</span>
                </td>

                <td className="px-5 py-3.5 align-middle text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenStudio(flow.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                    >
                      Open Studio <ArrowUpRight size={13} />
                    </button>
                    <Tooltip title="Delete Flow">
                      <button
                        onClick={() => handleDeleteFlow(flow)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Box>
  );
};

export default FlowListingTableView;
