'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { checkServerHealth } from '@/redux/slices/knowledgeGraphSlice';
import { Spinner } from './ui';

export default function HealthBadge() {
  const dispatch = useDispatch();
  const serverHealth = useSelector((s) => s.knowledgeGraph.serverHealth);

  useEffect(() => { dispatch(checkServerHealth()); }, [dispatch]);

  const state =
    serverHealth === 'healthy' ? 'healthy' : serverHealth === 'unhealthy' ? 'unhealthy' : 'checking';

  // Status is one of the few places colour genuinely encodes meaning, so it
  // stays — but as a small dot on a neutral chip rather than a fully tinted
  // panel competing with the page header.
  const dot = {
    healthy: 'bg-emerald-500',
    unhealthy: 'bg-red-500',
    checking: 'bg-slate-300',
  }[state];

  const text = {
    healthy: 'text-slate-700',
    unhealthy: 'text-red-700',
    checking: 'text-slate-500',
  }[state];

  const label = {
    healthy: 'Neo4j online',
    unhealthy: 'Neo4j offline',
    checking: 'Checking\u2026',
  }[state];

  return (
    <div
      role="status"
      className={`inline-flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 text-[12px] font-medium ${
        state === 'unhealthy' ? 'border-red-200' : 'border-slate-200'
      } ${text}`}
    >
      {state === 'checking' ? (
        <Spinner size={11} className="text-slate-400" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      )}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">
        {state === 'healthy' ? 'Online' : state === 'unhealthy' ? 'Offline' : '\u2026'}
      </span>
    </div>
  );
}
