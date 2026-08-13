import React from "react";
import { Trash2 } from "lucide-react";
import ConditionDropdown from "./ConditionDropdown";

const ConditionItem = ({
  condition,
  index,
  operators,
  isDropdownOpen,
  onToggleDropdown,
  onSelectOperator,
  onUpdateCondition,
  onRemoveCondition,
  className = ""
}) => {
  const selectedOperator = operators.find(op => op.value === condition.operator);

  return (
    <div className={`group relative ${className}`}>
      <div className="flex items-center gap-3 p-3 bg-white border border-slate-200/80 rounded-lg shadow-2xs hover:border-slate-300 transition-all duration-200">
        {/* Condition Label */}
        <div className="flex items-center gap-2 min-w-fit">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold font-mono">
            {index + 1}
          </span>
          <span className="text-[12px] font-semibold text-slate-700">
            Condition
          </span>
        </div>

        {/* Operator Dropdown */}
        <ConditionDropdown
          isOpen={isDropdownOpen}
          selectedOperator={selectedOperator}
          operators={operators}
          onToggle={onToggleDropdown}
          onSelect={onSelectOperator}
        />

        {/* Comparison Value Input */}
        {condition.operator !== 'is_empty' && condition.operator !== 'is_not_empty' && (
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={condition.comparisonValue}
              onChange={(e) => onUpdateCondition('comparisonValue', e.target.value)}
              placeholder="Enter comparison value"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 hover:border-slate-300 transition-all duration-200 text-[12px]"
            />
          </div>
        )}

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemoveCondition}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200 group-hover:opacity-100 opacity-60"
          aria-label="Remove condition"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default ConditionItem;
