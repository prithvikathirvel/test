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
    <div className={`relative min-w-[200px] ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className="text-sm text-gray-700 font-medium">
          {selectedOperator?.label || "Select Operator"}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={onToggle}
          ></div>
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
            {operators.map((op) => (
              <button
                key={op.value}
                type="button"
                onClick={() => onSelect(op.value)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                  selectedOperator?.value === op.value 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700'
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
