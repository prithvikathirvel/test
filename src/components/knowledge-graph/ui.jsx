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

export function IconBtn({ title, onClick, children, className = '' }) {
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

export function Toggle({ checked, onChange, disabled, color = 'blue' }) {
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

export function ProgressBar({ color = '#2563eb', bg = '#bfdbfe' }) {
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

export function SectionBadge({ count, color = 'indigo' }) {
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

export function ErrorBox({ messages }) {
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

export function WarnBox({ messages, onDismiss }) {
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

export function InfoRow({ icon: Icon, color = 'text-red-500', children }) {
  return (
    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5">
      <Icon size={14} className={`${color} shrink-0`} />
      <span className="text-xs text-red-600">{children}</span>
    </div>
  );
}

export const inputCls =
  'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white';
