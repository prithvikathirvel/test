'use client';

import { Loader2, AlertCircle, Info, X } from 'lucide-react';

/* ─── Primitive UI (Tailwind-only) ───────────────────────────────── */

export function Spinner({ size = 14, className = '' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

export function Button({
  variant = 'primary', size = 'md', leftIcon, rightIcon, disabled, loading,
  className = '', children, type = 'button', ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-md border transition-colors duration-150 select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'text-[12px] px-2.5 py-1.5',
    md: 'text-[13px] px-3.5 py-2',
    lg: 'text-[13px] px-4 py-2.5',
  };
  // Flat, single-weight fills. The gradient + coloured shadow treatment read as
  // consumer UI; enterprise tables need one obvious primary and quiet rest.
  const variants = {
    primary:
      'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-500/40',
    outline:
      'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-slate-400/40',
    ghost:
      'bg-transparent border-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400/40',
    accent:
      'bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500/30',
    info:
      'bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-50 focus-visible:ring-indigo-500/30',
    danger:
      'bg-red-600 border-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40',
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

export function IconBtn({ title, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:bg-slate-200 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${className}`}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, disabled, color = 'blue' }) {
  const colors = {
    blue: 'bg-indigo-600',
    amber: 'bg-amber-600',
    gray: 'bg-slate-500',
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500/40 disabled:opacity-50 ${
        checked ? colors[color] : 'bg-slate-200'
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

export function ProgressBar({ color = '#4f46e5', bg = '#e2e8f0' }) {
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

export function Collapsible({ open, children }) {
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

export function Modal({ open, onClose, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 animate-[fadein_.18s_ease]"
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden animate-[pop_.2s_ease]`}>
        {children}
      </div>
      <style jsx>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pop   { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

export function SectionBadge({ count, color = 'indigo' }) {
  // Counts are metadata, not status: one neutral treatment for all of them
  // keeps section headers from turning into a colour key.
  const cls = {
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  }[color] || 'bg-slate-100 text-slate-600 ring-slate-200';
  return (
    <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] text-[11px] font-semibold rounded-md ring-1 px-1.5 ${cls}`}>
      {count}
    </span>
  );
}

export function ErrorBox({ messages }) {
  if (!messages?.length) return null;
  return (
    <div className="p-3.5 bg-red-50 border border-red-200 rounded-md mb-5">
      <div className="flex items-center gap-2.5 mb-2">
        <AlertCircle size={15} className="text-red-500 shrink-0" />
        <span className="font-semibold text-red-700 text-[13px]">
          {messages.length > 1 ? `${messages.length} Errors` : 'Error'}
        </span>
      </div>
      {messages.map((m, i) => (
        <p key={i} className="text-xs text-red-600 leading-relaxed pl-6">• {m}</p>
      ))}
    </div>
  );
}

export function WarnBox({ messages, onDismiss }) {
  if (!messages?.length) return null;
  return (
    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <Info size={15} className="text-amber-500 shrink-0" />
          <span className="font-semibold text-amber-700 text-[13px]">
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

export function InfoRow({ icon: Icon, color = 'text-red-500', children }) {
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2.5">
      <Icon size={14} className={`${color} shrink-0`} />
      <span className="text-xs text-red-600">{children}</span>
    </div>
  );
}

export const inputCls =
  'w-full border border-slate-300 rounded-md px-3 py-2 text-[13px] outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors bg-white placeholder:text-slate-400';
