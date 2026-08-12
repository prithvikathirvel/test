'use client';

import { useState } from 'react';
import { Eye, EyeOff, Trash2, Table2, KeyRound } from 'lucide-react';
import { LABEL_RE, asArray, renderCell } from './helpers';
import { IconBtn, Toggle, Collapsible } from './ui';

export default function NodeCard({ entity, sampleData, onChange, onDelete }) {
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
    <div
      className={`rounded-md border bg-white transition-colors ${
        valid ? 'border-slate-200 hover:border-slate-300' : 'border-red-300'
      }`}
      // The entity accent is the card's left border, so it stays flush with the
      // rounded corners instead of being a separate coloured slab.
      style={{ borderLeftWidth: 3, borderLeftColor: valid ? color : '#ef4444' }}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Neutral marker with a small accent dot: identifies the entity without
            a saturated colour block. */}
        <div className="w-7 h-7 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        </div>

        <div className="flex-1 min-w-0">
          <input
            value={nodeLabel}
            onChange={(e) => onChange({ ...entity, node_label: e.target.value })}
            className={`w-full text-[13px] font-semibold bg-transparent border-b pb-0.5 outline-hidden transition-colors ${
              valid
                ? 'border-transparent text-slate-800 hover:border-slate-200 focus:border-indigo-400'
                : 'border-red-300 text-red-600'
            }`}
            placeholder="NodeLabel"
            aria-label="Node label"
          />
          <p className={`leading-4 text-[10.5px] mt-0.5 ${!valid ? 'text-red-500' : 'text-slate-400'}`}>
            {!valid
              ? 'Must start with a letter; letters, digits, underscores only'
              : <><span className="font-mono">{sourceTable || '--'}</span> · id <span className="font-mono">{idColumn}</span> · {columns.length} cols</>}
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {columns.length > 0 && (
            <IconBtn title="Column mapping" onClick={() => setColumnsOpen((v) => !v)}>
              <Table2 size={15} className={columnsOpen ? 'text-indigo-600' : ''} />
            </IconBtn>
          )}
          {rows.length > 0 && (
            <IconBtn title={sampleOpen ? 'Hide sample data' : 'View sample data'} onClick={() => setSampleOpen((v) => !v)}>
              {sampleOpen ? <EyeOff size={15} className="text-indigo-600" /> : <Eye size={15} />}
            </IconBtn>
          )}
          <IconBtn title="Remove node" onClick={onDelete} className="hover:!text-red-600 hover:!bg-red-50">
            <Trash2 size={15} />
          </IconBtn>
        </div>
      </div>

      <div className="px-3.5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap gap-1.5">
        {visibleCols.slice(0, 8).map((col) => (
          <span
            key={col.source_column}
            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono border ${
              col.source_column === idColumn
                ? 'bg-white text-slate-700 border-slate-300 font-semibold'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            {col.source_column === idColumn && <KeyRound size={9} className="text-amber-600" />}
            {col.target_property || col.source_column}
          </span>
        ))}
        {visibleCols.length > 8 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-400 border border-slate-200 font-mono">
            +{visibleCols.length - 8} more
          </span>
        )}
        {entity?.is_junction_table && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300 font-mono">junction</span>
        )}
      </div>

      <Collapsible open={columnsOpen && columns.length > 0}>
        <div className="border-t border-slate-100">
          <div className="hidden sm:grid grid-cols-12 text-[10px] font-semibold text-slate-500 bg-slate-50 px-3.5 py-2 uppercase tracking-wider">
            <div className="col-span-4">Source Column</div>
            <div className="col-span-5">Target Property</div>
            <div className="col-span-2 text-center">ID Key</div>
            <div className="col-span-1 text-center">Skip</div>
          </div>
          {columns.map((col, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 sm:grid-cols-12 items-center px-3.5 py-2 gap-2 border-t border-slate-100 ${col.skip ? 'opacity-40' : ''}`}
            >
              <div className="sm:col-span-4">
                <span className="font-mono text-slate-500 text-[11px]">{col.source_column}</span>
              </div>
              <div className="sm:col-span-5">
                <input
                  value={col.target_property}
                  onChange={(e) => updateColumn(i, { target_property: e.target.value })}
                  disabled={col.skip}
                  className="w-full text-[11px] font-mono border border-slate-300 rounded px-2 py-1 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white disabled:bg-slate-50 transition-colors"
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
        <div className="border-t border-slate-100 overflow-x-auto" style={{ maxHeight: 260, overflowY: 'auto' }}>
          <table className="min-w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                {visibleCols.map((col) => (
                  <th
                    key={col.source_column}
                    className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 py-2 px-3 whitespace-nowrap border-b border-slate-200 text-left"
                    style={{ minWidth: 80 }}
                  >
                    {col.target_property || col.source_column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 20).map((row, ri) => (
                <tr key={ri} className="hover:bg-slate-50/70 border-b border-slate-100">
                  {visibleCols.map((col) => (
                    <td
                      key={col.source_column}
                      className="text-[11px] text-slate-600 py-1.5 px-3 whitespace-nowrap"
                      style={{ maxWidth: 180 }}
                    >
                      <span className="block truncate">{renderCell(row?.[col.source_column])}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10.5px] text-slate-400 px-3.5 py-2 bg-slate-50 border-t border-slate-100">
            Showing {Math.min(rows.length, 20)} of {rows.length} sample rows
          </p>
        </div>
      </Collapsible>
    </div>
  );
}
