'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Share2, Calendar, RefreshCcw, AlertCircle, Trash2 } from 'lucide-react';
import { fetchGraphs, deleteGraph } from '@/redux/slices/knowledgeGraphSlice';
import { asArray, renderCell } from './helpers';
import { Button, IconBtn, Spinner } from './ui';

export default function GraphListing({ refreshTrigger }) {
  const dispatch = useDispatch();
  const { graphs, graphsLoading, graphsError } = useSelector((s) => s.knowledgeGraph);

  useEffect(() => { dispatch(fetchGraphs()); }, [dispatch, refreshTrigger]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this graph dataset from Neo4j? This cannot be undone.')) return;
    dispatch(deleteGraph(id));
  };

  const ftColors = {
    csv: 'bg-sky-50 text-sky-600 border-sky-100',
    xlsx: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    xls: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    sql: 'bg-violet-50 text-violet-600 border-violet-100',
    zip: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const statusEl = {
    Indexed: <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Indexed</span>,
    Processing: <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Processing</span>,
    Failed: <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Failed</span>,
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-700 text-lg">Ingested Graphs</h3>
          <p className="text-sm text-gray-400">
            {graphsLoading ? 'Loading…' : `${asArray(graphs).length} dataset${asArray(graphs).length !== 1 ? 's' : ''} in Neo4j`}
          </p>
        </div>
        <Button
          variant="outline" size="sm"
          onClick={() => dispatch(fetchGraphs())}
          disabled={graphsLoading}
          loading={graphsLoading}
          leftIcon={!graphsLoading && <RefreshCcw size={13} />}
        >
          Refresh
        </Button>
      </div>

      {graphsError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{graphsError}</p>
        </div>
      )}

      {graphsLoading && (
        <div className="flex justify-center py-16">
          <Spinner size={28} className="text-blue-600" />
        </div>
      )}

      {!graphsLoading && !graphsError && asArray(graphs).length === 0 && (
        <div className="flex flex-col items-center p-12 sm:p-16 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Share2 size={28} className="text-gray-200" />
          </div>
          <p className="font-semibold text-gray-400 text-base">No graph datasets yet</p>
          <p className="text-sm text-gray-300 mt-1.5">Ingest your first dataset using the wizard above.</p>
        </div>
      )}

      {!graphsLoading && !graphsError && asArray(graphs).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="hidden lg:grid grid-cols-12 text-[10px] font-bold text-gray-400 bg-gray-50/80 px-5 py-3.5 border-b border-gray-100 uppercase tracking-widest">
            <div className="col-span-4">Graph Name</div>
            <div className="col-span-1">Format</div>
            <div className="col-span-2 text-right">Nodes</div>
            <div className="col-span-2 text-right">Rels</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-1" />
          </div>
          {asArray(graphs).map((g, i) => (
            <div
              key={g.id}
              className={`grid grid-cols-1 lg:grid-cols-12 items-center px-5 py-4 hover:bg-gray-50/60 transition-colors ${i > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="lg:col-span-4 flex items-center gap-3 min-w-0 mb-2 lg:mb-0">
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <Share2 size={15} className="text-indigo-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-700 truncate text-sm">{renderCell(g?.graph_name)}</p>
                  <div className="mt-0.5">{statusEl[g.status] ?? null}</div>
                </div>
              </div>
              <div className="lg:col-span-1 mb-2 lg:mb-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${ftColors[g.file_type] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {renderCell(g?.file_type)}
                </span>
              </div>
              <div className="lg:col-span-2 lg:text-right mb-1 lg:mb-0">
                <p className="font-bold text-indigo-600 text-sm">{Number(g?.node_count || 0).toLocaleString()}</p>
              </div>
              <div className="lg:col-span-2 lg:text-right mb-1 lg:mb-0">
                <p className="font-bold text-emerald-600 text-sm">{Number(g?.rel_count || 0).toLocaleString()}</p>
              </div>
              <div className="lg:col-span-2 mb-2 lg:mb-0">
                {/* <div className="flex items-center gap-1.5"> */}
                  <Calendar size={12} className="text-gray-300" />
                  <span className="text-[11px] text-gray-400">
                    {g?.created_at
                      ? new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '--'}
                  </span>
                {/* </div> */}
              </div>
              <div className="lg:col-span-1 flex lg:justify-end">
                <IconBtn title="Delete" onClick={() => handleDelete(g.id)}>
                  <Trash2 size={14} className="text-gray-300 hover:text-red-500" />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
