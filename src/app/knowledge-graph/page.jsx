'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CloudUpload, FileText, Database, Share2, CheckCircle2,
  ArrowRight, ArrowLeft, Trash2, Eye, EyeOff,
  Network, Layers, Check, X, GitBranch,
  Calendar, RefreshCcw, Info, AlertCircle, Plus,
  Server, Unlink, ChevronDown, ChevronUp,
  Zap, ArrowRightCircle, Table2, Activity, Loader2,
} from 'lucide-react';
import {
  fetchConnections, addConnection, removeConnection,
  checkConnectionHealth, checkServerHealth,
  fetchGraphs, deleteGraph,
  setSelectedConnection, setStep, setUploadSession,
  clearSession, setSessionExpired, resetWizard,
} from '@/redux/slices/knowledgeGraphSlice';

/* ─── Config & helpers ───────────────────────────────────────────── */

const BASE = (process.env.NEXT_PUBLIC_CMDB_API_URL || 'http://1.6.37.35/cmdb').replace(/\/$/, '');
const LABEL_RE = /^[A-Za-z][A-Za-z0-9_]*$/;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const ALLOWED_EXT = ['.csv', '.xlsx', '.xls', '.sql', '.zip'];
const NODE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#b45309', '#0d9488'];

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
const authHdr = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };
const readErr = async (res) => { try { return await res.json(); } catch { return { error: `HTTP ${res.status}` }; } };

const renderCell = (v) => {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

const enrichEntities = (entities) =>
  (entities || []).map((e, i) => ({ ...e, _color: NODE_COLORS[i % NODE_COLORS.length] }));

const asArray = (v) => (Array.isArray(v) ? v : []);
const asObject = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

const normalizeColumn = (col) => {
  if (typeof col === 'string')
    return { source_column: col, target_property: col, is_identity: false, skip: false };
  if (typeof col === 'object' && col !== null)
    return {
      source_column: String(col.source_column || col.column || col.name || ''),
      target_property: String(col.target_property || col.target || col.source_column || col.name || ''),
      is_identity: Boolean(col.is_identity || col.is_primary),
      skip: Boolean(col.skip || col.exclude),
    };
  return { source_column: String(col), target_property: String(col), is_identity: false, skip: false };
};

const normalizeEntity = (entity) => {
  const e = asObject(entity);
  const rawCols = asArray(e.columns || e.source_columns || e.properties);
  const columns = rawCols.map(normalizeColumn).filter((c) => c.source_column);
  const properties = columns.length > 0 ? columns.map((c) => c.source_column) : [];
  const idCol = String(e.id_column || e.primary_key || properties[0] || 'id');
  return {
    source_table: String(e.source_table || e.table_name || e.table || e.from_table || ''),
    node_label: String(e.node_label || e.label || e.entity || 'Entity'),
    id_column: idCol,
    is_junction_table: Boolean(e.is_junction_table),
    properties,
    columns,
  };
};

const normalizeRelationship = (r) => {
  const rel = asObject(r);
  return {
    rel_type: String(rel.rel_type || rel.type || 'RELATED_TO'),
    from_table: String(rel.from_table || rel.source_table || rel.from || ''),
    to_table: String(rel.to_table || rel.target_table || rel.to || ''),
    from_column: String(rel.from_column || rel.left_key || ''),
    to_column: String(rel.to_column || rel.right_key || ''),
  };
};

const normalizeProposal = (raw) => {
  const p = asObject(raw);
  return {
    entities: asArray(p.entities || p.entity_mappings || p.node_mappings || p.nodes).map(normalizeEntity),
    relationships: asArray(p.relationships || p.relationship_mappings || p.edges).map(normalizeRelationship),
  };
};

const normalizeSampleData = (raw) => {
  const src = asObject(raw);
  const out = {};
  Object.keys(src).forEach((k) => { out[k] = asArray(src[k]); });
  return out;
};

/* ─── Primitive UI (Tailwind-only) ───────────────────────────────── */

function Spinner({ size = 14, className = '' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

function Button({
  variant = 'primary', size = 'md', leftIcon, rightIcon, disabled, loading,
  className = '', children, type = 'button', ...rest
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 select-none focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-sm px-5 py-2.5',
  };
  const variants = {
    primary:
      'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-sm shadow-blue-200 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 focus:ring-blue-300',
    outline:
      'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200',
    accent:
      'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 focus:ring-emerald-200',
    info:
      'bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
  };
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size={14} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

function IconBtn({ title, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, disabled, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-600',
    amber: 'bg-amber-500',
    gray: 'bg-gray-500',
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200 disabled:opacity-50 ${
        checked ? colors[color] : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function ProgressBar({ color = '#2563eb', bg = '#bfdbfe' }) {
  return (
    <div className="relative h-1 rounded-full overflow-hidden" style={{ backgroundColor: bg }}>
      <div
        className="absolute inset-y-0 left-0 w-1/3 rounded-full animate-[progress_1.4s_ease-in-out_infinite]"
        style={{ backgroundColor: color }}
      />
      <style jsx>{`
        @keyframes progress {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}

function Collapsible({ open, children }) {
  return (
    <div
      className={`grid transition-all duration-300 ease-out ${
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

function Modal({ open, onClose, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-[fadein_.18s_ease]"
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl overflow-hidden animate-[pop_.2s_ease]`}>
        {children}
      </div>
      <style jsx>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pop   { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

function SectionBadge({ count, color = 'indigo' }) {
  const cls = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200/60',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200/60',
    gray: 'bg-gray-100 text-gray-600 ring-gray-200/60',
  }[color] || 'bg-gray-100 text-gray-600 ring-gray-200/60';
  return (
    <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] text-[11px] font-bold rounded-full ring-1 px-1 ${cls}`}>
      {count}
    </span>
  );
}

function ErrorBox({ messages }) {
  if (!messages?.length) return null;
  return (
    <div className="p-4 bg-red-50/80 border border-red-200/80 rounded-xl mb-5">
      <div className="flex items-center gap-2.5 mb-2">
        <AlertCircle size={15} className="text-red-500 shrink-0" />
        <span className="font-semibold text-red-700 text-sm">
          {messages.length > 1 ? `${messages.length} Errors` : 'Error'}
        </span>
      </div>
      {messages.map((m, i) => (
        <p key={i} className="text-xs text-red-600 leading-relaxed pl-6">• {m}</p>
      ))}
    </div>
  );
}

function WarnBox({ messages, onDismiss }) {
  if (!messages?.length) return null;
  return (
    <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <Info size={15} className="text-amber-500 shrink-0" />
          <span className="font-semibold text-amber-700 text-sm">
            {messages.length > 1 ? `${messages.length} Warnings` : 'Warning'}
          </span>
        </div>
        {onDismiss && (
          <IconBtn title="Dismiss" onClick={onDismiss}>
            <X size={14} className="text-amber-400" />
          </IconBtn>
        )}
      </div>
      {messages.map((m, i) => (
        <p key={i} className="text-xs text-amber-600 leading-relaxed pl-6">• {m}</p>
      ))}
    </div>
  );
}

function InfoRow({ icon: Icon, color = 'text-red-500', children }) {
  return (
    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5">
      <Icon size={14} className={`${color} shrink-0`} />
      <span className="text-xs text-red-600">{children}</span>
    </div>
  );
}

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white';

/* ─── Add Connection Dialog ──────────────────────────────────────── */

function AddConnectionDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ uri: '', username: 'neo4j', password: '', database: 'neo4j', label: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErr(null); };

  const handleConnect = async () => {
    if (!form.uri.trim()) return setErr('URI is required');
    if (!form.username.trim()) return setErr('Username is required');
    if (!form.password) return setErr('Password is required');
    setBusy(true); setErr(null);
    try {
      const result = await dispatch(addConnection({
        uri: form.uri.trim(),
        username: form.username.trim(),
        password: form.password,
        database: form.database.trim() || 'neo4j',
        label: form.label.trim() || undefined,
      })).unwrap();
      if (result) {
        setForm({ uri: '', username: 'neo4j', password: '', database: 'neo4j', label: '' });
        onClose();
      }
    } catch (e) {
      setErr(typeof e === 'string' ? e : 'Connection failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-6 pt-5 pb-3 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
          <Server size={17} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-base">Add Neo4j Connection</h3>
          <p className="text-xs text-gray-400">Connect to a Neo4j instance</p>
        </div>
        <button className="ml-auto p-1 rounded-md hover:bg-gray-100" onClick={onClose}>
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
            URI <span className="text-red-500">*</span>
          </label>
          <input
            value={form.uri}
            onChange={(e) => set('uri', e.target.value)}
            placeholder="bolt://my-neo4j-host:7687"
            className={`${inputCls} font-mono`}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Username <span className="text-red-500">*</span>
            </label>
            <input value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="neo4j" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Password <span className="text-red-500">*</span>
            </label>
            <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Database</label>
            <input value={form.database} onChange={(e) => set('database', e.target.value)} placeholder="neo4j" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Label (optional)</label>
            <input value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="e.g. Production DB" className={inputCls} />
          </div>
        </div>
        {err && (
          <InfoRow icon={AlertCircle}>{err}</InfoRow>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50">
        <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={handleConnect} disabled={busy} leftIcon={!busy && <Zap size={14} />} loading={busy}>
          {busy ? 'Connecting…' : 'Connect'}
        </Button>
      </div>
    </Modal>
  );
}

/* ─── Connection Manager ─────────────────────────────────────────── */

function ConnectionManager() {
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

/* ─── Step Indicator ─────────────────────────────────────────────── */

const STEPS = [
  { id: 1, label: 'Upload', icon: CloudUpload },
  { id: 2, label: 'Schema', icon: Layers },
  { id: 3, label: 'Ingest', icon: Database },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center mb-8 sm:mb-10">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  done ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200'
                  : active ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white'
                }`}
              >
                {done
                  ? <Check size={17} className="text-white" strokeWidth={3} />
                  : <Icon size={16} className={active ? 'text-blue-600' : 'text-gray-300'} />}
              </div>
              <span className={`text-[11px] font-semibold leading-none ${done || active ? 'text-blue-600' : 'text-gray-300'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-12 sm:w-20 lg:w-24 h-0.5 mb-5 mx-2 sm:mx-3 rounded-full transition-all duration-500"
                style={{ backgroundColor: current > step.id ? '#2563eb' : '#e5e7eb' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Server Health Badge ────────────────────────────────────────── */

function HealthBadge() {
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

/* ─── Step 1: Upload ─────────────────────────────────────────────── */

function Step1Upload({ onSuccess, sessionExpiredMsg }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [clientErr, setClientErr] = useState(null);
  const [serverErr, setServerErr] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const validate = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return `Unsupported format. Allowed: ${ALLOWED_EXT.join(', ')}`;
    if (f.size > MAX_FILE_BYTES) return `File is ${(f.size / 1024 / 1024).toFixed(1)} MB — exceeds 100 MB limit`;
    return null;
  };

  const setCheckedFile = (f) => {
    const err = validate(f);
    setClientErr(err); setServerErr(null);
    if (!err) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setServerErr(null);
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
    { label: 'XLS', note: 'Legacy Excel' },
    { label: 'CSV', note: 'Comma/semicolon' },
    { label: 'ZIP', note: 'Multiple files' },
    { label: 'SQL', note: 'DDL / INSERT' },
  ];

  return (
    <div>
      <h2 className="font-bold text-gray-800 text-lg sm:text-xl mb-1">Upload Data File</h2>
      <p className="text-sm text-gray-400 mb-6">
        Upload a structured data file. We&apos;ll auto-detect nodes, properties and relationships.
      </p>

      {sessionExpiredMsg && (
        <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5">
          <Info size={14} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">Session expired — please re-upload your file.</p>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) setCheckedFile(e.dataTransfer.files[0]); }}
        onClick={() => !file && inputRef.current?.click()}
        className={`transition-all duration-200 rounded-2xl border-2 border-dashed cursor-pointer ${
          isDragging ? 'border-blue-400 bg-blue-50/80' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/50'
        }`}
      >
        <div className="flex flex-col items-center py-10 sm:py-14 lg:py-16 gap-4 px-4">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-100'
          }`}>
            <CloudUpload size={30} className={isDragging ? 'text-blue-500' : 'text-gray-300'} />
          </div>

          {!file ? (
            <>
              <div className="text-center">
                <p className="font-semibold text-gray-600 text-sm sm:text-base mb-1">
                  {isDragging ? 'Release to upload' : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-gray-400">
                  or <span className="text-blue-600 font-semibold cursor-pointer hover:underline">browse files</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                {formats.map((f) => (
                  <span
                    key={f.label}
                    title={f.note}
                    className="text-[11px] font-semibold bg-white text-gray-500 px-2.5 py-1 rounded-full cursor-default border border-gray-200 shadow-sm"
                  >
                    {f.label}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-gray-300">Max 100 MB</p>
            </>
          ) : (
            <div className="flex items-center gap-4 bg-white border border-emerald-200 rounded-xl px-4 sm:px-5 py-3.5 shadow-sm w-full max-w-sm sm:max-w-md">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <FileText size={20} className="text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-700 truncate text-sm">{file.name}</p>
                <p className="text-[11px] text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · ready to upload
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <IconBtn title="Remove" onClick={(e) => { e.stopPropagation(); setFile(null); setClientErr(null); setServerErr(null); }}>
                  <X size={14} className="text-gray-400" />
                </IconBtn>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={inputRef} type="file" hidden
        accept=".csv,.xlsx,.xls,.sql,.zip"
        onChange={(e) => { if (e.target.files?.[0]) setCheckedFile(e.target.files[0]); e.target.value = ''; }}
      />

      {(clientErr || serverErr) && (
        <div className="mt-4">
          <InfoRow icon={AlertCircle}>{clientErr || serverErr}</InfoRow>
        </div>
      )}

      {uploading && (
        <div className="mt-5 p-4 bg-blue-50/80 border border-blue-100 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Spinner size={14} className="text-blue-600" />
            <p className="font-semibold text-blue-700 text-sm">Analysing file structure…</p>
          </div>
          <ProgressBar />
          <p className="text-[11px] text-blue-500/70 mt-2.5">Detecting tables, columns and relationships</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-3">
        <p className="text-[11px] text-gray-300">
          {file ? 'Click Upload & Analyse to continue' : 'Select a file to begin'}
        </p>
        <Button
          onClick={handleUpload}
          disabled={!file || uploading || !!clientErr}
          loading={uploading}
          leftIcon={!uploading && <Network size={15} />}
        >
          {uploading ? 'Uploading…' : 'Upload & Analyse'}
        </Button>
      </div>
    </div>
  );
}

/* ─── Node Card ──────────────────────────────────────────────────── */

function NodeCard({ entity, sampleData, onChange, onDelete }) {
  const [sampleOpen, setSampleOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const nodeLabel = String(entity?.node_label || '');
  const sourceTable = String(entity?.source_table || '');
  const idColumn = String(entity?.id_column || '');
  const columns = asArray(entity?.columns);
  const color = entity?._color || '#2563eb';
  const valid = LABEL_RE.test(nodeLabel);
  const rows = asArray(sampleData?.[sourceTable]);
  const visibleCols = columns.filter((c) => !c.skip);

  const updateColumn = (i, patch) => {
    const next = columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c));
    onChange({ ...entity, columns: next });
  };

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 bg-white shadow-sm hover:shadow-md ${valid ? 'border-gray-200/80' : 'border-red-200'}`}>
      <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderLeft: `4px solid ${color}` }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        >N</div>
        <div className="flex-1 min-w-0">
          <input
            value={nodeLabel}
            onChange={(e) => onChange({ ...entity, node_label: e.target.value })}
            className={`w-full text-sm font-bold bg-transparent border-b pb-0.5 outline-none transition-colors ${
              valid ? 'border-transparent text-gray-800 focus:border-blue-400' : 'border-red-300 text-red-600'
            }`}
            placeholder="NodeLabel"
          />
          <p className={`leading-4 text-[10px] mt-0.5 ${!valid ? 'text-red-400' : 'text-gray-400'}`}>
            {!valid
              ? 'Must start with a letter; letters, digits, underscores only'
              : <><span className="font-mono">{sourceTable || '--'}</span> · id <span className="font-mono">{idColumn}</span> · {columns.length} cols</>}
          </p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {columns.length > 0 && (
            <IconBtn title="Column mapping" onClick={() => setColumnsOpen((v) => !v)}>
              <Table2 size={15} className={columnsOpen ? 'text-blue-500' : 'text-gray-400'} />
            </IconBtn>
          )}
          {rows.length > 0 && (
            <IconBtn title={sampleOpen ? 'Hide sample data' : 'View sample data'} onClick={() => setSampleOpen((v) => !v)}>
              {sampleOpen ? <EyeOff size={15} className="text-blue-500" /> : <Eye size={15} className="text-gray-400" />}
            </IconBtn>
          )}
          <IconBtn title="Remove node" onClick={onDelete}>
            <Trash2 size={15} className="text-gray-300 hover:text-red-500" />
          </IconBtn>
        </div>
      </div>

      <div className="px-4 py-2.5 bg-slate-50/50 border-t border-gray-100 flex flex-wrap gap-1.5">
        {visibleCols.slice(0, 8).map((col) => (
          <span
            key={col.source_column}
            className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
              col.source_column === idColumn
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            {col.source_column === idColumn ? '🔑 ' : ''}{col.target_property || col.source_column}
          </span>
        ))}
        {visibleCols.length > 8 && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-white text-gray-400 border border-gray-200 font-mono">
            +{visibleCols.length - 8} more
          </span>
        )}
        {entity?.is_junction_table && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-200 font-mono">junction</span>
        )}
      </div>

      <Collapsible open={columnsOpen && columns.length > 0}>
        <div className="border-t border-gray-100">
          <div className="hidden sm:grid grid-cols-12 text-[10px] font-semibold text-gray-400 bg-gray-50 px-4 py-2 uppercase tracking-wide">
            <div className="col-span-4">Source Column</div>
            <div className="col-span-5">Target Property</div>
            <div className="col-span-2 text-center">ID Key</div>
            <div className="col-span-1 text-center">Skip</div>
          </div>
          {columns.map((col, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 sm:grid-cols-12 items-center px-4 py-2.5 gap-2 border-t border-gray-50 ${col.skip ? 'opacity-40' : ''}`}
            >
              <div className="sm:col-span-4">
                <span className="font-mono text-gray-500 text-[11px]">{col.source_column}</span>
              </div>
              <div className="sm:col-span-5">
                <input
                  value={col.target_property}
                  onChange={(e) => updateColumn(i, { target_property: e.target.value })}
                  disabled={col.skip}
                  className="w-full text-[11px] font-mono border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-blue-400 bg-white disabled:bg-gray-50 transition-colors"
                />
              </div>
              <div className="sm:col-span-2 flex sm:justify-center">
                <Toggle checked={!!col.is_identity} onChange={(v) => updateColumn(i, { is_identity: v })} disabled={col.skip} color="amber" />
              </div>
              <div className="sm:col-span-1 flex sm:justify-center">
                <Toggle checked={!!col.skip} onChange={(v) => updateColumn(i, { skip: v })} color="gray" />
              </div>
            </div>
          ))}
        </div>
      </Collapsible>

      <Collapsible open={sampleOpen && rows.length > 0}>
        <div className="border-t border-gray-100 overflow-x-auto" style={{ maxHeight: 260, overflowY: 'auto' }}>
          <table className="min-w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                {visibleCols.map((col) => (
                  <th
                    key={col.source_column}
                    className="text-[10px] font-bold text-gray-500 py-2.5 px-3 whitespace-nowrap border-b border-gray-100"
                    style={{ minWidth: 80 }}
                  >
                    {col.target_property || col.source_column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50/60 border-b border-gray-50">
                  {visibleCols.map((col) => (
                    <td
                      key={col.source_column}
                      className="text-[11px] text-gray-600 py-2 px-3 whitespace-nowrap"
                      style={{ maxWidth: 180 }}
                    >
                      <span className="block truncate">{renderCell(row?.[col.source_column])}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-gray-300 px-4 py-2.5 bg-gray-50 border-t border-gray-100">
            Showing {Math.min(rows.length, 20)} of {rows.length} sample rows
          </p>
        </div>
      </Collapsible>
    </div>
  );
}

/* ─── Relationship Card ──────────────────────────────────────────── */

function RelationshipCard({ rel, idx, sourceTables, entities, entityColors, relErrors, onUpdate, onDelete }) {
  const rErr = relErrors[idx];
  const fromColor = entityColors[rel.from_table] || '#9ca3af';
  const toColor = entityColors[rel.to_table] || '#9ca3af';
  const isSelfRel = Boolean(rel.from_table && rel.to_table && rel.from_table === rel.to_table);

  const labelMap = Object.fromEntries(
    asArray(entities).map((e) => [String(e.source_table), String(e.node_label || e.source_table)])
  );

  const NodePill = ({ value, onChangeValue, bg }) => (
    <div
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: bg }}
    >
      <span className="w-4 h-4 bg-white/25 rounded text-[9px] flex items-center justify-center shrink-0">N</span>
      <select
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        className="bg-transparent text-white text-xs font-bold border-0 outline-none cursor-pointer pr-1 max-w-[140px] truncate appearance-none"
        style={{ WebkitAppearance: 'none' }}
      >
        {sourceTables.map((t) => (
          <option key={t} value={t} className="text-gray-800">{labelMap[t] || t}</option>
        ))}
      </select>
      <ChevronDown size={12} className="text-white/70 -ml-1" />
    </div>
  );

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
      rErr ? 'border-red-200' : isSelfRel ? 'border-amber-200' : 'border-gray-200/80'
    }`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-4 py-4">
        <NodePill value={rel.from_table} onChangeValue={(v) => onUpdate({ ...rel, from_table: v })} bg={fromColor} />

        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <div className="hidden sm:flex items-center w-full">
            <div className="flex-1 border-t border-dashed border-gray-300" />
            <ArrowRightCircle size={18} className={`mx-1.5 ${rErr ? 'text-red-400' : isSelfRel ? 'text-amber-400' : 'text-gray-400'}`} />
            <div className="flex-1 border-t border-dashed border-gray-300" />
          </div>
          <input
            value={rel.rel_type}
            onChange={(e) => onUpdate({ ...rel, rel_type: String(e.target.value).toUpperCase() })}
            className={`text-[11px] font-bold font-mono w-full text-center border px-2.5 py-1.5 rounded-lg outline-none transition-colors ${
              rErr ? 'border-red-300 text-red-600 bg-red-50'
                   : 'border-gray-200 text-gray-600 bg-gray-50 focus:border-blue-400 focus:bg-white'
            }`}
            placeholder="REL_TYPE"
          />
          {isSelfRel && !rErr && <p className="text-[10px] text-amber-500 leading-none">⚠ Self-relationship</p>}
          {rErr && <p className="text-[10px] text-red-500 leading-none">{rErr}</p>}
        </div>

        <NodePill value={rel.to_table} onChangeValue={(v) => onUpdate({ ...rel, to_table: v })} bg={toColor} />

        <IconBtn title="Remove relationship" onClick={onDelete}>
          <Trash2 size={14} className="text-gray-300 hover:text-red-500" />
        </IconBtn>
      </div>

      <div className="px-4 py-2.5 bg-slate-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
        <span className="text-gray-400 text-[10px] font-semibold shrink-0">Join Keys:</span>
        <div className="flex items-center gap-2">
          <input
            value={rel.from_column}
            onChange={(e) => onUpdate({ ...rel, from_column: e.target.value })}
            placeholder="from_col"
            className="text-[11px] font-mono border border-gray-200 rounded-lg px-2.5 py-1 outline-none w-28 focus:border-blue-400 bg-white transition-colors"
          />
          <ArrowRight size={12} className="text-gray-300 shrink-0" />
          <input
            value={rel.to_column}
            onChange={(e) => onUpdate({ ...rel, to_column: e.target.value })}
            placeholder="to_col"
            className="text-[11px] font-mono border border-gray-200 rounded-lg px-2.5 py-1 outline-none w-28 focus:border-blue-400 bg-white transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Schema Review ──────────────────────────────────────── */

function Step2Schema({ session, onBack, onNext, onSessionExpired }) {
  const normalizedProposal = normalizeProposal(session?.proposal);
  const [mapping, setMapping] = useState({
    entities: enrichEntities(normalizedProposal.entities),
    relationships: normalizedProposal.relationships,
  });
  const [warnings, setWarnings] = useState([]);
  const [errors, setErrors] = useState([]);
  const [submitErr, setSubmitErr] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  const sourceTables = asArray(mapping.entities).map((e) => String(e?.source_table || '')).filter(Boolean);
  const entityColors = Object.fromEntries(asArray(mapping.entities).map((e) => [e.source_table, e._color]));

  const nodeErrs = asArray(mapping.entities).map((e) => {
    const lbl = String(e?.node_label || '').trim();
    return !lbl ? 'Empty label' : !LABEL_RE.test(lbl) ? 'Invalid format' : null;
  });
  const relErrs = asArray(mapping.relationships).map((r) => {
    const t = String(r?.rel_type || '').trim();
    if (!t) return 'Relationship type is required';
    if (!LABEL_RE.test(t)) return 'Must start with a letter; letters, digits, underscores only';
    if (!r.from_table || !r.to_table) return 'Both FROM and TO nodes must be selected';
    return null;
  });
  const hasLocalErrors = nodeErrs.some(Boolean) || relErrs.some(Boolean) || asArray(mapping.entities).length === 0;

  const resetPreview = () => { setPreview(null); setErrors([]); setWarnings([]); setSubmitErr(null); };

  const updateEntity = (idx, updated) => { const e = [...mapping.entities]; e[idx] = updated; setMapping((p) => ({ ...p, entities: e })); resetPreview(); };
  const updateRelationship = (idx, updated) => { const r = [...mapping.relationships]; r[idx] = updated; setMapping((p) => ({ ...p, relationships: r })); resetPreview(); };
  const deleteEntity = (idx) => {
    const tbl = mapping.entities[idx].source_table;
    setMapping((p) => ({
      entities: p.entities.filter((_, i) => i !== idx),
      relationships: p.relationships.filter((r) => r.from_table !== tbl && r.to_table !== tbl),
    }));
    resetPreview();
  };
  const deleteRelationship = (idx) => { setMapping((p) => ({ ...p, relationships: p.relationships.filter((_, i) => i !== idx) })); resetPreview(); };

  const addRelationship = () => {
    const from = sourceTables[0] || '';
    const to = sourceTables.length > 1 ? sourceTables[1] : (sourceTables[0] || '');
    setMapping((p) => ({
      ...p,
      relationships: [...p.relationships, { rel_type: 'RELATED_TO', from_table: from, to_table: to, from_column: '', to_column: '' }],
    }));
    resetPreview();
  };

  const handleValidateAndPreview = async () => {
    if (hasLocalErrors) return;
    setBusy(true); resetPreview();
    try {
      const body = {
        entities: mapping.entities.map(({ _color, properties: _p, ...rest }) => ({
          table_name: rest.source_table,
          node_label: rest.node_label,
          id_column: rest.id_column,
          columns: rest.columns,
        })),
        relationships: mapping.relationships,
      };
      const mapRes = await fetch(`${BASE}/upload/${session.uploadId}/mapping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHdr() },
        body: JSON.stringify(body),
      });
      if (mapRes.status === 404) { onSessionExpired(); return; }
      if (!mapRes.ok) {
        const e = await readErr(mapRes);
        setErrors(e.errors?.length ? e.errors : [e.error || 'Mapping rejected by server']);
        return;
      }
      const mapData = await mapRes.json();
      setWarnings(asArray(mapData?.warnings));

      const preRes = await fetch(`${BASE}/upload/${session.uploadId}/preview`, { method: 'POST', headers: authHdr() });
      if (preRes.status === 404) { onSessionExpired(); return; }
      if (!preRes.ok) {
        const e = await readErr(preRes);
        setSubmitErr(e.error || 'Preview request failed');
        return;
      }
      const previewData = await preRes.json();
      setPreview({
        valid: Boolean(previewData?.valid),
        total_node_counts: asObject(previewData?.total_node_counts),
        total_relationship_count: Number(previewData?.total_relationship_count || 0),
        issues: asArray(previewData?.issues),
      });
    } catch {
      setSubmitErr('Network error — could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  const previewErrs = asArray(preview?.issues).filter((i) => i?.level === 'error');
  const previewWarns = asArray(preview?.issues).filter((i) => i?.level === 'warning');
  const canProceed = Boolean(preview?.valid) && !errors.length && !previewErrs.length;
  const sampleData = normalizeSampleData(session?.sampleData);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="font-bold text-gray-800 text-lg sm:text-xl mb-0.5">Schema Review</h2>
          <p className="text-sm text-gray-400">Rename labels, adjust column mapping, then validate before ingestion.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-indigo-100">
            <Layers size={12} /> {mapping.entities.length} Nodes
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-100">
            <GitBranch size={12} /> {asArray(mapping.relationships).length} Rels
          </span>
        </div>
      </div>

      <ErrorBox messages={errors} />
      <WarnBox messages={warnings} onDismiss={() => setWarnings([])} />

      {preview && (
        <div className={`mb-6 p-4 rounded-xl border ${preview.valid ? 'bg-emerald-50/80 border-emerald-200' : 'bg-red-50/80 border-red-200'}`}>
          <p className={`font-bold mb-2.5 text-sm ${preview.valid ? 'text-emerald-700' : 'text-red-700'}`}>
            {preview.valid ? '✓ Dry-run passed — ready to commit' : '✕ Dry-run failed'}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(preview.total_node_counts || {}).map(([label, count]) => (
              <span key={label} className="text-xs font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-sm">
                {label}: <strong>{Number(count).toLocaleString()}</strong>
              </span>
            ))}
            <span className="text-xs font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-sm">
              Rels: <strong>{(preview.total_relationship_count ?? 0).toLocaleString()}</strong>
            </span>
          </div>
          {previewErrs.map((iss, i) => <p key={i} className="text-xs text-red-600 leading-relaxed">✕ {iss.message}</p>)}
          {previewWarns.map((iss, i) => <p key={i} className="text-xs text-amber-600 leading-relaxed">⚠ {iss.message}</p>)}
        </div>
      )}

      {submitErr && <div className="mb-5"><InfoRow icon={AlertCircle}>{submitErr}</InfoRow></div>}

      {/* Node Labels */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shadow-sm">
            <Layers size={12} className="text-white" />
          </div>
          <h3 className="font-bold text-gray-700 text-base">Node Labels</h3>
          <SectionBadge count={mapping.entities.length} color="indigo" />
        </div>
        {mapping.entities.length === 0 && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-sm text-red-600 font-medium">At least one node type is required.</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {asArray(mapping.entities).map((entity, idx) => (
            <NodeCard
              key={idx}
              entity={entity}
              sampleData={sampleData}
              onChange={(updated) => updateEntity(idx, updated)}
              onDelete={() => deleteEntity(idx)}
            />
          ))}
        </div>
      </div>

      {/* Relationships */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center shadow-sm">
              <GitBranch size={12} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-700 text-base">Relationships</h3>
            <SectionBadge count={asArray(mapping.relationships).length} color="green" />
          </div>
          <Button
            variant="accent" size="sm"
            onClick={addRelationship}
            disabled={sourceTables.length < 1}
            leftIcon={<Plus size={13} />}
            title={sourceTables.length < 1 ? 'Add at least one node first' : 'Add relationship'}
          >
            Add
          </Button>
        </div>

        {asArray(mapping.relationships).length === 0 ? (
          <div
            className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200"
            onClick={() => sourceTables.length > 0 && addRelationship()}
          >
            <GitBranch size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-1">No relationships detected.</p>
            {sourceTables.length > 0 && <p className="text-xs text-emerald-500 font-semibold">+ Click to add</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {asArray(mapping.relationships).map((rel, idx) => (
              <RelationshipCard
                key={idx}
                rel={rel} idx={idx}
                sourceTables={sourceTables}
                entities={mapping.entities}
                entityColors={entityColors}
                relErrors={relErrs}
                onUpdate={(updated) => updateRelationship(idx, updated)}
                onDelete={() => deleteRelationship(idx)}
              />
            ))}
            <div
              className="flex items-center justify-center gap-2 p-3.5 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200 text-gray-400 hover:text-emerald-600"
              onClick={() => sourceTables.length > 0 && addRelationship()}
            >
              <Plus size={14} />
              <span className="text-xs font-semibold">Add another relationship</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-100 pt-5 gap-3">
        <Button variant="outline" leftIcon={<ArrowLeft size={15} />} onClick={onBack} disabled={busy}>Back</Button>
        <div className="flex flex-wrap gap-2.5 items-center">
          <Button
            variant="info"
            onClick={handleValidateAndPreview}
            disabled={hasLocalErrors || busy}
            loading={busy}
            leftIcon={!busy && <Eye size={14} />}
          >
            {busy ? 'Validating…' : preview ? 'Re-validate' : 'Validate & Preview'}
          </Button>
          {canProceed && (
            <Button onClick={onNext} rightIcon={<ArrowRight size={15} />}>Confirm Schema</Button>
          )}
          {preview && !canProceed && !busy && (
            <div className="flex items-center gap-1.5">
              <AlertCircle size={13} className="text-red-500" />
              <span className="text-xs text-red-500 font-medium">Fix errors to continue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Confirm & Ingest ───────────────────────────────────── */

const LOG_CLS = { ok: 'text-emerald-400', err: 'text-red-400', info: 'text-blue-300' };

function Step3Confirm({ session, onBack, onSessionExpired, onReset, onIngestComplete }) {
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
            className={`bg-gray-950 px-4 py-4 max-h-52 overflow-y-auto ${ingesting ? 'rounded-b-xl' : 'rounded-xl'}`}
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

/* ─── Graph Listing ──────────────────────────────────────────────── */

function GraphListing({ refreshTrigger }) {
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
                <p className="font-bold text-emerald-600 text-sm">{Number(g?.relationship_count || 0).toLocaleString()}</p>
              </div>
              <div className="lg:col-span-2 mb-2 lg:mb-0">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-gray-300" />
                  <span className="text-[11px] text-gray-400">
                    {g?.created_at
                      ? new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '--'}
                  </span>
                </div>
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

/* ─── Page Root ──────────────────────────────────────────────────── */

export default function KnowledgeGraphPage() {
  const dispatch = useDispatch();
  const { step, uploadSession, sessionExpired } = useSelector((s) => s.knowledgeGraph);
  const [listingKey, setListingKey] = useState(0);

  useEffect(() => {
    const id = sessionStorage.getItem('cmdb_upload_id');
    if (!id) return;
    fetch(`${BASE}/upload/${id}`, { headers: authHdr() })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) { sessionStorage.removeItem('cmdb_upload_id'); return; }
        const proposal = normalizeProposal(data?.proposal);
        if (proposal.entities.length > 0 || proposal.relationships.length > 0) {
          dispatch(setUploadSession({ uploadId: id, proposal, sampleData: normalizeSampleData(data?.sample_data) }));
          dispatch(setStep(2));
        } else {
          sessionStorage.removeItem('cmdb_upload_id');
        }
      })
      .catch(() => sessionStorage.removeItem('cmdb_upload_id'));
  }, [dispatch]);

  const handleUploadDone = (data) => {
    const proposal = normalizeProposal(data?.proposal);
    dispatch(setUploadSession({ uploadId: data?.upload_id, proposal, sampleData: normalizeSampleData(data?.sample_data) }));
    dispatch(setStep(2));
  };

  const handleSessionExpired = () => {
    sessionStorage.removeItem('cmdb_upload_id');
    dispatch(setSessionExpired());
  };

  const cancelSession = () => {
    if (uploadSession?.uploadId) {
      fetch(`${BASE}/upload/${uploadSession.uploadId}`, { method: 'DELETE', headers: authHdr() }).catch(() => {});
    }
    sessionStorage.removeItem('cmdb_upload_id');
    dispatch(clearSession());
  };

  const handleReset = () => {
    if (uploadSession?.uploadId) {
      fetch(`${BASE}/upload/${uploadSession.uploadId}`, { method: 'DELETE', headers: authHdr() }).catch(() => {});
    }
    sessionStorage.removeItem('cmdb_upload_id');
    dispatch(resetWizard());
    setListingKey((k) => k + 1);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 bg-gradient-to-b from-slate-50 to-gray-50 min-h-screen">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4  mx-auto">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
            <Database size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-tight text-xl sm:text-2xl">Knowledge Graph</h1>
            <p className="text-sm text-gray-400">Upload structured data and model it as a Neo4j knowledge graph</p>
          </div>
        </div>
        <HealthBadge />
      </div>

      <div className="mx-auto">
        <ConnectionManager />

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-8 lg:p-10">
          <StepIndicator current={step} />

          {step === 1 && (
            <Step1Upload onSuccess={handleUploadDone} sessionExpiredMsg={sessionExpired} />
          )}
          {step === 2 && uploadSession && (
            <Step2Schema
              session={uploadSession}
              onBack={cancelSession}
              onNext={() => dispatch(setStep(3))}
              onSessionExpired={handleSessionExpired}
            />
          )}
          {step === 3 && uploadSession && (
            <Step3Confirm
              session={uploadSession}
              onBack={() => dispatch(setStep(2))}
              onSessionExpired={handleSessionExpired}
              onReset={handleReset}
              onIngestComplete={() => setListingKey((k) => k + 1)}
            />
          )}
        </div>

        <GraphListing refreshTrigger={listingKey} />
      </div>
    </div>
  );
}
