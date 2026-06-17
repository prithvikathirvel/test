'use client';

import { CloudUpload, Layers, Database, Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Upload', icon: CloudUpload },
  { id: 2, label: 'Schema', icon: Layers },
  { id: 3, label: 'Ingest', icon: Database },
];

export default function StepIndicator({ current }) {
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
