'use client';

import { useState } from 'react';
import { Eye, EyeOff, Trash2, Table2 } from 'lucide-react';
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
