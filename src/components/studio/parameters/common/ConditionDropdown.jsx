import React from "react";
import { ChevronDown } from "lucide-react";

const ConditionDropdown = ({
  isOpen,
  selectedOperator,
  operators,
  onToggle,
  onSelect,
  className = ""
}) => {
  return (
    <div className={`relative min-w-[190px] ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white hover:border-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-left"
      >
        <span className={`text-[12px] font-medium truncate ${selectedOperator ? "text-slate-800" : "text-slate-400"}`}>
          {selectedOperator?.label || "Select operator"}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
          ></div>
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-56 overflow-y-auto py-1">
            {operators.map((op) => (
              <button
                key={op.value}
                type="button"
                onClick={() => onSelect(op.value)}
                className={`w-full text-left px-3 py-2 text-[12px] transition-colors duration-150 ${
                  selectedOperator?.value === op.value
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ConditionDropdown;
