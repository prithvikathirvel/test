import React, { useState, useEffect } from "react";
import { GitBranch } from "lucide-react";
import ConditionContainer from "./common/ConditionContainer";
import ConditionItem from "./common/ConditionItem";

const ConditionParameter = ({ param, color, onUpdate, parameters, parameter }) => {
  const [conditions, setConditions] = useState(param.value || []);
  const [openDropdowns, setOpenDropdowns] = useState({});

  useEffect(() => {
    setConditions(param.value || []);
  }, [param.value]);

  const operators = [
    { value: "equal_to", label: "Equal To" },
    { value: "not_equal_to", label: "Not Equal To" },
    { value: "greater_than", label: "Greater Than" },
    { value: "less_than", label: "Less Than" },
    { value: "greater_than_or_equal_to", label: "Greater Than or Equal To" },
    { value: "less_than_or_equal_to", label: "Less Than or Equal To" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Not Contains" },
    { value: "is_empty", label: "Is Empty" },
    { value: "is_not_empty", label: "Is Not Empty" },
    { value: "starts_with", label: "Starts With" },
    { value: "ends_with", label: "Ends With" }
  ];

  const updateParentValue = (updatedConditions) => {
    if (onUpdate && parameters) {
      const updatedParams = parameters.map((p) =>
        p.key === param.key ? { ...p, type: "condition", value: updatedConditions } : p
      );
      onUpdate(updatedParams, parameter, true);
    }
  };

  const handleAddCondition = () => {
    const newCondition = {
      operator: "equal_to",
      comparisonValue: "",
      nextNode: ""
    };
    const updatedConditions = [...conditions, newCondition];
    setConditions(updatedConditions);
    updateParentValue(updatedConditions);
  };

  const handleRemoveCondition = (index) => {
    const updatedConditions = conditions.filter((_, idx) => idx !== index);
    setConditions(updatedConditions);
    updateParentValue(updatedConditions);
  };

  const handleConditionUpdate = (index, field, value) => {
    const updatedConditions = conditions.map((condition, idx) => {
      if (idx !== index) return condition;
      return { ...condition, [field]: value };
    });
    setConditions(updatedConditions);
    updateParentValue(updatedConditions);
  };

  const toggleDropdown = (index) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const selectOperator = (index, operator) => {
    handleConditionUpdate(index, 'operator', operator);
    setOpenDropdowns(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const renderCondition = (condition, index) => {
    return (
      <ConditionItem
        key={index}
        condition={condition}
        index={index}
        operators={operators}
        isDropdownOpen={openDropdowns[index]}
        onToggleDropdown={() => toggleDropdown(index)}
        onSelectOperator={(operator) => selectOperator(index, operator)}
        onUpdateCondition={(field, value) => handleConditionUpdate(index, field, value)}
        onRemoveCondition={() => handleRemoveCondition(index)}
      />
    );
  };

  return (
    <ConditionContainer
      title={param.key}
      description={param.description}
      icon={<GitBranch size={18} className="text-blue-600" />}
      hasConditions={conditions.length > 0}
      onAddCondition={handleAddCondition}
      emptyStateMessage="No conditions defined"
      emptyStateDescription={param.description || "Add conditions to get started"}
      addButtonText="Add Condition"
    >
      {conditions.map((condition, index) => renderCondition(condition, index))}
    </ConditionContainer>
  );
};

export default ConditionParameter;