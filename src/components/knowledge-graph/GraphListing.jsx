'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Share2, RefreshCcw, AlertCircle, Trash2 } from 'lucide-react';
import { fetchGraphs, deleteGraph } from '@/redux/slices/knowledgeGraphSlice';
import { asArray, renderCell } from './helpers';
import { Button, Spinner } from './ui';

export default function GraphListing({ refreshTrigger }) {
  const dispatch = useDispatch();
  const { graphs, graphsLoading, graphsError } = useSelector((s) => s.knowledgeGraph);

  useEffect(() => { dispatch(fetchGraphs()); }, [dispatch, refreshTrigger]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this graph dataset? This cannot be undone.')) return;
    dispatch(deleteGraph(id));
  };

  const graphList = asArray(graphs);

  // Fixed column widths keep the numeric columns aligned across rows instead of
  // reflowing with graph-name length.
  const COLUMNS = [
    { key: 'name', label: 'Graph name', width: '32%', align: 'left' },
    { key: 'format', label: 'Format', width: '12%', align: 'left' },
    { key: 'nodes', label: 'Entities', width: '14%', align: 'right' },
    { key: 'rels', label: 'Relationships', width: '16%', align: 'right' },
    { key: 'ingested', label: 'Ingested', width: '18%', align: 'left' },
    { key: 'actions', label: '', width: '8%', align: 'right' },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Ingested graphs</p>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {graphsLoading ? 'Loading graphs…' : `${graphList.length} knowledge graph dataset${graphList.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchGraphs())}
          disabled={graphsLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors disabled:opacity-50 outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/30"
        >
          <RefreshCcw size={12} className={graphsLoading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {graphsError && (
        <div className="px-3.5 py-2.5 mb-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2.5">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <p className="text-[12.5px] text-red-700">{graphsError}</p>
        </div>
      )}

      {graphsLoading && (
        <div className="flex justify-center py-12 bg-white rounded-lg border border-slate-200">
          <Spinner size={24} className="text-indigo-600" />
        </div>
      )}

      {!graphsLoading && !graphsError && graphList.length === 0 && (
        <div className="flex flex-col items-center py-14 px-6 bg-white rounded-lg border border-dashed border-slate-300 text-center">
          <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-center mb-3">
            <Share2 size={18} className="text-slate-400" />
          </div>
          <p className="text-[13px] font-semibold text-slate-800">No graph datasets ingested yet</p>
          <p className="text-[12px] text-slate-500 mt-1 max-w-sm">Upload a CSV, XLSX or SQL file above to build your first knowledge graph.</p>
        </div>
      )}

      {!graphsLoading && !graphsError && graphList.length > 0 && (
        <div className="w-full bg-white rounded-lg overflow-hidden border border-slate-200">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[760px]">
              <colgroup>
                {COLUMNS.map((c) => (
                  <col key={c.key} style={{ width: c.width }} />
                ))}
              </colgroup>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className={`px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                        c.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {c.label || <span className="sr-only">Actions</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {graphList.map((g, i) => (
                  <tr key={g.id || i} className="group/row hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                          <Share2 size={13} />
                        </div>
                        <span className="text-[13px] font-semibold text-slate-800 truncate">
                          {renderCell(g?.graph_name) || 'Untitled graph'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {String(g?.file_type || "CSV").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-[12.5px] font-mono tabular-nums text-slate-700">
                      {Number(g?.node_count || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-[12.5px] font-mono tabular-nums text-slate-700">
                      {Number(g?.rel_count || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[12.5px] text-slate-500">
                      {g?.created_at
                        ? new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1.5 text-slate-400 rounded-md transition-colors hover:text-red-600 hover:bg-red-50 outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/30 opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100"
                        title="Delete graph dataset"
                        aria-label={`Delete ${renderCell(g?.graph_name) || 'graph'}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
