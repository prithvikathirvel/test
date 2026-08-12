'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft, Database, CheckCircle2, AlertCircle, Server, Check } from 'lucide-react';
import { BASE, authHdr, readErr } from './helpers';
import { Button, Spinner, ProgressBar, InfoRow } from './ui';

const LOG_CLS = { ok: 'text-emerald-400', err: 'text-red-400', info: 'text-slate-300' };

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
      <div className="py-2">
        {/* Result summary reads as a report header + figures table, not a
            celebration screen: the numbers are what the operator came for. */}
        <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
          <div className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 ${
            complete.status === 'SUCCESS' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
          }`}>
            <CheckCircle2 size={18} className={complete.status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-600'} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-slate-800">
              {complete.status === 'SUCCESS' ? 'Graph ingested' : 'Partially ingested'}
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-0.5 break-words">
              &ldquo;{graphName}&rdquo; has been written to Neo4j.
            </p>
          </div>
        </div>

        {complete.status === 'PARTIAL' && complete.message && (
          <div className="mt-4 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 text-[12.5px]">{complete.message}</p>
          </div>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-3">
          {[
            { label: 'Nodes created', value: totalNodes },
            { label: 'Relationships', value: totalRels },
          ].map((s) => (
            <div key={s.label} className="rounded-md border border-slate-200 bg-white px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</dt>
              <dd className="text-[20px] font-semibold text-slate-800 font-mono tabular-nums mt-1">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 rounded-md border border-slate-200 overflow-hidden">
          <p className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Ingest log
          </p>
          <div className="bg-slate-900 px-4 py-3 max-h-40 overflow-y-auto">
            {log.map((l, i) => (
              <p key={i} className={`font-mono text-[11px] leading-5 ${LOG_CLS[l.variant] || 'text-slate-400'}`}>{l.text}</p>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="outline" onClick={onReset}>Ingest another file</Button>
        </div>
      </div>
    );
  }

  const activeConn = connections?.find((c) => c.connection_id === selectedConnectionId);
  const connLabel = activeConn ? (activeConn.label || activeConn.uri || 'Custom Connection') : 'Default Server';

  return (
    <div>
      <div className="mb-5">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Step 3</p>
        <h2 className="text-[17px] font-semibold text-slate-800 mt-0.5">Confirm and ingest</h2>
        <p className="text-[13px] text-slate-500 mt-1">Name your graph and start the ingest. Progress streams in real time.</p>
      </div>

      <div className="mb-4 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-3">
        <Server size={15} className="text-slate-400 shrink-0" />
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 leading-tight">Target connection</p>
          <p className="text-[13px] font-semibold text-slate-800 truncate">{connLabel}</p>
        </div>
        {activeConn && (
          <span className="text-[10px] font-semibold font-mono bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-300">CUSTOM</span>
        )}
      </div>

      <div className="mb-6">
        <label className="text-[12px] font-semibold text-slate-700 mb-1.5 block">
          Graph Name <span className="text-red-500">*</span>
        </label>
        <div
          className={`flex items-center border rounded-md overflow-hidden transition-colors ${
            nameErr ? 'border-red-300 ring-2 ring-red-100'
              : graphName.trim() ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-slate-300'
          }`}
        >
          <div className="px-3 py-2.5 bg-slate-50 border-r border-slate-200">
            <Database size={16} className="text-slate-400" />
          </div>
          <input
            value={graphName}
            onChange={(e) => { setGraphName(e.target.value); if (nameErr) setNameErr(''); }}
            placeholder="e.g. Customer Orders 2024"
            disabled={ingesting}
            className="flex-1 px-3.5 py-2.5 text-sm outline-hidden bg-white font-medium"
          />
          {graphName.trim() && !nameErr && !ingesting && <Check size={15} className="text-emerald-500 mr-3" />}
        </div>
        {nameErr
          ? <p className="text-red-500 mt-1.5 text-[11px]">{nameErr}</p>
          : <p className="text-slate-400 mt-1.5 text-[11px] font-mono tabular-nums">{graphName.length}/200</p>}
      </div>

      {(ingesting || log.length > 0) && (
        <div className="mb-6">
          {ingesting && (
            <div className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-t-md border-b-0">
              <div className="flex items-center gap-2.5 mb-3">
                <Spinner size={13} className="text-indigo-600" />
                <p className="text-[13px] font-semibold text-slate-800">Writing to Neo4j\u2026</p>
              </div>
              <ProgressBar />
            </div>
          )}
          <div
            ref={logRef}
            className={`bg-slate-900 px-4 py-3.5 max-h-52 overflow-y-auto border border-slate-200 ${ingesting ? 'rounded-b-md border-t-0' : 'rounded-md'}`}
          >
            {log.map((l, i) => (
              <p key={i} className={`font-mono text-[11px] leading-5 ${LOG_CLS[l.variant] || 'text-slate-500'}`}>{l.text}</p>
            ))}
            {ingesting && <p className="font-mono text-[11px] text-slate-500 animate-pulse">\u258b</p>}
          </div>
        </div>
      )}

      {(fatalErr || complete?.status === 'FAILED') && (
        <div className="mb-4 px-3.5 py-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 mb-0.5 text-sm">Ingest Failed</p>
            <p className="text-sm text-red-600">{complete?.message || fatalErr}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-slate-200 pt-4 gap-3">
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
