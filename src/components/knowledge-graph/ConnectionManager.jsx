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
        className="flex items-center justify-between bg-white border border-gray-200/80 rounded-xl px-4 sm:px-5 py-3.5 cursor-pointer select-none shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <Server size={15} className="text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 font-medium leading-tight">Target Connection</p>
            <p className="font-semibold text-gray-700 text-sm truncate">
              {activeConn ? (activeConn.label || activeConn.uri || 'Custom Connection') : 'Default Server'}
            </p>
          </div>
          {activeConn && (
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100 hidden sm:inline">CUSTOM</span>
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
            <Plus size={16} className="text-gray-400" />
          </IconBtn>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      <Collapsible open={expanded}>
        <div className="mt-1.5 bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
          <div
            className={`flex items-center justify-between px-4 sm:px-5 py-3.5 cursor-pointer hover:bg-gray-50/80 transition-colors ${!selectedConnectionId ? 'bg-blue-50/50' : ''}`}
            onClick={() => { dispatch(setSelectedConnection(null)); setExpanded(false); }}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${!selectedConnectionId ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <div>
                <p className={`font-semibold text-sm ${!selectedConnectionId ? 'text-blue-700' : 'text-gray-700'}`}>Default Server</p>
                <p className="text-[11px] text-gray-400">Environment-configured Neo4j</p>
              </div>
            </div>
            {!selectedConnectionId && <Check size={15} className="text-blue-500" />}
          </div>

          {connections.map((conn) => {
            const isSelected = selectedConnectionId === conn.connection_id;
            const health = healthStatus[conn.connection_id];
            const loading = loadingIds[conn.connection_id];
            return (
              <div
                key={conn.connection_id}
                className={`flex items-center justify-between px-4 sm:px-5 py-3.5 cursor-pointer hover:bg-gray-50/80 transition-colors border-t border-gray-100 ${isSelected ? 'bg-blue-50/50' : ''}`}
                onClick={() => { dispatch(setSelectedConnection(conn.connection_id)); setExpanded(false); }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    health === 'healthy' ? 'bg-emerald-500' :
                    health === 'unhealthy' ? 'bg-red-500' :
                    isSelected ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                      {conn.label || conn.uri || conn.connection_id}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono truncate">{conn.uri} · {conn.database || 'neo4j'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  <IconBtn title="Check health" onClick={() => handleCheckHealth(conn.connection_id)}>
                    {loading ? <Spinner size={12} className="text-gray-400" /> : <Activity size={14} className="text-gray-400" />}
                  </IconBtn>
                  <IconBtn title="Disconnect" onClick={() => dispatch(removeConnection(conn.connection_id))}>
                    <Unlink size={14} className="text-gray-400 hover:text-red-500" />
                  </IconBtn>
                  {isSelected && <Check size={15} className="text-blue-500 ml-1" />}
                </div>
              </div>
            );
          })}

          {connections.length === 0 && (
            <div className="px-5 py-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-300">No custom connections — using default server</p>
            </div>
          )}
        </div>
      </Collapsible>

      <AddConnectionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
