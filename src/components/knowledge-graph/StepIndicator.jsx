'use client';

import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Upload', hint: 'Source file' },
  { id: 2, label: 'Schema', hint: 'Entities & relationships' },
  { id: 3, label: 'Ingest', hint: 'Write to graph' },
];

/**
 * Wizard progress.
 *
 * Reworked from centred circular badges with long connector rails into a
 * left-aligned numbered rail. Enterprise wizards read as a checklist, not a
 * journey graphic: each step carries a number, a label and a one-line hint of
 * what happens there, so a user landing mid-flow knows where they are and what
 * remains.
 */
export default function StepIndicator({ current }) {
  return (
    <ol className="flex flex-col sm:flex-row sm:items-stretch gap-px mb-7 rounded-md border border-slate-200 overflow-hidden bg-slate-200">
      {STEPS.map((step) => {
        const done = current > step.id;
        const active = current === step.id;

        return (
          <li
            key={step.id}
            aria-current={active ? 'step' : undefined}
            className={`flex-1 flex items-center gap-3 px-4 py-3 transition-colors ${
              active ? 'bg-white' : 'bg-slate-50'
            }`}
          >
            {/* Marker: filled when complete, outlined when active, flat when pending */}
            <span
              className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-semibold border transition-colors ${
                done
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : active
                  ? 'bg-white border-indigo-500 text-indigo-600'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}
            >
              {done ? <Check size={13} strokeWidth={3} /> : step.id}
            </span>

            <span className="min-w-0">
              <span
                className={`block text-[12.5px] font-semibold leading-tight ${
                  done || active ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <span
                className={`block text-[10.5px] leading-tight truncate ${
                  active ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {step.hint}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
