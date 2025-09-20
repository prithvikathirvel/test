"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Trash2, Plus, GitBranch } from "lucide-react";
import ParameterHeader from "./common/ParameterHeader";
import DashedBox from "@/components/Common/DashedBox";
import InputBox from "@/components/Common/InputBox";

const ConditionParameter = ({ param, color, onUpdate, parameters, parameter }) => {
  const [conditions, setConditions] = useState(param.value || []);

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
      nextNode: "" // Internal field, not visible in UI
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

  const renderCondition = (condition, index) => {
    return (
      <Box key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 mb-2">
        <Box className="flex items-center gap-2 flex-1">
          <Typography variant="body2" className="text-gray-600 min-w-[60px]">
            Condition {index + 1}:
          </Typography>

          <FormControl size="small" className="min-w-[180px]">
            <InputLabel>Operator</InputLabel>
            <Select
              value={condition.operator}
              onChange={(e) => handleConditionUpdate(index, 'operator', e.target.value)}
              label="Operator"
            >
              {operators.map((op) => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {condition.operator !== 'is_empty' && condition.operator !== 'is_not_empty' && (
            <InputBox
              value={condition.comparisonValue}
              onChange={(value) => handleConditionUpdate(index, 'comparisonValue', value)}
              placeholder="Comparison value"
              color={color}
              isShowLabel={false}
              className="flex-1"
            />
          )}
        </Box>

        <IconButton
          size="small"
          onClick={() => handleRemoveCondition(index)}
          className="text-gray-500 hover:text-red-500"
        >
          <Trash2 size={16} />
        </IconButton>
      </Box>
    );
  };

  return (
    <Box className="space-y-3">
      <ParameterHeader
        title={param.key}
        icon={<GitBranch size={18} />}
        description={param.description}
      />

      <DashedBox className="!p-4">
        {conditions.length === 0 ? (
          <Typography variant="body2" className="text-gray-500 p-2">
            {param.description || "No conditions defined. Add conditions below."}
          </Typography>
        ) : (
          <Box className="space-y-2">
            {conditions.map((condition, index) => renderCondition(condition, index))}
          </Box>
        )}

        <Box className="flex justify-center mt-4">
          <Button
            variant="outlined"
            onClick={handleAddCondition}
            startIcon={<Plus size={16} />}
            size="small"
          >
            Add Condition
          </Button>
        </Box>
      </DashedBox>
    </Box>
  );
};

export default ConditionParameter;
