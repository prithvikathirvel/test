'use client';

import { ArrowRight, ArrowRightCircle, Trash2, ChevronDown } from 'lucide-react';
import { asArray } from './helpers';
import { IconBtn } from './ui';

export default function RelationshipCard({ rel, idx, sourceTables, entities, entityColors, relErrors, onUpdate, onDelete }) {
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
