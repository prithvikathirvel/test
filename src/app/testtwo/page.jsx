'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Typography, IconButton, Tooltip, Collapse,
  LinearProgress, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody,
  Select, MenuItem, FormControl, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  CloudUpload, FileText, Database, Share2, CheckCircle2,
  ArrowRight, ArrowLeft, Trash2, Eye, EyeOff,
  Network, Layers, Check, X, GitBranch,
  Calendar, RefreshCcw, Info, AlertCircle, Plus,
  Server, Unlink, Key, ChevronDown, ChevronUp,
  Wifi, WifiOff, ArrowRightCircle, Table2, Zap,
  Activity,
} from 'lucide-react';
import DashedBox from '@/components/Common/DashedBox';
import CustomButton from '@/components/Common/CustomButton';

// ─── Config & Helpers ─────────────────────────────────────────────────────────

const BASE = (process.env.NEXT_PUBLIC_CMDB_API_URL || 'http://1.6.37.35/cmdb').replace(/\/$/, '');
const LABEL_RE    = /^[A-Za-z][A-Za-z0-9_]*$/;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const ALLOWED_EXT = ['.csv', '.xlsx', '.xls', '.sql', '.zip'];
const NODE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#b45309', '#0d9488'];

const getToken  = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
const authHdr   = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };
const readErr   = async (res) => { try { return await res.json(); } catch { return { error: `HTTP ${res.status}` }; } };

/** Safely render any cell value — prevents [object Object] */
const renderCell = (v) => {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

const enrichEntities = (entities) =>
  (entities || []).map((e, i) => ({ ...e, _color: NODE_COLORS[i % NODE_COLORS.length] }));

const asArray  = (value) => (Array.isArray(value) ? value : []);
const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

const normalizeColumn = (col) => {
  if (typeof col === 'string')
    return { source_column: col, target_property: col, is_identity: false, skip: false };
  if (typeof col === 'object' && col !== null)
    return {
      source_column:   String(col.source_column || col.column || col.name || ''),
      target_property: String(col.target_property || col.target || col.source_column || col.name || ''),
      is_identity:     Boolean(col.is_identity || col.is_primary),
      skip:            Boolean(col.skip || col.exclude),
    };
  return { source_column: String(col), target_property: String(col), is_identity: false, skip: false };
};

const normalizeEntity = (entity) => {
  const e = asObject(entity);
  const rawCols = asArray(e.columns || e.source_columns || e.properties);
  const columns  = rawCols.map(normalizeColumn).filter((c) => c.source_column);
  const properties = columns.length > 0 ? columns.map((c) => c.source_column) : [];
  const idCol = String(e.id_column || e.primary_key || properties[0] || 'id');
  return {
    source_table:      String(e.source_table || e.table_name || e.table || e.from_table || ''),
    node_label:        String(e.node_label || e.label || e.entity || 'Entity'),
    id_column:         idCol,
    is_junction_table: Boolean(e.is_junction_table),
    properties,
    columns,
  };
};

const normalizeRelationship = (r) => {
  const rel = asObject(r);
  return {
    rel_type:    String(rel.rel_type || rel.type || 'RELATED_TO'),
    from_table:  String(rel.from_table || rel.source_table || rel.from || ''),
    to_table:    String(rel.to_table || rel.target_table || rel.to || ''),
    from_column: String(rel.from_column || rel.left_key || ''),
    to_column:   String(rel.to_column || rel.right_key || ''),
  };
};

const normalizeProposal = (rawProposal) => {
  const p = asObject(rawProposal);
  return {
    entities:      asArray(p.entities || p.entity_mappings || p.node_mappings || p.nodes).map(normalizeEntity),
    relationships: asArray(p.relationships || p.relationship_mappings || p.edges).map(normalizeRelationship),
  };
};

const normalizeSampleData = (rawSampleData) => {
  const src = asObject(rawSampleData);
  const out = {};
  Object.keys(src).forEach((key) => { out[key] = asArray(src[key]); });
  return out;
};

const normalizeGraphs = (raw) => {
  const payload = asObject(raw);
  const graphs  = asArray(payload.graphs || payload.data?.graphs || payload.items || payload.data);
  return graphs.map((item) => asObject(item)).map((g, idx) => ({
    id:                 String(g.id || g.graph_id || g.name || `graph-${idx}`),
    graph_name:         String(g.graph_name || g.name || g.dataset_name || 'Untitled Graph'),
    status:             String(g.status || 'Indexed'),
    file_type:          String(g.file_type || g.type || 'csv').toLowerCase(),
    node_count:         Number.isFinite(Number(g.node_count)) ? Number(g.node_count) : 0,
    relationship_count: Number.isFinite(Number(g.relationship_count)) ? Number(g.relationship_count) : 0,
    created_at:         g.created_at || g.createdAt || new Date().toISOString(),
  }));
};

// ─── Shared UI Primitives ──────────────────────────────────────────────────────

function SectionBadge({ count, color = 'indigo' }) {
  const cls = {
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    green:  'bg-green-50  text-green-600  ring-green-100',
    amber:  'bg-amber-50  text-amber-600  ring-amber-100',
    gray:   'bg-gray-50   text-gray-500   ring-gray-100',
  }[color] || 'bg-gray-50 text-gray-500 ring-gray-100';
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full ring-1 ${cls}`}>
      {count}
    </span>
  );
}

function ErrorBox({ messages }) {
  if (!messages?.length) return null;
  return (
    <Box className="p-3.5 bg-red-50 border border-red-200 rounded-xl mb-4">
      <Box className="flex items-center gap-2 mb-1.5">
        <AlertCircle size={14} className="text-red-500 shrink-0" />
        <Typography variant="body2" className="!font-semibold !text-red-700 !text-sm">
          {messages.length > 1 ? `${messages.length} Errors` : 'Error'}
        </Typography>
      </Box>
      {messages.map((m, i) => (
        <Typography key={i} variant="caption" className="!text-red-600 block !leading-5">· {m}</Typography>
      ))}
    </Box>
  );
}

function WarnBox({ messages, onDismiss }) {
  if (!messages?.length) return null;
  return (
    <Box className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-4">
      <Box className="flex items-center justify-between mb-1.5">
        <Box className="flex items-center gap-2">
          <Info size={14} className="text-amber-500 shrink-0" />
          <Typography variant="body2" className="!font-semibold !text-amber-700 !text-sm">
            {messages.length > 1 ? `${messages.length} Warnings` : 'Warning'}
          </Typography>
        </Box>
        {onDismiss && (
          <IconButton size="small" onClick={onDismiss} sx={{ p: 0.3 }}>
            <X size={13} className="text-amber-500" />
          </IconButton>
        )}
      </Box>
      {messages.map((m, i) => (
        <Typography key={i} variant="caption" className="!text-amber-600 block !leading-5">· {m}</Typography>
      ))}
    </Box>
  );
}

// ─── Step 0: Connection Manager ────────────────────────────────────────────────

function AddConnectionDialog({ open, onClose, onConnected }) {
  const [form, setForm] = useState({ uri: '', username: 'neo4j', password: '', database: 'neo4j', label: '' });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState(null);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErr(null); };

  const handleConnect = async () => {
    if (!form.uri.trim())      { setErr('URI is required');      return; }
    if (!form.username.trim()) { setErr('Username is required'); return; }
    if (!form.password)        { setErr('Password is required'); return; }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`${BASE}/neo4j/connect`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHdr() },
        body:    JSON.stringify({
          uri:      form.uri.trim(),
          username: form.username.trim(),
          password: form.password,
          database: form.database.trim() || 'neo4j',
          label:    form.label.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const b = await readErr(res);
        setErr(b.error || `Connection failed (${res.status})`);
        return;
      }
      const data = await res.json();
      onConnected(data.connection);
      setForm({ uri: '', username: 'neo4j', password: '', database: 'neo4j', label: '' });
      onClose();
    } catch {
      setErr('Network error — could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box className="flex items-center gap-2.5">
          <Box className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Server size={16} className="text-white" />
          </Box>
          <Box>
            <Typography variant="subtitle1" className="!font-bold !text-gray-800">Add Neo4j Connection</Typography>
            <Typography variant="caption" className="!text-gray-400">Connect to a custom Neo4j instance</Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Box className="flex flex-col gap-4">
          <Box>
            <Typography variant="caption" className="!font-semibold !text-gray-600 !mb-1.5 block">
              URI <span className="text-red-500">*</span>
            </Typography>
            <input
              value={form.uri}
              onChange={(e) => set('uri', e.target.value)}
              placeholder="bolt://my-neo4j-host:7687"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 font-mono"
            />
          </Box>
          <Box className="grid grid-cols-2 gap-3">
            <Box>
              <Typography variant="caption" className="!font-semibold !text-gray-600 !mb-1.5 block">
                Username <span className="text-red-500">*</span>
              </Typography>
              <input
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                placeholder="neo4j"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </Box>
            <Box>
              <Typography variant="caption" className="!font-semibold !text-gray-600 !mb-1.5 block">
                Password <span className="text-red-500">*</span>
              </Typography>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </Box>
          </Box>
          <Box className="grid grid-cols-2 gap-3">
            <Box>
              <Typography variant="caption" className="!font-semibold !text-gray-600 !mb-1.5 block">Database</Typography>
              <input
                value={form.database}
                onChange={(e) => set('database', e.target.value)}
                placeholder="neo4j"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </Box>
            <Box>
              <Typography variant="caption" className="!font-semibold !text-gray-600 !mb-1.5 block">Label (optional)</Typography>
              <input
                value={form.label}
                onChange={(e) => set('label', e.target.value)}
                placeholder="e.g. Production DB"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </Box>
          </Box>
          {err && (
            <Box className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={13} className="text-red-500 shrink-0" />
              <Typography variant="caption" className="!text-red-600">{err}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <CustomButton variant="outlined" onClick={onClose} disabled={busy} className="!text-gray-500 !border-gray-200">
          Cancel
        </CustomButton>
        <CustomButton
          variant="contained"
          onClick={handleConnect}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={13} color="inherit" /> : <Zap size={14} />}
        >
          {busy ? 'Connecting…' : 'Connect'}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}

function ConnectionManager({ selectedId, onSelect, onConnectionsChange }) {
  const [connections,  setConnections]  = useState([]);
  const [loadingIds,   setLoadingIds]   = useState({});
  const [healthStatus, setHealthStatus] = useState({});
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [expanded,     setExpanded]     = useState(false);

  const loadConnections = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/neo4j/connections`, { headers: authHdr() });
      if (res.ok) {
        const d = await res.json();
        const list = asArray(d.connections || d);
        setConnections(list);
        onConnectionsChange?.(list);
      }
    } catch {}
  }, [onConnectionsChange]);

  useEffect(() => { loadConnections(); }, [loadConnections]);

  const checkHealth = async (id) => {
    setLoadingIds((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`${BASE}/neo4j/connections/${id}/health`, { headers: authHdr() });
      setHealthStatus((p) => ({ ...p, [id]: res.ok ? 'healthy' : 'unhealthy' }));
    } catch {
      setHealthStatus((p) => ({ ...p, [id]: 'unhealthy' }));
    } finally {
      setLoadingIds((p) => ({ ...p, [id]: false }));
    }
  };

  const disconnect = async (id) => {
    try {
      const res = await fetch(`${BASE}/neo4j/connections/${id}`, { method: 'DELETE', headers: authHdr() });
      if (res.ok) {
        const next = connections.filter((c) => c.connection_id !== id);
        setConnections(next);
        onConnectionsChange?.(next);
        if (selectedId === id) onSelect(null);
      }
    } catch {}
  };

  const handleConnected = (conn) => {
    const next = [...connections, conn];
    setConnections(next);
    onConnectionsChange?.(next);
    onSelect(conn.connection_id);
  };

  const activeConn = connections.find((c) => c.connection_id === selectedId);

  return (
    <Box className="mb-5">
      <Box
        className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 cursor-pointer select-none shadow-sm hover:border-gray-200 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <Box className="flex items-center gap-3">
          <Box className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
            <Server size={14} className="text-gray-400" />
          </Box>
          <Box>
            <Typography variant="caption" className="!text-gray-400 !font-medium block !leading-4">Target Connection</Typography>
            <Typography variant="body2" className="!font-semibold !text-gray-700 !leading-5">
              {activeConn ? (activeConn.label || activeConn.uri || 'Custom Connection') : 'Default Server'}
            </Typography>
          </Box>
          {activeConn && (
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">CUSTOM</span>
          )}
        </Box>
        <Box className="flex items-center gap-2">
          <CustomButton
            variant="outlined"
            onClick={(e) => { e.stopPropagation(); setDialogOpen(true); }}
            startIcon={<Plus size={13} />}
            className="!text-xs !border-gray-200 !text-gray-500 !py-1"
          >
            Add
          </CustomButton>
          {expanded ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box className="mt-1 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <Box
            className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!selectedId ? 'bg-blue-50' : ''}`}
            onClick={() => { onSelect(null); setExpanded(false); }}
          >
            <Box className="flex items-center gap-3">
              <Box className={`w-2 h-2 rounded-full ${!selectedId ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <Box>
                <Typography variant="body2" className={`!font-semibold !text-sm ${!selectedId ? '!text-blue-700' : '!text-gray-700'}`}>
                  Default Server
                </Typography>
                <Typography variant="caption" className="!text-gray-400">Environment-configured Neo4j</Typography>
              </Box>
            </Box>
            {!selectedId && <Check size={14} className="text-blue-500" />}
          </Box>

          {connections.map((conn) => {
            const isSelected = selectedId === conn.connection_id;
            const health = healthStatus[conn.connection_id];
            const loading = loadingIds[conn.connection_id];
            return (
              <Box
                key={conn.connection_id}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-t border-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => { onSelect(conn.connection_id); setExpanded(false); }}
              >
                <Box className="flex items-center gap-3 min-w-0">
                  <Box className={`w-2 h-2 rounded-full shrink-0 ${
                    health === 'healthy' ? 'bg-green-500' :
                    health === 'unhealthy' ? 'bg-red-500' :
                    isSelected ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                  <Box className="min-w-0">
                    <Typography variant="body2" className={`!font-semibold !text-sm truncate ${isSelected ? '!text-blue-700' : '!text-gray-700'}`}>
                      {conn.label || conn.uri || conn.connection_id}
                    </Typography>
                    <Typography variant="caption" className="!text-gray-400 font-mono truncate block">
                      {conn.uri} · {conn.database || 'neo4j'}
                    </Typography>
                  </Box>
                </Box>
                <Box className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Check health">
                    <IconButton size="small" onClick={() => checkHealth(conn.connection_id)} sx={{ p: 0.5 }}>
                      {loading ? <CircularProgress size={12} /> : <Activity size={13} className="text-gray-400" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Disconnect">
                    <IconButton size="small" onClick={() => disconnect(conn.connection_id)} sx={{ p: 0.5 }}>
                      <Unlink size={13} className="text-gray-400" />
                    </IconButton>
                  </Tooltip>
                  {isSelected && <Check size={14} className="text-blue-500 ml-1" />}
                </Box>
              </Box>
            );
          })}

          {connections.length === 0 && (
            <Box className="px-4 py-3.5 border-t border-gray-50 text-center">
              <Typography variant="caption" className="!text-gray-300">No custom connections — using default server</Typography>
            </Box>
          )}
        </Box>
      </Collapse>

      <AddConnectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConnected={handleConnected}
      />
    </Box>
  );
}

// ─── Step Indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Upload',  icon: CloudUpload },
  { id: 2, label: 'Schema',  icon: Layers      },
  { id: 3, label: 'Ingest',  icon: Database    },
];

function StepIndicator({ current }) {
  return (
    <Box className="flex items-center justify-center mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done   = current > step.id;
        const active = current === step.id;
        return (
          <Box key={step.id} className="flex items-center">
            <Box className="flex flex-col items-center gap-1.5">
              <Box
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  done   ? 'bg-blue-600 border-blue-600'
                  : active ? 'border-blue-600 bg-white'
                           : 'border-gray-200 bg-white'
                }`}
              >
                {done
                  ? <Check size={16} className="text-white" />
                  : <Icon size={15} className={active ? 'text-blue-600' : 'text-gray-300'} />
                }
              </Box>
              <Typography
                variant="caption"
                className={`!font-semibold !text-[11px] !leading-none ${done || active ? '!text-blue-600' : '!text-gray-300'}`}
              >
                {step.label}
              </Typography>
            </Box>
            {i < STEPS.length - 1 && (
              <Box
                className="w-20 h-0.5 mb-4 mx-2 rounded-full transition-colors"
                style={{ backgroundColor: current > step.id ? '#2563eb' : '#e5e7eb' }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Server Health Badge ───────────────────────────────────────────────────────

function HealthBadge() {
  const [status, setStatus] = useState('checking');
  useEffect(() => {
    fetch(`${BASE}/health`, { headers: authHdr() })
      .then((r) => r.json())
      .then((d) => setStatus(d.status === 'healthy' ? 'healthy' : 'unhealthy'))
      .catch(() => setStatus('unhealthy'));
  }, []);
  return (
    <Box className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm ${
      status === 'unhealthy' ? 'bg-red-50 border-red-200 text-red-600'
      : status === 'healthy'  ? 'bg-green-50 border-green-200 text-green-700'
                               : 'bg-gray-50 border-gray-200 text-gray-500'
    }`}>
      {status === 'checking'
        ? <CircularProgress size={9} sx={{ color: 'currentColor' }} />
        : <Box className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      }
      <span className="font-semibold">
        {status === 'healthy' ? 'Neo4j Online' : status === 'unhealthy' ? 'Neo4j Offline' : 'Checking…'}
      </span>
    </Box>
  );
}

// ─── Step 1: Upload ────────────────────────────────────────────────────────────

function Step1Upload({ onSuccess, sessionExpiredMsg }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file,       setFile]       = useState(null);
  const [clientErr,  setClientErr]  = useState(null);
  const [serverErr,  setServerErr]  = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const inputRef = useRef(null);

  const validate = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return `Unsupported format. Allowed: ${ALLOWED_EXT.join(', ')}`;
    if (f.size > MAX_FILE_BYTES)    return `File is ${(f.size / 1024 / 1024).toFixed(1)} MB — exceeds 100 MB`;
    return null;
  };

  const setCheckedFile = (f) => {
    const err = validate(f);
    setClientErr(err);
    setServerErr(null);
    if (!err) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setServerErr(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${BASE}/upload`, { method: 'POST', headers: authHdr(), body: form });
      if (!res.ok) {
        const body = await readErr(res);
        setServerErr(
          res.status === 422 ? body.error || 'File has wrong format or no data'
          : res.status === 413 ? 'File exceeds the 100 MB server limit'
          : body.error || `Upload failed (${res.status})`
        );
        return;
      }
      const data = await res.json();
      sessionStorage.setItem('cmdb_upload_id', data.upload_id);
      onSuccess(data);
    } catch {
      setServerErr('Network error — could not reach the server.');
    } finally {
      setUploading(false);
    }
  };

  const formats = [
    { label: 'XLSX', note: 'Multi-sheet Excel' },
    { label: 'XLS',  note: 'Legacy Excel'      },
    { label: 'CSV',  note: 'Comma/semicolon'   },
    { label: 'ZIP',  note: 'Multiple files'    },
    { label: 'SQL',  note: 'DDL / INSERT'      },
  ];

  return (
    <Box>
      <Typography variant="h6" className="!font-bold !text-gray-800 !mb-1">Upload Data File</Typography>
      <Typography variant="body2" className="!text-gray-400 !mb-6">
        Upload a structured data file. We will auto-detect nodes, properties and relationships for you to review.
      </Typography>

      {sessionExpiredMsg && (
        <Box className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <Info size={13} className="text-amber-500 shrink-0" />
          <Typography variant="body2" className="!text-amber-700 !text-sm">
            Session expired — please re-upload your file.
          </Typography>
        </Box>
      )}

      <DashedBox
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) setCheckedFile(e.dataTransfer.files[0]); }}
        className={`transition-all rounded-2xl border-2 border-dashed cursor-pointer ${
          isDragging ? '!border-blue-400 !bg-blue-50' : '!border-gray-200 hover:!border-gray-300'
        }`}
        onClick={() => !file && inputRef.current?.click()}
      >
        <Box className="flex flex-col items-center py-14 gap-4">
          <Box className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDragging ? 'bg-blue-100' : 'bg-gray-50'}`}>
            <CloudUpload size={32} className={isDragging ? 'text-blue-500' : 'text-gray-300'} />
          </Box>

          {!file ? (
            <>
              <Box className="text-center">
                <Typography variant="body1" className="!font-semibold !text-gray-600 !mb-1">
                  {isDragging ? 'Release to upload' : 'Drag & drop your file here'}
                </Typography>
                <Typography variant="body2" className="!text-gray-400">
                  or <span className="text-blue-600 font-semibold cursor-pointer hover:underline">browse files</span>
                </Typography>
              </Box>
              <Box className="flex flex-wrap gap-2 justify-center">
                {formats.map((f) => (
                  <Tooltip key={f.label} title={f.note} placement="top">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full cursor-default">
                      {f.label}
                    </span>
                  </Tooltip>
                ))}
              </Box>
              <Typography variant="caption" className="!text-gray-300">Max 100 MB</Typography>
            </>
          ) : (
            <Box className="flex items-center gap-4 bg-white border border-green-200 rounded-xl px-5 py-3.5 shadow-sm min-w-80">
              <Box className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-green-500" />
              </Box>
              <Box className="flex-1 min-w-0">
                <Typography variant="body2" className="!font-bold !text-gray-700 truncate">{file.name}</Typography>
                <Typography variant="caption" className="!text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · ready to upload
                </Typography>
              </Box>
              <Box className="flex items-center gap-1">
                <CheckCircle2 size={16} className="text-green-500" />
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setClientErr(null); setServerErr(null); }}
                  sx={{ p: 0.5 }}
                >
                  <X size={14} className="text-gray-400" />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      </DashedBox>

      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".csv,.xlsx,.xls,.sql,.zip"
        onChange={(e) => { if (e.target.files?.[0]) setCheckedFile(e.target.files[0]); e.target.value = ''; }}
      />

      {(clientErr || serverErr) && (
        <Box className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle size={13} className="text-red-500 shrink-0" />
          <Typography variant="caption" className="!text-red-600">{clientErr || serverErr}</Typography>
        </Box>
      )}

      {uploading && (
        <Box className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <Box className="flex items-center gap-3 mb-2.5">
            <CircularProgress size={14} sx={{ color: '#2563eb' }} />
            <Typography variant="body2" className="!font-semibold !text-blue-700">Analysing file structure…</Typography>
          </Box>
          <LinearProgress sx={{ borderRadius: 4, bgcolor: '#bfdbfe', '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' } }} />
          <Typography variant="caption" className="!text-blue-500 !mt-2 block">
            Detecting tables, columns and relationships
          </Typography>
        </Box>
      )}

      <Box className="flex justify-between items-center mt-6">
        <Typography variant="caption" className="!text-gray-300">
          {file ? 'Click Upload & Analyse to continue' : 'Select a file to begin'}
        </Typography>
        <CustomButton
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading || !!clientErr}
          startIcon={uploading ? <CircularProgress size={13} color="inherit" /> : <Network size={15} />}
        >
          {uploading ? 'Uploading…' : 'Upload & Analyse'}
        </CustomButton>
      </Box>
    </Box>
  );
}

// ─── Node Card ─────────────────────────────────────────────────────────────────

function NodeCard({ entity, sampleData, onChange, onDelete }) {
  const [sampleOpen,  setSampleOpen]  = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const nodeLabel   = String(entity?.node_label || '');
  const sourceTable = String(entity?.source_table || '');
  const idColumn    = String(entity?.id_column || '');
  const columns     = asArray(entity?.columns);
  const color       = entity?._color || '#2563eb';
  const valid       = LABEL_RE.test(nodeLabel);
  const rows        = asArray(sampleData?.[sourceTable]);
  const visibleCols = columns.filter((c) => !c.skip);

  const updateColumn = (i, patch) => {
    const next = columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c));
    onChange({ ...entity, columns: next });
  };

  return (
    <Box className={`rounded-xl border overflow-hidden transition-colors bg-white shadow-sm ${valid ? 'border-gray-100' : 'border-red-200'}`}>
      {/* Header */}
      <Box className="flex items-center gap-3 px-4 py-3.5" style={{ borderLeft: `3px solid ${color}` }}>
        <Box
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0"
          style={{ backgroundColor: color }}
        >
          N
        </Box>
        <Box className="flex-1 min-w-0">
          <input
            value={nodeLabel}
            onChange={(e) => onChange({ ...entity, node_label: e.target.value })}
            className={`w-full text-sm font-bold bg-transparent border-b pb-0.5 outline-none transition-colors ${
              valid ? 'border-transparent text-gray-800 focus:border-blue-400' : 'border-red-300 text-red-600'
            }`}
            placeholder="NodeLabel"
          />
          <Typography variant="caption" className={`!leading-4 block ${!valid ? '!text-red-400 !text-[10px]' : '!text-gray-400'}`}>
            {!valid
              ? 'Must start with a letter; letters, digits, underscores only'
              : <><span className="font-mono">{sourceTable || '--'}</span> · id <span className="font-mono">{idColumn}</span> · {columns.length} cols</>
            }
          </Typography>
        </Box>
        <Box className="flex items-center gap-0.5 shrink-0">
          {columns.length > 0 && (
            <Tooltip title="Column mapping">
              <IconButton size="small" onClick={() => setColumnsOpen((v) => !v)} sx={{ p: 0.6 }}>
                <Table2 size={15} className={columnsOpen ? 'text-blue-500' : 'text-gray-400'} />
              </IconButton>
            </Tooltip>
          )}
          {rows.length > 0 && (
            <Tooltip title={sampleOpen ? 'Hide sample data' : 'View sample data'}>
              <IconButton size="small" onClick={() => setSampleOpen((v) => !v)} sx={{ p: 0.6 }}>
                {sampleOpen ? <EyeOff size={15} className="text-blue-500" /> : <Eye size={15} className="text-gray-400" />}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Remove node">
            <IconButton size="small" onClick={onDelete} sx={{ p: 0.6 }}>
              <Trash2 size={15} className="text-gray-300 hover:text-red-500" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Properties strip */}
      <Box className="px-4 py-2.5 bg-gray-50 border-t border-gray-50 flex flex-wrap gap-1.5">
        {visibleCols.slice(0, 8).map((col) => (
          <span
            key={col.source_column}
            className={`text-[11px] px-2 py-0.5 rounded font-mono border ${
              col.source_column === idColumn
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            {col.source_column === idColumn ? '🔑 ' : ''}{col.target_property || col.source_column}
          </span>
        ))}
        {visibleCols.length > 8 && (
          <span className="text-[11px] px-2 py-0.5 rounded bg-white text-gray-400 border border-gray-200 font-mono">
            +{visibleCols.length - 8} more
          </span>
        )}
        {entity?.is_junction_table && (
          <span className="text-[11px] px-2 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-200 font-mono">junction</span>
        )}
      </Box>

      {/* Column mapping editor */}
      <Collapse in={columnsOpen && columns.length > 0}>
        <Box className="border-t border-gray-100">
          <Box className="grid grid-cols-12 text-[10px] font-semibold text-gray-400 bg-gray-50 px-4 py-2 uppercase tracking-wide">
            <Box className="col-span-4">Source Column</Box>
            <Box className="col-span-5">Target Property</Box>
            <Box className="col-span-2 text-center">ID Key</Box>
            <Box className="col-span-1 text-center">Skip</Box>
          </Box>
          {columns.map((col, i) => (
            <Box
              key={i}
              className={`grid grid-cols-12 items-center px-4 py-2 gap-2 border-t border-gray-50 ${col.skip ? 'opacity-40' : ''}`}
            >
              <Box className="col-span-4">
                <Typography variant="caption" className="font-mono !text-gray-500 !text-[11px]">{col.source_column}</Typography>
              </Box>
              <Box className="col-span-5">
                <input
                  value={col.target_property}
                  onChange={(e) => updateColumn(i, { target_property: e.target.value })}
                  disabled={col.skip}
                  className="w-full text-[11px] font-mono border border-gray-200 rounded px-2 py-1 outline-none focus:border-blue-400 bg-white disabled:bg-gray-50"
                />
              </Box>
              <Box className="col-span-2 flex justify-center">
                <Switch
                  size="small"
                  checked={!!col.is_identity}
                  onChange={(e) => updateColumn(i, { is_identity: e.target.checked })}
                  disabled={col.skip}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#d97706' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#fde68a' } }}
                />
              </Box>
              <Box className="col-span-1 flex justify-center">
                <Switch
                  size="small"
                  checked={!!col.skip}
                  onChange={(e) => updateColumn(i, { skip: e.target.checked })}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#6b7280' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#d1d5db' } }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>

      {/* Sample data */}
      <Collapse in={sampleOpen && rows.length > 0}>
        <Box className="border-t border-gray-100 overflow-x-auto" style={{ maxHeight: 260, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {visibleCols.map((col) => (
                  <TableCell
                    key={col.source_column}
                    className="!text-[10px] !font-bold !text-gray-500 !py-2 !px-3 !bg-gray-50 whitespace-nowrap"
                    style={{ minWidth: 80 }}
                  >
                    {col.target_property || col.source_column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(0, 20).map((row, ri) => (
                <TableRow key={ri} hover>
                  {visibleCols.map((col) => (
                    <TableCell
                      key={col.source_column}
                      className="!text-[11px] !text-gray-600 !py-1.5 !px-3 whitespace-nowrap"
                      style={{ maxWidth: 180 }}
                    >
                      <span className="block truncate">{renderCell(row?.[col.source_column])}</span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="caption" className="!text-gray-300 px-4 py-2 block bg-gray-50 border-t border-gray-50">
            Showing {Math.min(rows.length, 20)} of {rows.length} sample rows
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Relationship Card ─────────────────────────────────────────────────────────

function RelationshipCard({ rel, idx, sourceTables, entities, entityColors, relErrors, onUpdate, onDelete }) {
  const rErr      = relErrors[idx];
  const fromColor = entityColors[rel.from_table] || '#9ca3af';
  const toColor   = entityColors[rel.to_table]   || '#9ca3af';
  const isSelfRel = Boolean(rel.from_table && rel.to_table && rel.from_table === rel.to_table);

  // source_table → node_label map; auto-reflects label renames
  const labelMap = Object.fromEntries(
    asArray(entities).map((e) => [String(e.source_table), String(e.node_label || e.source_table)])
  );

  return (
    <Box className={`bg-white border rounded-xl overflow-hidden shadow-sm ${
      rErr ? 'border-red-200' : isSelfRel ? 'border-amber-200' : 'border-gray-100'
    }`}>
      {/* Visual relationship row */}
      <Box className="flex items-center gap-2 px-4 py-3.5">
        {/* From node pill */}
        <Box
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: fromColor, maxWidth: 160 }}
        >
          <span className="w-4 h-4 bg-white/25 rounded text-[9px] flex items-center justify-center shrink-0">N</span>
          <FormControl variant="standard" sx={{ minWidth: 70, maxWidth: 120 }}>
            <Select
              value={rel.from_table}
              onChange={(e) => onUpdate({ ...rel, from_table: e.target.value })}
              disableUnderline
              sx={{
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
                '& .MuiSelect-select': { p: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)', fontSize: 18 },
              }}
            >
              {sourceTables.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: 12 }}>{labelMap[t] || t}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {/* Arrow + rel type */}
        <Box className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <Box className="flex items-center w-full gap-0">
            <Box className="flex-1 border-t border-dashed border-gray-300" />
            <Tooltip title={isSelfRel ? 'Self-relationship — FROM and TO are the same node' : ''} disableHoverListener={!isSelfRel}>
              <span>
                <ArrowRightCircle
                  size={18}
                  className={`mx-1 ${
                    rErr ? 'text-red-400' : isSelfRel ? 'text-amber-400' : 'text-gray-400'
                  }`}
                />
              </span>
            </Tooltip>
            <Box className="flex-1 border-t border-dashed border-gray-300" />
          </Box>
          <input
            value={rel.rel_type}
            onChange={(e) => onUpdate({ ...rel, rel_type: String(e.target.value).toUpperCase() })}
            className={`text-[11px] font-bold font-mono w-full text-center border px-2 py-1 rounded-lg outline-none transition-colors ${
              rErr
                ? 'border-red-300 text-red-600 bg-red-50'
                : 'border-gray-200 text-gray-600 bg-gray-50 focus:border-blue-400 focus:bg-white'
            }`}
            placeholder="REL_TYPE"
          />
          {isSelfRel && !rErr && (
            <Typography variant="caption" className="!text-[10px] !text-amber-500 !leading-none">⚠ Self-relationship</Typography>
          )}
          {rErr && (
            <Typography variant="caption" className="!text-[10px] !text-red-500 !leading-none">{rErr}</Typography>
          )}
        </Box>

        {/* To node pill */}
        <Box
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: toColor, maxWidth: 160 }}
        >
          <span className="w-4 h-4 bg-white/25 rounded text-[9px] flex items-center justify-center shrink-0">N</span>
          <FormControl variant="standard" sx={{ minWidth: 70, maxWidth: 120 }}>
            <Select
              value={rel.to_table}
              onChange={(e) => onUpdate({ ...rel, to_table: e.target.value })}
              disableUnderline
              sx={{
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
                '& .MuiSelect-select': { p: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)', fontSize: 18 },
              }}
            >
              {sourceTables.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: 12 }}>{labelMap[t] || t}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Tooltip title="Remove relationship">
          <IconButton size="small" onClick={onDelete} sx={{ p: 0.6, ml: 0.5 }}>
            <Trash2 size={14} className="text-gray-300 hover:text-red-500" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Join keys row */}
      <Box className="px-4 py-2 bg-gray-50 border-t border-gray-50 flex items-center gap-2 flex-wrap">
        <Typography variant="caption" className="!text-gray-400 !text-[10px] !font-semibold shrink-0">Join Keys:</Typography>
        <Box className="flex items-center gap-1.5">
          <input
            value={rel.from_column}
            onChange={(e) => onUpdate({ ...rel, from_column: e.target.value })}
            placeholder="from_col"
            className="text-[11px] font-mono border border-gray-200 rounded px-2 py-0.5 outline-none w-28 focus:border-blue-400 bg-white"
          />
          <ArrowRight size={11} className="text-gray-300 shrink-0" />
          <input
            value={rel.to_column}
            onChange={(e) => onUpdate({ ...rel, to_column: e.target.value })}
            placeholder="to_col"
            className="text-[11px] font-mono border border-gray-200 rounded px-2 py-0.5 outline-none w-28 focus:border-blue-400 bg-white"
          />
        </Box>
      </Box>
    </Box>
  );
}

// ─── Step 2: Schema Review ─────────────────────────────────────────────────────

function Step2Schema({ session, onBack, onNext, onSessionExpired }) {
  const normalizedProposal = normalizeProposal(session?.proposal);
  const [mapping,   setMapping]   = useState({
    entities:      enrichEntities(normalizedProposal.entities),
    relationships: normalizedProposal.relationships,
  });
  const [warnings,  setWarnings]  = useState([]);
  const [errors,    setErrors]    = useState([]);
  const [submitErr, setSubmitErr] = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [busy,      setBusy]      = useState(false);

  const sourceTables = asArray(mapping.entities).map((e) => String(e?.source_table || '')).filter(Boolean);
  const entityColors = Object.fromEntries(asArray(mapping.entities).map((e) => [e.source_table, e._color]));

  const nodeErrs = asArray(mapping.entities).map((e) => {
    const lbl = String(e?.node_label || '').trim();
    return !lbl ? 'Empty label' : !LABEL_RE.test(lbl) ? 'Invalid format' : null;
  });
  const relErrs = asArray(mapping.relationships).map((r) => {
    const t = String(r?.rel_type || '').trim();
    if (!t)                        return 'Relationship type is required';
    if (!LABEL_RE.test(t))         return 'Must start with a letter; letters, digits, underscores only';
    if (!r.from_table || !r.to_table) return 'Both FROM and TO nodes must be selected';
    return null;
  });
  const hasLocalErrors = nodeErrs.some(Boolean) || relErrs.some(Boolean) || asArray(mapping.entities).length === 0;

  const resetPreview = () => { setPreview(null); setErrors([]); setWarnings([]); setSubmitErr(null); };

  const updateEntity       = (idx, updated) => { const e = [...mapping.entities];      e[idx] = updated; setMapping((p) => ({ ...p, entities: e }));      resetPreview(); };
  const updateRelationship = (idx, updated) => { const r = [...mapping.relationships]; r[idx] = updated; setMapping((p) => ({ ...p, relationships: r })); resetPreview(); };
  const deleteEntity       = (idx) => {
    const tbl = mapping.entities[idx].source_table;
    setMapping((p) => ({
      entities:      p.entities.filter((_, i) => i !== idx),
      relationships: p.relationships.filter((r) => r.from_table !== tbl && r.to_table !== tbl),
    }));
    resetPreview();
  };
  const deleteRelationship = (idx) => { setMapping((p) => ({ ...p, relationships: p.relationships.filter((_, i) => i !== idx) })); resetPreview(); };

  const addRelationship = () => {
    const from = sourceTables[0] || '';
    const to   = sourceTables.length > 1 ? sourceTables[1] : (sourceTables[0] || '');
    setMapping((p) => ({
      ...p,
      relationships: [
        ...p.relationships,
        { rel_type: 'RELATED_TO', from_table: from, to_table: to, from_column: '', to_column: '' },
      ],
    }));
    resetPreview();
  };

  const handleValidateAndPreview = async () => {
    if (hasLocalErrors) return;
    setBusy(true);
    resetPreview();
    try {
      const body = {
        entities: mapping.entities.map(({ _color, properties: _props, ...rest }) => ({
          table_name: rest.source_table,
          node_label: rest.node_label,
          id_column:  rest.id_column,
          columns:    rest.columns,
        })),
        relationships: mapping.relationships,
      };
      const mapRes = await fetch(`${BASE}/upload/${session.uploadId}/mapping`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', ...authHdr() },
        body:    JSON.stringify(body),
      });
      if (mapRes.status === 404) { onSessionExpired(); return; }
      if (!mapRes.ok) {
        const e = await readErr(mapRes);
        setErrors(e.errors?.length ? e.errors : [e.error || 'Mapping rejected by server']);
        return;
      }
      const mapData = await mapRes.json();
      setWarnings(asArray(mapData?.warnings));

      const preRes = await fetch(`${BASE}/upload/${session.uploadId}/preview`, {
        method: 'POST', headers: authHdr(),
      });
      if (preRes.status === 404) { onSessionExpired(); return; }
      if (!preRes.ok) {
        const e = await readErr(preRes);
        setSubmitErr(e.error || 'Preview request failed');
        return;
      }
      const previewData = await preRes.json();
      setPreview({
        valid:                    Boolean(previewData?.valid),
        total_node_counts:        asObject(previewData?.total_node_counts),
        total_relationship_count: Number(previewData?.total_relationship_count || 0),
        issues:                   asArray(previewData?.issues),
      });
    } catch {
      setSubmitErr('Network error — could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  const previewErrs  = asArray(preview?.issues).filter((i) => i?.level === 'error');
  const previewWarns = asArray(preview?.issues).filter((i) => i?.level === 'warning');
  const canProceed   = Boolean(preview?.valid) && !errors.length && !previewErrs.length;
  const sampleData   = normalizeSampleData(session?.sampleData);

  return (
    <Box>
      {/* Header */}
      <Box className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <Box>
          <Typography variant="h6" className="!font-bold !text-gray-800 !mb-0.5">Schema Review</Typography>
          <Typography variant="body2" className="!text-gray-400">
            Rename labels and relationship types, adjust column mapping, then validate.
          </Typography>
        </Box>
        <Box className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-100">
            <Layers size={12} /> {mapping.entities.length} Nodes
          </span>
          <span className="flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-100">
            <GitBranch size={12} /> {asArray(mapping.relationships).length} Rels
          </span>
          {preview && (
            <span className="flex items-center gap-1.5 bg-gray-50 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200">
              ~{Object.values(preview.total_node_counts || {}).reduce((a, b) => a + b, 0).toLocaleString()} rows
            </span>
          )}
        </Box>
      </Box>

      <ErrorBox messages={errors} />
      <WarnBox   messages={warnings} onDismiss={() => setWarnings([])} />

      {/* Preview result */}
      {preview && (
        <Box className={`mb-6 p-4 rounded-xl border ${preview.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <Typography variant="body2" className={`!font-bold !mb-2 ${preview.valid ? '!text-green-700' : '!text-red-700'}`}>
            {preview.valid ? '✓ Dry-run passed — ready to commit' : '✕ Dry-run failed'}
          </Typography>
          <Box className="flex flex-wrap gap-2 mb-2">
            {Object.entries(preview.total_node_counts || {}).map(([label, count]) => (
              <span key={label} className="text-xs font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-1">
                {label}: <strong>{Number(count).toLocaleString()}</strong>
              </span>
            ))}
            <span className="text-xs font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-1">
              Rels: <strong>{(preview.total_relationship_count ?? 0).toLocaleString()}</strong>
            </span>
          </Box>
          {previewErrs.map ((iss, i) => <Typography key={i} variant="caption" className="!text-red-600 block !leading-5">✕ {iss.message}</Typography>)}
          {previewWarns.map((iss, i) => <Typography key={i} variant="caption" className="!text-amber-600 block !leading-5">⚠ {iss.message}</Typography>)}
        </Box>
      )}

      {submitErr && (
        <Box className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle size={13} className="text-red-500 shrink-0" />
          <Typography variant="caption" className="!text-red-600">{submitErr}</Typography>
        </Box>
      )}

      {/* Node Labels */}
      <Box className="mb-7">
        <Box className="flex items-center gap-2 mb-3">
          <Box className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
            <Layers size={11} className="text-white" />
          </Box>
          <Typography variant="body1" className="!font-bold !text-gray-700">Node Labels</Typography>
          <SectionBadge count={mapping.entities.length} color="indigo" />
        </Box>
        {mapping.entities.length === 0 && (
          <Box className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
            <Typography variant="body2" className="!text-red-600 !font-medium">At least one node type is required.</Typography>
          </Box>
        )}
        <Box className="flex flex-col gap-2.5">
          {asArray(mapping.entities).map((entity, idx) => (
            <NodeCard
              key={idx}
              entity={entity}
              sampleData={sampleData}
              onChange={(updated) => updateEntity(idx, updated)}
              onDelete={() => deleteEntity(idx)}
            />
          ))}
        </Box>
      </Box>

      {/* Relationships */}
      <Box className="mb-7">
        <Box className="flex items-center justify-between mb-3">
          <Box className="flex items-center gap-2">
            <Box className="w-5 h-5 bg-green-600 rounded flex items-center justify-center">
              <GitBranch size={11} className="text-white" />
            </Box>
            <Typography variant="body1" className="!font-bold !text-gray-700">Relationships</Typography>
            <SectionBadge count={asArray(mapping.relationships).length} color="green" />
          </Box>
          <Tooltip title={sourceTables.length < 1 ? 'Add at least one node first' : 'Manually connect two nodes'}>
            <span>
              <CustomButton
                variant="outlined"
                onClick={addRelationship}
                disabled={sourceTables.length < 1}
                startIcon={<Plus size={13} />}
                className="!text-xs !border-green-200 !text-green-600 !py-1"
              >
                Add Relationship
              </CustomButton>
            </span>
          </Tooltip>
        </Box>

        {asArray(mapping.relationships).length === 0 ? (
          <Box
            className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-green-300 hover:bg-green-50 transition-colors"
            onClick={() => sourceTables.length > 0 && addRelationship()}
          >
            <GitBranch size={22} className="text-gray-200 mx-auto mb-2" />
            <Typography variant="body2" className="!text-gray-400 !mb-1">
              No relationships detected.
            </Typography>
            {sourceTables.length > 0 && (
              <Typography variant="caption" className="!text-green-500 !font-semibold">
                + Click to add a relationship manually
              </Typography>
            )}
          </Box>
        ) : (
          <Box className="flex flex-col gap-2.5">
            {asArray(mapping.relationships).map((rel, idx) => (
              <RelationshipCard
                key={idx}
                rel={rel}
                idx={idx}
                sourceTables={sourceTables}
                entities={mapping.entities}
                entityColors={entityColors}
                relErrors={relErrs}
                onUpdate={(updated) => updateRelationship(idx, updated)}
                onDelete={() => deleteRelationship(idx)}
              />
            ))}
            {/* Inline add button below existing relationships */}
            <Box
              className="flex items-center justify-center gap-2 p-3 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50 transition-colors text-gray-400 hover:text-green-600"
              onClick={() => sourceTables.length > 0 && addRelationship()}
            >
              <Plus size={14} />
              <Typography variant="caption" className="!font-semibold">Add another relationship</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box className="flex justify-between items-center mt-2 border-t border-gray-50 pt-5 flex-wrap gap-3">
        <CustomButton variant="outlined" startIcon={<ArrowLeft size={15} />} onClick={onBack} disabled={busy} className="!text-gray-500 !border-gray-200">
          Back
        </CustomButton>
        <Box className="flex gap-2.5 items-center">
          <CustomButton
            variant="outlined"
            onClick={handleValidateAndPreview}
            disabled={hasLocalErrors || busy}
            startIcon={busy ? <CircularProgress size={13} color="inherit" /> : <Eye size={14} />}
            className="!border-blue-500 !text-blue-600"
          >
            {busy ? 'Validating…' : preview ? 'Re-validate' : 'Validate & Preview'}
          </CustomButton>
          {canProceed && (
            <CustomButton variant="contained" endIcon={<ArrowRight size={15} />} onClick={onNext}>
              Confirm Schema
            </CustomButton>
          )}
          {preview && !canProceed && !busy && (
            <Box className="flex items-center gap-1.5">
              <AlertCircle size={13} className="text-red-500" />
              <Typography variant="caption" className="!text-red-500 !font-medium">Fix errors to continue</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Step 3: Confirm & Ingest ──────────────────────────────────────────────────

const LOG_CLS = { ok: '!text-green-400', err: '!text-red-400', info: '!text-blue-300' };

function Step3Confirm({ session, onBack, onSessionExpired, onReset, onIngestComplete, connectionId, connections }) {
  const [graphName, setGraphName] = useState('');
  const [nameErr,   setNameErr]   = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [log,       setLog]       = useState([]);
  const [complete,  setComplete]  = useState(null);
  const [fatalErr,  setFatalErr]  = useState(null);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const appendLog = useCallback((text, variant = 'info') =>
    setLog((prev) => [...prev, { text, variant }]), []);

  const handleIngest = async () => {
    const name = graphName.trim();
    if (!name)             { setNameErr('Graph name is required');   return; }
    if (name.length > 200) { setNameErr('Maximum 200 characters');   return; }
    setNameErr('');
    setIngesting(true);
    setLog([]);
    setFatalErr(null);
    setComplete(null);

    try {
      let url = `${BASE}/upload/${session.uploadId}/commit?graph_name=${encodeURIComponent(name)}`;
      if (connectionId) url += `&connection_id=${encodeURIComponent(connectionId)}`;

      const res = await fetch(url, { method: 'POST', headers: authHdr() });
      if (res.status === 404) { onSessionExpired(); return; }
      if (!res.ok) {
        const body = await readErr(res);
        setFatalErr(body.error || `Commit failed (${res.status})`);
        setIngesting(false);
        return;
      }

      const reader  = res.body.getReader();
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
                setComplete(evt);
                setIngesting(false);
                if (evt.status !== 'FAILED') onIngestComplete?.();
                break;
              case 'error':
                setFatalErr(evt.message || 'Stream error');
                setIngesting(false);
                return;
            }
          } catch { /* skip malformed line */ }
        }
      }
    } catch {
      setFatalErr('Network error — could not reach the server.');
      setIngesting(false);
    }
  };

  // Success / Partial screen
  if (complete && (complete.status === 'SUCCESS' || complete.status === 'PARTIAL')) {
    const totalNodes = complete.total_nodes != null ? Number(complete.total_nodes).toLocaleString() : '—';
    const totalRels  = complete.total_relationships != null ? Number(complete.total_relationships).toLocaleString() : '—';
    return (
      <Box className="flex flex-col items-center text-center py-8">
        <Box className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${complete.status === 'SUCCESS' ? 'bg-green-100' : 'bg-amber-100'}`}>
          <CheckCircle2 size={36} className={complete.status === 'SUCCESS' ? 'text-green-600' : 'text-amber-500'} />
        </Box>
        <Typography variant="h5" className="!font-bold !text-gray-800 !mb-1.5">
          {complete.status === 'SUCCESS' ? 'Graph Ingested' : 'Partially Ingested'}
        </Typography>
        {complete.status === 'PARTIAL' && complete.message && (
          <Box className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl max-w-sm">
            <Typography variant="body2" className="!text-amber-700 !text-sm">⚠ {complete.message}</Typography>
          </Box>
        )}
        <Typography variant="body2" className="!text-gray-400 !mb-6 max-w-sm">
          "{graphName}" has been written to Neo4j.
        </Typography>
        <Box className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6">
          {[
            { label: 'Nodes Created',  value: totalNodes, color: '#2563eb', bg: '#eff6ff' },
            { label: 'Relationships',  value: totalRels,  color: '#16a34a', bg: '#f0fdf4' },
          ].map((s) => (
            <Box key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: s.bg }}>
              <Typography variant="h5" className="!font-bold" style={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" className="!text-gray-400 !font-medium">{s.label}</Typography>
            </Box>
          ))}
        </Box>
        <Box className="w-full max-w-xl bg-gray-950 rounded-xl p-4 text-left mb-6 max-h-36 overflow-y-auto">
          {log.map((l, i) => (
            <Typography key={i} variant="caption" className={`block font-mono !text-[11px] !leading-5 ${LOG_CLS[l.variant] || '!text-gray-500'}`}>{l.text}</Typography>
          ))}
        </Box>
        <CustomButton variant="outlined" onClick={onReset} className="!border-gray-200 !text-gray-500">
          Ingest Another File
        </CustomButton>
      </Box>
    );
  }

  const activeConn = connections?.find((c) => c.connection_id === connectionId);
  const connLabel  = activeConn ? (activeConn.label || activeConn.uri || 'Custom Connection') : 'Default Server';

  return (
    <Box>
      <Typography variant="h6" className="!font-bold !text-gray-800 !mb-1">Confirm &amp; Ingest</Typography>
      <Typography variant="body2" className="!text-gray-400 !mb-6">
        Name your graph and start the ingest. Progress streams in real time.
      </Typography>

      {/* Connection summary */}
      <Box className="mb-5 p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2.5">
        <Server size={14} className="text-gray-400 shrink-0" />
        <Box className="flex-1">
          <Typography variant="caption" className="!text-gray-400 !font-medium block !leading-4">Target Connection</Typography>
          <Typography variant="body2" className="!font-semibold !text-gray-700">{connLabel}</Typography>
        </Box>
        {activeConn && (
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">CUSTOM</span>
        )}
      </Box>

      {/* Graph name */}
      <Box className="mb-6">
        <Typography variant="body2" className="!font-semibold !text-gray-600 !mb-1.5">
          Graph Name <span className="text-red-500">*</span>
        </Typography>
        <Box
          className={`flex items-center border rounded-xl overflow-hidden transition-colors ${
            nameErr ? 'border-red-300' : graphName.trim() ? 'border-blue-500' : 'border-gray-200'
          }`}
        >
          <Box className="px-3 py-2.5 bg-gray-50 border-r border-gray-100">
            <Database size={16} className="text-gray-400" />
          </Box>
          <input
            value={graphName}
            onChange={(e) => { setGraphName(e.target.value); if (nameErr) setNameErr(''); }}
            placeholder="e.g. Customer Orders 2024"
            disabled={ingesting}
            className="flex-1 px-3 py-2.5 text-sm outline-none bg-white font-medium"
          />
          {graphName.trim() && !nameErr && !ingesting && <Check size={15} className="text-green-500 mr-3" />}
        </Box>
        {nameErr
          ? <Typography variant="caption" className="!text-red-500 !mt-1 block">{nameErr}</Typography>
          : <Typography variant="caption" className="!text-gray-300 !mt-1 block">{graphName.length}/200</Typography>
        }
      </Box>

      {/* Stream progress */}
      {(ingesting || log.length > 0) && (
        <Box className="mb-6">
          {ingesting && (
            <Box className="p-4 bg-blue-50 border border-blue-100 rounded-t-xl border-b-0">
              <Box className="flex items-center gap-2.5 mb-2.5">
                <CircularProgress size={14} sx={{ color: '#2563eb' }} />
                <Typography variant="body2" className="!font-semibold !text-blue-700">Writing to Neo4j…</Typography>
              </Box>
              <LinearProgress sx={{ borderRadius: 4, bgcolor: '#bfdbfe', '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' } }} />
            </Box>
          )}
          <Box
            ref={logRef}
            className={`bg-gray-950 px-4 py-3.5 max-h-52 overflow-y-auto ${ingesting ? 'rounded-b-xl' : 'rounded-xl'}`}
          >
            {log.map((l, i) => (
              <Typography key={i} variant="caption" className={`block font-mono !text-[11px] !leading-5 ${LOG_CLS[l.variant] || '!text-gray-500'}`}>
                {l.text}
              </Typography>
            ))}
            {ingesting && (
              <Typography variant="caption" className="block font-mono !text-[11px] !text-gray-600 animate-pulse">▋</Typography>
            )}
          </Box>
        </Box>
      )}

      {(fatalErr || complete?.status === 'FAILED') && (
        <Box className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
          <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <Box>
            <Typography variant="body2" className="!font-bold !text-red-700 !mb-0.5">Ingest Failed</Typography>
            <Typography variant="body2" className="!text-red-600">{complete?.message || fatalErr}</Typography>
          </Box>
        </Box>
      )}

      <Box className="flex justify-between items-center border-t border-gray-50 pt-5">
        <CustomButton variant="outlined" startIcon={<ArrowLeft size={15} />} onClick={onBack} disabled={ingesting} className="!text-gray-500 !border-gray-200">
          Back
        </CustomButton>
        <CustomButton
          variant="contained"
          onClick={handleIngest}
          disabled={!graphName.trim() || ingesting}
          startIcon={ingesting ? <CircularProgress size={13} color="inherit" /> : <Database size={15} />}
        >
          {ingesting ? 'Ingesting…' : 'Ingest to Neo4j'}
        </CustomButton>
      </Box>
    </Box>
  );
}

// ─── Graph Listing ─────────────────────────────────────────────────────────────

function GraphListing({ refreshTrigger }) {
  const [graphs,  setGraphs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoints = [`${BASE}/graphs`, `${BASE}/upload/graphs`];
      let loaded = false;
      for (const ep of endpoints) {
        const res = await fetch(ep, { headers: authHdr() });
        if (!res.ok) {
          if (res.status === 404) continue;
          const err = await readErr(res);
          setError(err?.error || 'Failed to load graphs');
          loaded = true;
          break;
        }
        const d = await res.json();
        setGraphs(normalizeGraphs(d));
        loaded = true;
        break;
      }
      if (!loaded) { setGraphs([]); setError('Graph listing endpoint not available on this environment yet.'); }
    } catch {
      setError('Network error — could not load graphs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this graph dataset from Neo4j? This cannot be undone.')) return;
    try {
      const res = await fetch(`${BASE}/graphs/${id}`, { method: 'DELETE', headers: authHdr() });
      if (res.ok) setGraphs((prev) => asArray(prev).filter((g) => g.id !== id));
      else { const b = await readErr(res); alert(b.error || 'Delete failed'); }
    } catch { alert('Network error'); }
  };

  const ftColors = {
    csv:  'bg-sky-50 text-sky-600 border-sky-100',
    xlsx: 'bg-green-50 text-green-600 border-green-100',
    xls:  'bg-green-50 text-green-600 border-green-100',
    sql:  'bg-violet-50 text-violet-600 border-violet-100',
    zip:  'bg-amber-50 text-amber-600 border-amber-100',
  };

  const statusEl = {
    Indexed:    <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Indexed</span>,
    Processing: <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Processing</span>,
    Failed:     <span className="flex items-center gap-1 text-[11px] font-semibold text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Failed</span>,
  };

  return (
    <Box className="mt-8">
      <Box className="flex items-center justify-between mb-4">
        <Box>
          <Typography variant="h6" className="!font-bold !text-gray-700">Ingested Graphs</Typography>
          <Typography variant="body2" className="!text-gray-400 !text-sm">
            {loading ? 'Loading…' : `${asArray(graphs).length} dataset${asArray(graphs).length !== 1 ? 's' : ''} in Neo4j`}
          </Typography>
        </Box>
        <CustomButton
          variant="outlined"
          onClick={load}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={12} /> : <RefreshCcw size={13} />}
          className="!text-gray-400 !border-gray-200 !text-sm"
        >
          Refresh
        </CustomButton>
      </Box>

      {error && (
        <Box className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <Typography variant="body2" className="!text-red-600 !text-sm">{error}</Typography>
        </Box>
      )}

      {loading && (
        <Box className="flex justify-center py-16">
          <CircularProgress size={28} sx={{ color: '#2563eb' }} />
        </Box>
      )}

      {!loading && !error && asArray(graphs).length === 0 && (
        <Box className="flex flex-col items-center p-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Box className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Share2 size={24} className="text-gray-200" />
          </Box>
          <Typography variant="body1" className="!font-semibold !text-gray-400">No graph datasets yet</Typography>
          <Typography variant="body2" className="!text-gray-300 !mt-1">Ingest your first dataset using the wizard above.</Typography>
        </Box>
      )}

      {!loading && !error && asArray(graphs).length > 0 && (
        <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Box className="grid grid-cols-12 text-[10px] font-bold text-gray-400 bg-gray-50 px-5 py-3 border-b border-gray-100 uppercase tracking-widest">
            <Box className="col-span-4">Graph Name</Box>
            <Box className="col-span-1">Format</Box>
            <Box className="col-span-2 text-right">Nodes</Box>
            <Box className="col-span-2 text-right">Rels</Box>
            <Box className="col-span-2">Created</Box>
            <Box className="col-span-1" />
          </Box>
          {asArray(graphs).map((g, i) => (
            <Box
              key={g.id}
              className={`grid grid-cols-12 items-center px-5 py-4 hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <Box className="col-span-4 flex items-center gap-3 min-w-0">
                <Box className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <Share2 size={14} className="text-indigo-500" />
                </Box>
                <Box className="min-w-0">
                  <Typography variant="body2" className="!font-semibold !text-gray-700 truncate">{renderCell(g?.graph_name)}</Typography>
                  <Box className="mt-0.5">{statusEl[g.status] ?? null}</Box>
                </Box>
              </Box>
              <Box className="col-span-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${ftColors[g.file_type] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {renderCell(g?.file_type)}
                </span>
              </Box>
              <Box className="col-span-2 text-right">
                <Typography variant="body2" className="!font-bold !text-indigo-600">
                  {Number(g?.node_count || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box className="col-span-2 text-right">
                <Typography variant="body2" className="!font-bold !text-green-600">
                  {Number(g?.relationship_count || 0).toLocaleString()}
                </Typography>
              </Box>
              <Box className="col-span-2">
                <Box className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-gray-300" />
                  <Typography variant="caption" className="!text-gray-400">
                    {g?.created_at
                      ? new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '--'}
                  </Typography>
                </Box>
              </Box>
              <Box className="col-span-1 flex justify-end">
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(g.id)} sx={{ p: 0.6 }}>
                    <Trash2 size={14} className="text-gray-300 hover:text-red-500" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Page Root ─────────────────────────────────────────────────────────────────

export default function Neo4jKnowledgePage() {
  const [step,         setStep]         = useState(1);
  const [session,      setSession]      = useState(null);
  const [sessionExp,   setSessionExp]   = useState(false);
  const [listingKey,   setListingKey]   = useState(0);
  const [connectionId, setConnectionId] = useState(null);
  const [connections,  setConnections]  = useState([]);

  // Recover in-progress session from sessionStorage
  useEffect(() => {
    const id = sessionStorage.getItem('cmdb_upload_id');
    if (!id) return;
    fetch(`${BASE}/upload/${id}`, { headers: authHdr() })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const proposal = normalizeProposal(data?.proposal);
        if (proposal.entities.length > 0 || proposal.relationships.length > 0) {
          setSession({ uploadId: id, proposal, sampleData: normalizeSampleData(data?.sample_data) });
          setStep(2);
        } else {
          sessionStorage.removeItem('cmdb_upload_id');
        }
      })
      .catch(() => sessionStorage.removeItem('cmdb_upload_id'));
  }, []);

  const handleUploadDone = (data) => {
    const proposal = normalizeProposal(data?.proposal);
    setSession({ uploadId: data?.upload_id, proposal, sampleData: normalizeSampleData(data?.sample_data) });
    setSessionExp(false);
    setStep(2);
  };

  const handleSessionExpired = () => {
    sessionStorage.removeItem('cmdb_upload_id');
    setSession(null);
    setSessionExp(true);
    setStep(1);
  };

  const cancelSession = () => {
    if (session?.uploadId) {
      fetch(`${BASE}/upload/${session.uploadId}`, { method: 'DELETE', headers: authHdr() }).catch(() => {});
    }
    sessionStorage.removeItem('cmdb_upload_id');
    setSession(null);
    setStep(1);
  };

  const handleReset = () => {
    if (session?.uploadId) {
      fetch(`${BASE}/upload/${session.uploadId}`, { method: 'DELETE', headers: authHdr() }).catch(() => {});
    }
    sessionStorage.removeItem('cmdb_upload_id');
    setSession(null);
    setStep(1);
    setListingKey((k) => k + 1);
  };

  return (
    <Box className="px-4 sm:px-6 lg:px-5 py-5 bg-[#f8fafc] min-h-screen">
      {/* Page header */}
      <Box className="mb-8 flex items-center justify-between flex-wrap gap-4 max-w-5xl mx-auto">
        <Box className="flex items-center gap-3">
          <Box className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Database size={20} className="text-white" />
          </Box>
          <Box>
            <Typography variant="h5" className="!font-bold !text-gray-800 !leading-tight">Graph Knowledge Base</Typography>
            <Typography variant="body2" className="!text-gray-400">
              Upload structured data and model it as a Neo4j knowledge graph
            </Typography>
          </Box>
        </Box>
        <HealthBadge />
      </Box>

      <Box className="max-w-5xl mx-auto">
        {/* Connection manager (Step 0) */}
        <ConnectionManager
          selectedId={connectionId}
          onSelect={setConnectionId}
          onConnectionsChange={setConnections}
        />

        {/* Wizard card */}
        <Box className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <StepIndicator current={step} />

          {step === 1 && (
            <Step1Upload onSuccess={handleUploadDone} sessionExpiredMsg={sessionExp} />
          )}
          {step === 2 && session && (
            <Step2Schema
              session={session}
              onBack={cancelSession}
              onNext={() => setStep(3)}
              onSessionExpired={handleSessionExpired}
            />
          )}
          {step === 3 && session && (
            <Step3Confirm
              session={session}
              onBack={() => setStep(2)}
              onSessionExpired={handleSessionExpired}
              onReset={handleReset}
              onIngestComplete={() => setListingKey((k) => k + 1)}
              connectionId={connectionId}
              connections={connections}
            />
          )}
        </Box>

        {/* Graph listing */}
        <GraphListing refreshTrigger={listingKey} />
      </Box>
    </Box>
  );
}
