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
    <div className={`space-y-3 ${className}`}>
      {/* Parameter Header */}
      <ParameterHeader
        title={title}
        description={description}
        type="condition"
      />

      {/* Conditions Container */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 shadow-2xs">
        {!hasConditions ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-3">
              <GitBranch size={22} className="text-slate-400" />
            </div>
            <p className="text-slate-600 text-[12.5px] mb-1.5 font-semibold">
              {emptyStateMessage}
            </p>
            <p className="text-slate-400 text-[11.5px]">
              {emptyStateDescription}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {children}
          </div>
        )}

        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={onAddCondition}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus size={14} />
            {addButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionContainer;
