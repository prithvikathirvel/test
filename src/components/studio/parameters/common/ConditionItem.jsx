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
      <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300">
        {/* Condition Label */}
        <div className="flex items-center gap-2 min-w-fit">
          <span className="text-sm font-medium text-gray-700">
            Condition {index + 1} 
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
          <div className="flex-1">
            <input
              type="text"
              value={condition.comparisonValue}
              onChange={(e) => onUpdateCondition('comparisonValue', e.target.value)}
              placeholder="Enter comparison value"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all duration-200 text-sm"
            />
          </div>
        )}

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemoveCondition}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-70"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ConditionItem;
