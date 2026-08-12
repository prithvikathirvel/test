'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Server, Plus, ChevronDown, ChevronUp, Check, Activity, Unlink } from 'lucide-react';
import {
  fetchConnections, checkConnectionHealth, removeConnection, setSelectedConnection,
} from '@/redux/slices/knowledgeGraphSlice';
import { Button, IconBtn, Spinner, Collapsible } from './ui';
import AddConnectionDialog from './AddConnectionDialog';

export default function ConnectionManager() {
  const dispatch = useDispatch();
  const { connections, selectedConnectionId, healthStatus } = useSelector((s) => s.knowledgeGraph);
  const [loadingIds, setLoadingIds] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { dispatch(fetchConnections()); }, [dispatch]);

  const handleCheckHealth = async (id) => {
    setLoadingIds((p) => ({ ...p, [id]: true }));
    await dispatch(checkConnectionHealth(id));
    setLoadingIds((p) => ({ ...p, [id]: false }));
  };

  const activeConn = connections.find((c) => c.connection_id === selectedConnectionId);

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 cursor-pointer select-none hover:border-slate-300 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <Server size={15} className="text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 leading-tight">Target connection</p>
            <p className="text-[13px] font-semibold text-slate-800 truncate">
              {activeConn ? (activeConn.label || activeConn.uri || 'Custom Connection') : 'Default Server'}
            </p>
          </div>
          {activeConn && (
            <span className="text-[10px] font-semibold font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300 hidden sm:inline">CUSTOM</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline" size="sm"
            onClick={(e) => { e.stopPropagation(); setDialogOpen(true); }}
            leftIcon={<Plus size={13} />}
            className="hidden sm:inline-flex"
          >
            Add
          </Button>
          <IconBtn title="Add connection" onClick={(e) => { e.stopPropagation(); setDialogOpen(true); }} className="sm:hidden">
            <Plus size={16} className="text-slate-400" />
          </IconBtn>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      <Collapsible open={expanded}>
        <div className="mt-1.5 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div
            className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-l-2 ${!selectedConnectionId ? 'border-l-indigo-600 bg-slate-50/70' : 'border-l-transparent'}`}
            onClick={() => { dispatch(setSelectedConnection(null)); setExpanded(false); }}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${!selectedConnectionId ? 'bg-indigo-600' : 'bg-slate-300'}`} />
              <div>
                <p className="text-[13px] font-semibold text-slate-800">Default server</p>
                <p className="text-[11.5px] text-slate-500">Environment-configured Neo4j</p>
              </div>
            </div>
            {!selectedConnectionId && <Check size={15} className="text-indigo-600 shrink-0" />}
          </div>

          {connections.map((conn) => {
            const isSelected = selectedConnectionId === conn.connection_id;
            const health = healthStatus[conn.connection_id];
            const loading = loadingIds[conn.connection_id];
            return (
              <div
                key={conn.connection_id}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-t border-slate-100 border-l-2 ${isSelected ? 'border-l-indigo-600 bg-slate-50/70' : 'border-l-transparent'}`}
                onClick={() => { dispatch(setSelectedConnection(conn.connection_id)); setExpanded(false); }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    health === 'healthy' ? 'bg-emerald-500' :
                    health === 'unhealthy' ? 'bg-red-500' :
                    isSelected ? 'bg-indigo-600' : 'bg-slate-300'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">
                      {conn.label || conn.uri || conn.connection_id}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{conn.uri} · {conn.database || 'neo4j'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  <IconBtn title="Check health" onClick={() => handleCheckHealth(conn.connection_id)}>
                    {loading ? <Spinner size={12} className="text-slate-400" /> : <Activity size={14} className="text-slate-400" />}
                  </IconBtn>
                  <IconBtn title="Disconnect" onClick={() => dispatch(removeConnection(conn.connection_id))}>
                    <Unlink size={14} className="text-slate-400 hover:text-red-500" />
                  </IconBtn>
                  {isSelected && <Check size={15} className="text-indigo-500 ml-1" />}
                </div>
              </div>
            );
          })}

          {connections.length === 0 && (
            <div className="px-5 py-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-300">No custom connections — using default server</p>
            </div>
          )}
        </div>
      </Collapsible>

      <AddConnectionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
