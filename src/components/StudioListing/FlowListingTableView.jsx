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
// `id` is still needed as a React key and for the open/delete handlers, but it
// is deliberately never rendered: an opaque UUID is operator plumbing, not
// information a user can act on. The description occupies that line instead.
const flowId = (flow) => flow?.id || flow?.agent_id || '';
const flowVersion = (flow) => {
  const v = flow?.version;
  if (v === null || v === undefined || v === '') return '';
  const str = String(v).trim();
  return str.startsWith('v') ? str : `v${str}`;
};

/**
 * Compare two version values segment by segment so 1.10.0 sorts after 1.9.0.
 * Non-numeric or missing versions sort last, ascending.
 */
const compareVersions = (a, b) => {
  const parse = (v) => {
    const raw = String(v ?? '').trim().replace(/^v/i, '');
    if (!raw) return [];
    return raw.split('.').map((n) => Number(n));
  };
  const left = parse(a);
  const right = parse(b);
  const missing = (p) => p.length === 0 || Number.isNaN(p[0]);
  if (missing(left) && missing(right)) return 0;
  if (missing(left)) return 1;
  if (missing(right)) return -1;
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const l = Number.isNaN(left[i]) ? 0 : (left[i] ?? 0);
    const r = Number.isNaN(right[i]) ? 0 : (right[i] ?? 0);
    if (l !== r) return l - r;
  }
  return 0;
};

const COLUMNS = [
  { key: 'name', label: 'Flow', sortable: true, width: '46%' },
  { key: 'version', label: 'Version', sortable: true, width: '14%' },
  { key: 'updatedAt', label: 'Last updated', sortable: true, width: '22%' },
  { key: 'actions', label: '', sortable: false, width: '18%', align: 'right' },
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
      if (sort.key === 'version') {
        // Semver-aware: plain string compare puts "1.10.0" before "1.9.0".
        return compareVersions(a?.version, b?.version) * factor;
      }
      const left = new Date(a?.updatedAt || 0).getTime();
      const right = new Date(b?.updatedAt || 0).getTime();
      return (left - right) * factor;
    });
  }, [filteredFlows, sort]);

  return (
    <Box className="w-full bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
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
                        {description ? (
                          <Tooltip
                            title={<span className="text-[12px] leading-relaxed">{description}</span>}
                            placement="bottom-start"
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
                            <span className="block text-[11.5px] text-slate-500 truncate cursor-default">
                              {description}
                            </span>
                          </Tooltip>
                        ) : (
                          <span className="block text-[11.5px] text-slate-400 italic">
                            No description
                          </span>
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Version — a neutral mono chip; tabular figures keep the
                      column optically aligned as numbers grow. */}
                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    {flowVersion(flow) ? (
                      <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-mono tabular-nums text-slate-600">
                        {flowVersion(flow)}
                      </span>
                    ) : (
                      <span className="text-[12.5px] text-slate-300">—</span>
                    )}
                  </td>

                  {/* Recency */}
                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    <span className="text-[12px] text-slate-500">{timeAgo(flow?.updatedAt)}</span>
                  </td>

                  {/* Actions — always visible: discoverability beats tidiness,
                      and hover-only controls are unreachable on touch devices. */}
                  <td className="px-4 py-3 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1">
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
