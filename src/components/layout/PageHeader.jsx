"use client";

/**
 * Shared workspace page header.
 * Matches the Knowledge Graph header: icon tile, 16px title, 12.5px
 * slate description, hairline divider, optional right-side actions.
 */
export default function PageHeader({ icon: Icon, title, description, actions }) {
  return (
    <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
      <div className="flex items-start gap-3 min-w-0">
        {Icon ? (
          <div className="h-9 w-9 rounded-md border border-slate-200 bg-white flex items-center justify-center shrink-0">
            <Icon size={17} className="text-slate-500" />
          </div>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-[16px] font-semibold text-slate-800 leading-tight">{title}</h1>
          {description ? (
            <p className="text-[12.5px] text-slate-500 mt-0.5">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
