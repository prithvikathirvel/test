'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Share2, RefreshCcw, AlertCircle, Trash2, Calendar, Database } from 'lucide-react';
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

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Ingested Graphs</h3>
          <p className="text-xs text-slate-400">
            {graphsLoading ? 'Loading graphs…' : `${graphList.length} knowledge graph dataset${graphList.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchGraphs())}
          disabled={graphsLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={12} className={graphsLoading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {graphsError && (
        <div className="p-3.5 mb-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-600 font-medium">{graphsError}</p>
        </div>
      )}

      {graphsLoading && (
        <div className="flex justify-center py-12 bg-white rounded-xl border border-slate-200/80">
          <Spinner size={24} className="text-indigo-600" />
        </div>
      )}

      {!graphsLoading && !graphsError && graphList.length === 0 && (
        <div className="flex flex-col items-center py-16 px-6 bg-white rounded-xl border border-slate-200/80 text-center">
          <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-3">
            <Share2 size={18} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-700 text-sm">No graph datasets ingested yet</p>
          <p className="text-xs text-slate-400 mt-1">Upload a CSV, XLSX, or SQL file above to build your first knowledge graph.</p>
        </div>
      )}

      {!graphsLoading && !graphsError && graphList.length > 0 && (
        <div className="w-full bg-white rounded-xl shadow-2xs overflow-hidden border border-slate-200/80">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Graph Name
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Entities (Nodes)
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Relationships
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Ingested
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {graphList.map((g, i) => (
                  <tr key={g.id || i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                          <Share2 size={13} />
                        </div>
                        <span className="text-[13px] font-semibold text-slate-800">
                          {renderCell(g?.graph_name) || "Untitled Graph"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {String(g?.file_type || "CSV").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-mono font-medium text-slate-700">
                      {Number(g?.node_count || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs font-mono font-medium text-slate-700">
                      {Number(g?.rel_count || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-400">
                      {g?.created_at
                        ? new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Graph Dataset"
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
