'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { checkServerHealth } from '@/redux/slices/knowledgeGraphSlice';
import { Spinner } from './ui';

export default function HealthBadge() {
  const dispatch = useDispatch();
  const serverHealth = useSelector((s) => s.knowledgeGraph.serverHealth);

  useEffect(() => { dispatch(checkServerHealth()); }, [dispatch]);

  return (
    <div className={`flex items-center gap-2.5 border rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
      serverHealth === 'unhealthy' ? 'bg-red-50 border-red-200 text-red-600'
      : serverHealth === 'healthy' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : 'bg-gray-50 border-gray-200 text-gray-500'
    }`}>
      {serverHealth === 'checking'
        ? <Spinner size={10} />
        : <span className={`w-2 h-2 rounded-full ${serverHealth === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />}
      <span className="hidden sm:inline">
        {serverHealth === 'healthy' ? 'Neo4j Online' : serverHealth === 'unhealthy' ? 'Neo4j Offline' : 'Checking…'}
      </span>
      <span className="sm:hidden">
        {serverHealth === 'healthy' ? 'Online' : serverHealth === 'unhealthy' ? 'Offline' : '…'}
      </span>
    </div>
  );
}
