import React, { useMemo, useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import {
  Workflow,
  ArrowUpRight,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
} from 'lucide-react';
import { timeAgo } from '@/utils/commonFunction';

/**
 * Enterprise flow data grid.
 *
 * Design intent (deliberately different from the previous card-ish table):
 * - Structural, not decorative. A single neutral surface, hairline column
 *   dividers and a sticky header, so it reads as a data grid instead of a
 *   list of styled rows.
 * - Colour carries meaning only. Slate is the entire palette; indigo appears
 *   solely on the focused/hovered primary action and the sort indicator.
 * - Scannable identity column: monospaced short id under the name, so rows
 *   stay distinguishable when names are similar.
 * - Row actions stay hidden until hover/focus to keep the grid quiet, but are
 *   always present for keyboard users (focus-within reveals them).
 *
 * The props contract is unchanged, so the page needs no modification.
 */

const flowName = (flow) => flow?.name || flow?.agent_name || 'Unnamed Flow';
const flowDesc = (flow) => flow?.description || flow?.agent_description || '';
const flowId = (flow) => flow?.id || flow?.agent_id || '';

/** Short, stable identifier shown under the flow name. */
const shortId = (flow) => {
  const id = String(flowId(flow));
  if (!id) return '—';
  return id.length > 10 ? `${id.slice(0, 8)}…${id.slice(-2)}` : id;
};

const COLUMNS = [
  { key: 'name', label: 'Flow', sortable: true, width: '34%' },
  { key: 'description', label: 'Description', sortable: false, width: '34%' },
  { key: 'updatedAt', label: 'Last updated', sortable: true, width: '18%' },
  { key: 'actions', label: '', sortable: false, width: '14%', align: 'right' },
];

const SortIcon = ({ state }) => {
  if (state === 'asc') return <ArrowUp size={12} className="text-indigo-600" />;
  if (state === 'desc') return <ArrowDown size={12} className="text-indigo-600" />;
  return (
    <ChevronsUpDown
      size={12}
      className="text-slate-300 group-hover/th:text-slate-400 transition-colors"
    />
  );
};

const FlowListingTableView = ({ filteredFlows = [], handleOpenStudio, handleDeleteFlow }) => {
  // `null` = keep the order the page already applied (updatedAt desc).
  const [sort, setSort] = useState(null);

  const toggleSort = (key) => {
    setSort((current) => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null; // third click restores the page's default ordering
    });
  };

  const rows = useMemo(() => {
    if (!sort) return filteredFlows;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...filteredFlows].sort((a, b) => {
      if (sort.key === 'name') {
        return flowName(a).localeCompare(flowName(b), undefined, { sensitivity: 'base' }) * factor;
      }
      const left = new Date(a?.updatedAt || 0).getTime();
      const right = new Date(b?.updatedAt || 0).getTime();
      return (left - right) * factor;
    });
  }, [filteredFlows, sort]);

  return (
    <Box className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[720px]">
          <colgroup>
            {COLUMNS.map((col) => (
              <col key={col.key} style={{ width: col.width }} />
            ))}
          </colgroup>

          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {COLUMNS.map((col) => {
                const state = sort?.key === col.key ? sort.direction : null;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      !col.sortable ? undefined : state === 'asc' ? 'ascending' : state === 'desc' ? 'descending' : 'none'
                    }
                    className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${
                      col.align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="group/th inline-flex items-center gap-1.5 rounded-sm uppercase tracking-wider hover:text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/40 transition-colors"
                      >
                        {col.label}
                        <SortIcon state={state} />
                      </button>
                    ) : (
                      <span className={col.align === 'right' ? 'sr-only' : undefined}>
                        {col.label || 'Actions'}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((flow) => {
              const description = flowDesc(flow);
              const id = flowId(flow);

              return (
                <tr
                  key={id}
                  className="group/row hover:bg-slate-50/70 focus-within:bg-slate-50/70 transition-colors"
                >
                  {/* Identity */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-8 w-8 shrink-0 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 group-hover/row:border-slate-300 transition-colors">
                        <Workflow size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold text-slate-800 truncate">
                          {flowName(flow)}
                        </span>
                        <span className="block text-[10.5px] font-mono text-slate-400 truncate">
                          {shortId(flow)}
                        </span>
                      </span>
                    </div>
                  </td>

                  {/* Description — truncated inline, full text on hover */}
                  <td className="px-4 py-3 align-middle">
                    {description ? (
                      <Tooltip
                        title={<span className="text-[12px] leading-relaxed">{description}</span>}
                        placement="top-start"
                        arrow
                        slotProps={{
                          popper: {
                            sx: {
                              '& .MuiTooltip-tooltip': {
                                backgroundColor: '#0f172a',
                                borderRadius: '8px',
                                padding: '8px 10px',
                                maxWidth: 320,
                              },
                              '& .MuiTooltip-arrow': { color: '#0f172a' },
                            },
                          },
                        }}
                      >
                        <span className="block text-[12.5px] text-slate-600 truncate cursor-default">
                          {description}
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="text-[12.5px] text-slate-300">—</span>
                    )}
                  </td>

                  {/* Recency */}
                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    <span className="text-[12px] text-slate-500">{timeAgo(flow?.updatedAt)}</span>
                  </td>

                  {/* Actions — quiet until the row is hovered or focused */}
                  <td className="px-4 py-3 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenStudio(id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-md transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                      >
                        Open <ArrowUpRight size={13} />
                      </button>
                      <Tooltip title="Delete flow">
                        <button
                          type="button"
                          aria-label={`Delete ${flowName(flow)}`}
                          onClick={() => handleDeleteFlow(flow)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500/40"
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
      </div>
    </Box>
  );
};

export default FlowListingTableView;
