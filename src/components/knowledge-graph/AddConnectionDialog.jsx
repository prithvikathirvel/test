'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Server, X, Zap, AlertCircle } from 'lucide-react';
import { addConnection } from '@/redux/slices/knowledgeGraphSlice';
import { Modal, Button, InfoRow, inputCls } from './ui';

export default function AddConnectionDialog({ open, onClose }) {
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
