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

  // A relationship row previously rendered its two endpoints as solid,
  // fully-saturated pills — two blocks of colour per row, dozens per schema.
  // They are now neutral chips carrying a small accent dot, so the row reads as
  // "A -[REL]-> B" instead of a colour swatch pair.
  const NodePill = ({ value, onChangeValue, accent }) => (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-300 bg-white shrink-0 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-colors">
      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
      <select
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        className="bg-transparent text-slate-800 text-[12px] font-semibold border-0 outline-hidden cursor-pointer pr-1 max-w-[140px] truncate appearance-none"
        style={{ WebkitAppearance: 'none' }}
      >
        {sourceTables.map((t) => (
          <option key={t} value={t} className="text-slate-800">{labelMap[t] || t}</option>
        ))}
      </select>
      <ChevronDown size={12} className="text-slate-400 -ml-1 shrink-0" />
    </div>
  );

  return (
    <div className={`bg-white border rounded-md overflow-hidden transition-colors ${
      rErr ? 'border-red-300' : isSelfRel ? 'border-amber-300' : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-3.5 py-3">
        <NodePill value={rel.from_table} onChangeValue={(v) => onUpdate({ ...rel, from_table: v })} accent={fromColor} />

        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <div className="hidden sm:flex items-center w-full">
            <div className="flex-1 border-t border-dashed border-slate-300" />
            <ArrowRightCircle size={16} className={`mx-1.5 ${rErr ? 'text-red-500' : isSelfRel ? 'text-amber-600' : 'text-slate-400'}`} />
            <div className="flex-1 border-t border-dashed border-slate-300" />
          </div>
          <input
            value={rel.rel_type}
            onChange={(e) => onUpdate({ ...rel, rel_type: String(e.target.value).toUpperCase() })}
            className={`text-[11px] font-semibold font-mono w-full text-center border px-2.5 py-1.5 rounded-md outline-hidden transition-colors ${
              rErr ? 'border-red-300 text-red-600 bg-red-50'
                   : 'border-slate-300 text-slate-700 bg-slate-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white'
            }`}
            placeholder="REL_TYPE"
          />
          {isSelfRel && !rErr && <p className="text-[10px] text-amber-700 leading-none">Self-relationship</p>}
          {rErr && <p className="text-[10px] text-red-600 leading-none">{rErr}</p>}
        </div>

        <NodePill value={rel.to_table} onChangeValue={(v) => onUpdate({ ...rel, to_table: v })} accent={toColor} />

        <IconBtn title="Remove relationship" onClick={onDelete} className="hover:!text-red-600 hover:!bg-red-50">
          <Trash2 size={14} />
        </IconBtn>
      </div>

      <div className="px-3.5 py-2 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
        <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider shrink-0">Join keys</span>
        <div className="flex items-center gap-2">
          <input
            value={rel.from_column}
            onChange={(e) => onUpdate({ ...rel, from_column: e.target.value })}
            placeholder="from_col"
            className="text-[11px] font-mono border border-slate-300 rounded px-2 py-1 outline-hidden w-28 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white transition-colors"
          />
          <ArrowRight size={12} className="text-slate-400 shrink-0" />
          <input
            value={rel.to_column}
            onChange={(e) => onUpdate({ ...rel, to_column: e.target.value })}
            placeholder="to_col"
            className="text-[11px] font-mono border border-slate-300 rounded px-2 py-1 outline-hidden w-28 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
