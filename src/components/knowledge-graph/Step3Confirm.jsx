'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft, Database, CheckCircle2, AlertCircle, Server, Check } from 'lucide-react';
import { BASE, authHdr, readErr } from './helpers';
import { Button, Spinner, ProgressBar, InfoRow } from './ui';

const LOG_CLS = { ok: 'text-emerald-400', err: 'text-red-400', info: 'text-blue-300' };

export default function Step3Confirm({ session, onBack, onSessionExpired, onReset, onIngestComplete }) {
  const { selectedConnectionId, connections } = useSelector((s) => s.knowledgeGraph);
  const [graphName, setGraphName] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [log, setLog] = useState([]);
  const [complete, setComplete] = useState(null);
  const [fatalErr, setFatalErr] = useState(null);
  const logRef = useRef(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const appendLog = useCallback((text, variant = 'info') =>
    setLog((prev) => [...prev, { text, variant }]), []);

  const handleIngest = async () => {
    const name = graphName.trim();
    if (!name) return setNameErr('Graph name is required');
    if (name.length > 200) return setNameErr('Maximum 200 characters');
    setNameErr(''); setIngesting(true); setLog([]); setFatalErr(null); setComplete(null);

    try {
      let url = `${BASE}/upload/${session.uploadId}/commit?graph_name=${encodeURIComponent(name)}`;
      if (selectedConnectionId) url += `&connection_id=${encodeURIComponent(selectedConnectionId)}`;

      const res = await fetch(url, { method: 'POST', headers: authHdr() });
      if (res.status === 404) { onSessionExpired(); return; }
      if (!res.ok) {
        const body = await readErr(res);
        setFatalErr(body.error || `Commit failed (${res.status})`);
        setIngesting(false); return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const evt = JSON.parse(line);
            switch (evt.stage || evt.event) {
              case 'started':
                appendLog('Starting ingest…', 'info'); break;
              case 'using_connection':
                appendLog(`Using: ${evt.uri} (db: ${evt.database || 'neo4j'})`, 'info'); break;
              case 'transform_complete':
                appendLog(`Transformed: ${(evt.total_nodes ?? evt.node_count ?? 0).toLocaleString()} nodes, ${(evt.total_relationships ?? evt.relationship_count ?? 0).toLocaleString()} rels`, 'info'); break;
              case 'load_nodes':
                appendLog(`✓ ${evt.label}: ${(evt.created ?? 0).toLocaleString()} created, ${(evt.updated ?? 0).toLocaleString()} updated${evt.failed ? `, ${evt.failed} failed` : ''}`, 'ok'); break;
              case 'load_nodes_error':
                appendLog(`✕ ${evt.label}: ${evt.error}`, 'err'); break;
              case 'load_relationships':
                appendLog(`✓ Relationships: ${(evt.created ?? 0).toLocaleString()} created${evt.failed ? `, ${evt.failed} failed` : ''}`, 'ok'); break;
              case 'load_relationships_error':
                appendLog(`✕ Relationships: ${evt.error}`, 'err'); break;
              case 'complete':
                setComplete(evt); setIngesting(false);
                if (evt.status !== 'FAILED') onIngestComplete?.();
                break;
              case 'error':
                setFatalErr(evt.message || 'Stream error'); setIngesting(false); return;
              default: break;
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch {
      setFatalErr('Network error — could not reach the server.');
      setIngesting(false);
    }
  };

  if (complete && (complete.status === 'SUCCESS' || complete.status === 'PARTIAL')) {
    const totalNodes = complete.total_nodes != null ? Number(complete.total_nodes).toLocaleString() : '—';
    const totalRels = complete.total_relationships != null ? Number(complete.total_relationships).toLocaleString() : '—';
    return (
      <div className="flex flex-col items-center text-center py-8 sm:py-12">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-5 ${complete.status === 'SUCCESS' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
          <CheckCircle2 size={38} className={complete.status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-500'} />
        </div>
        <h2 className="font-bold text-gray-800 text-xl sm:text-2xl mb-1.5">
          {complete.status === 'SUCCESS' ? 'Graph Ingested' : 'Partially Ingested'}
        </h2>
        {complete.status === 'PARTIAL' && complete.message && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl max-w-sm">
            <p className="text-amber-700 text-sm">⚠ {complete.message}</p>
          </div>
        )}
        <p className="text-sm text-gray-400 mb-6 max-w-sm">&ldquo;{graphName}&rdquo; has been written to Neo4j.</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
          {[
            { label: 'Nodes Created', value: totalNodes, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Relationships', value: totalRels, color: '#16a34a', bg: '#f0fdf4' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 text-center shadow-sm border border-gray-100" style={{ backgroundColor: s.bg }}>
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="w-full max-w-xl bg-gray-950 rounded-xl p-4 text-left mb-6 max-h-36 overflow-y-auto">
          {log.map((l, i) => (
            <p key={i} className={`font-mono text-[11px] leading-5 ${LOG_CLS[l.variant] || 'text-gray-500'}`}>{l.text}</p>
          ))}
        </div>
        <Button variant="outline" onClick={onReset}>Ingest Another File</Button>
      </div>
    );
  }

  const activeConn = connections?.find((c) => c.connection_id === selectedConnectionId);
  const connLabel = activeConn ? (activeConn.label || activeConn.uri || 'Custom Connection') : 'Default Server';

  return (
    <div>
      <h2 className="font-bold text-gray-800 text-lg sm:text-xl mb-1">Confirm &amp; Ingest</h2>
      <p className="text-sm text-gray-400 mb-6">Name your graph and start the ingest. Progress streams in real time.</p>

      <div className="mb-5 p-3.5 bg-slate-50 border border-gray-200/80 rounded-xl flex items-center gap-3">
        <Server size={15} className="text-gray-400 shrink-0" />
        <div className="flex-1">
          <p className="text-[11px] text-gray-400 font-medium leading-tight">Target Connection</p>
          <p className="font-semibold text-gray-700 text-sm">{connLabel}</p>
        </div>
        {activeConn && (
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">CUSTOM</span>
        )}
      </div>

      <div className="mb-6">
        <label className="font-semibold text-gray-600 text-sm mb-2 block">
          Graph Name <span className="text-red-500">*</span>
        </label>
        <div
          className={`flex items-center border rounded-xl overflow-hidden transition-all duration-200 ${
            nameErr ? 'border-red-300 ring-2 ring-red-100'
              : graphName.trim() ? 'border-blue-500 ring-2 ring-blue-100'
              : 'border-gray-200'
          }`}
        >
          <div className="px-3.5 py-2.5 bg-gray-50 border-r border-gray-100">
            <Database size={16} className="text-gray-400" />
          </div>
          <input
            value={graphName}
            onChange={(e) => { setGraphName(e.target.value); if (nameErr) setNameErr(''); }}
            placeholder="e.g. Customer Orders 2024"
            disabled={ingesting}
            className="flex-1 px-3.5 py-2.5 text-sm outline-none bg-white font-medium"
          />
          {graphName.trim() && !nameErr && !ingesting && <Check size={15} className="text-emerald-500 mr-3" />}
        </div>
        {nameErr
          ? <p className="text-red-500 mt-1.5 text-[11px]">{nameErr}</p>
          : <p className="text-gray-300 mt-1.5 text-[11px]">{graphName.length}/200</p>}
      </div>

      {(ingesting || log.length > 0) && (
        <div className="mb-6">
          {ingesting && (
            <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-t-xl border-b-0">
              <div className="flex items-center gap-2.5 mb-3">
                <Spinner size={14} className="text-blue-600" />
                <p className="font-semibold text-blue-700 text-sm">Writing to Neo4j…</p>
              </div>
              <ProgressBar />
            </div>
          )}
          <div
            ref={logRef}
            className={`bg-gray-950 px-5 py-5 max-h-52 overflow-y-auto ${ingesting ? 'rounded-b-xl' : 'rounded-xl'}`}
          >
            {log.map((l, i) => (
              <p key={i} className={`font-mono text-[11px] leading-5 ${LOG_CLS[l.variant] || 'text-gray-500'}`}>{l.text}</p>
            ))}
            {ingesting && <p className="font-mono text-[11px] text-gray-600 animate-pulse">▋</p>}
          </div>
        </div>
      )}

      {(fatalErr || complete?.status === 'FAILED') && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 mb-0.5 text-sm">Ingest Failed</p>
            <p className="text-sm text-red-600">{complete?.message || fatalErr}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-100 pt-5 gap-3">
        <Button variant="outline" leftIcon={<ArrowLeft size={15} />} onClick={onBack} disabled={ingesting}>Back</Button>
        <Button
          onClick={handleIngest}
          disabled={!graphName.trim() || ingesting}
          loading={ingesting}
          leftIcon={!ingesting && <Database size={15} />}
        >
          {ingesting ? 'Ingesting…' : 'Ingest to Neo4j'}
        </Button>
      </div>
    </div>
  );
}
