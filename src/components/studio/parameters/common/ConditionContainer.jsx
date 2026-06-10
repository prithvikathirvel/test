import React from "react";
import { Plus, GitBranch } from "lucide-react";
import ParameterHeader from "./ParameterHeader";

const ConditionContainer = ({ 
  title,
  description,
  icon,
  children,
  onAddCondition,
  hasConditions = false,
  emptyStateMessage = "No conditions defined",
  emptyStateDescription = "Add conditions to get started",
  addButtonText = "Add Condition",
  className = ""
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Parameter Header */}

      <ParameterHeader
        className="font-semibold"
        title={title}
        description={description}
      />
      {/* Conditions Container */}
      <div className="border-1 border-gray-300 rounded-xl p-4 bg-gray-50/50">
        {!hasConditions ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <GitBranch size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm mb-2 font-medium">
              {emptyStateMessage}
            </p>
            <p className="text-gray-400 text-xs">
              {emptyStateDescription}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {children}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={onAddCondition}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={16} />
            {addButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionContainer;
