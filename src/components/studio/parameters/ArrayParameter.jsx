"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Button, Switch } from "@mui/material";
import { Trash2, Code, Plus } from "lucide-react";
import ParameterHeader from "./common/ParameterHeader";
import DashedBox from "@/components/Common/DashedBox";
import { getParameterComponent } from "../InputParameterComponents";
import InputBox from "@/components/Common/InputBox";
import ExpandableTextInput from "@/components/Common/ExpandableTextInput";

const ArrayParameter = ({ param, color, onUpdate, parameters, parameter }) => {
  const isStringValue = typeof param.value === "string";
  const [arrayItems, setArrayItems] = useState(
    isStringValue ? [] : param.value || []
  );
  const [useTextInput, setUseTextInput] = useState(isStringValue);
  const [selectedType, setSelectedType] = useState("string");
  const [textInputValue, setTextInputValue] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const isString = typeof param.value === "string";
    setUseTextInput(isString);

    if (isString) {
      setTextInputValue(param.value);
    } else {
      setArrayItems(param.value || []);
      setTextInputValue(JSON.stringify(param.value || [], null, 2));
    }
  }, [param.value]);

  const fieldTypes = [
    { value: "string", label: "Text" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "object", label: "Object" }
  ];

  // Helper function to get default value for each type
  const getDefaultValueForType = (type) => {
    switch (type) {
      case "string":
        return "";
      case "number":
        return 0;
      case "boolean":
        return false;
      case "object":
        return {};
      default:
        return "";
    }
  };

  // Helper function to detect item type
  const getItemType = (item) => {
    if (item === null) return "object";
    if (typeof item === "boolean") return "boolean";
    if (typeof item === "number") return "number";
    if (typeof item === "object") return "object";
    return "string";
  };

  // Helper function to parse value based on input
  const parseInputValue = (value) => {
    // If it's already not a string, return as is
    if (typeof value !== "string") return value;

    // Try to parse as number first
    if (/^\d+(\.\d+)?$/.test(value.trim())) {
      const num = Number(value);
      if (!isNaN(num)) return num;
    }

    // Try to parse as boolean
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    // Try to parse as JSON object/array
    if ((value.startsWith("{") && value.endsWith("}")) || 
        (value.startsWith("[") && value.endsWith("]"))) {
      try {
        return JSON.parse(value);
      } catch (e) {
        // If parsing fails, return as string
      }
    }

    // Return as string if nothing else matches
    return value;
  };

  const handleAddItem = () => {
    const newItem = getDefaultValueForType(selectedType);
    const updatedItems = [...arrayItems, newItem];
    setArrayItems(updatedItems);
    updateParentValue(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = arrayItems.filter((_, idx) => idx !== index);
    setArrayItems(updatedItems);
    updateParentValue(updatedItems);
  };

  const handleItemUpdate = (index, value) => {
    const updatedItems = arrayItems.map((item, idx) => {
      if (idx !== index) return item;
      
      // Parse the input value to determine its type
      return parseInputValue(value);
    });

    setArrayItems(updatedItems);
    updateParentValue(updatedItems);
  };

  const handleTextInputChange = (value) => {
    setTextInputValue(value);

    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error("Value must be an array");
      }
      setError(null);
      setArrayItems(parsed);
      updateParentValue(parsed);
    } catch (err) {
      setError("Invalid JSON array");
    }
  };

  const updateParentValue = (items) => {
    if (onUpdate && parameters) {
      const updatedParams = parameters.map((p) =>
        p.key === param.key ? { ...p, type: "array", value: items } : p
      );
      onUpdate(updatedParams, parameter, true);
    }
  };

  const toggleInputMode = () => {
    if (!useTextInput) {
      setTextInputValue(JSON.stringify(arrayItems || [], null, 2));
    }
    setUseTextInput(!useTextInput);
  };

  const renderArrayItem = (item, index) => {
    const itemType = getItemType(item);
    
    // Create a mock parameter for the item
    const itemParam = {
      key: `Item ${index+1}`,
      type: itemType,
      value: item,
      description: `Item ${index + 1} `
    };

    // Create a mock parameters array for this item
    const itemParameters = [itemParam];

    // Handle the update for this specific item
    const handleItemOnUpdate = (updatedParams, parameterInfo, shouldUpdate) => {
      if (updatedParams && updatedParams.length > 0) {
        const newValue = updatedParams[0].value;
        handleItemUpdate(index, newValue);
      }
    };

    // Get the component for this item type
    const Component = getParameterComponent(
      itemParam,
      color,
      handleItemOnUpdate,
      itemParameters,
      itemParam
    );

    if (!Component) {
      return (
        <Box key={index} className="flex items-center gap-2 p-2 border rounded">
          <InputBox
            value={typeof item === "object" ? JSON.stringify(item) : String(item)}
            onChange={(value) => handleItemUpdate(index, value)}
            placeholder={`Item ${index + 1}`}
            color={color}
            isShowLabel={false}
          />
          <IconButton
            size="small"
            onClick={() => handleRemoveItem(index)}
            className="ml-auto text-gray-500 hover:text-red-500"
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      );
    }

    return (
      <Box key={index} className="mb-2">
        <Box className="flex items-center gap-2">
          <Box className="flex-1">
            {Component}
          </Box>
          <IconButton
            size="small"
            onClick={() => handleRemoveItem(index)}
            className="text-gray-500 hover:text-red-500"
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
        <Typography variant="caption" className="text-gray-500 ml-2">
          Type: {itemType}
        </Typography>
      </Box>
    );
  };

  return (
    <Box className="space-y-3">
      <Box className="flex justify-between items-center">
        <ParameterHeader
          title={param.key}
          icon={<Code size={18} />}
          description={param.description}
        />
        <Box className="flex items-center">
          <Typography variant="caption" className="mr-1 text-gray-500">
            Use Text Input
          </Typography>
          <Switch
            size="small"
            checked={useTextInput}
            onChange={toggleInputMode}
            color="primary"
          />
        </Box>
      </Box>

      <DashedBox className="!p-4">
        {useTextInput ? (
          <Box className="space-y-2">
            <ExpandableTextInput
              value={textInputValue}
              onChange={handleTextInputChange}
              language="json"
              title={param.key || 'Array value'}
              minRows={6}
              maxRows={16}
              error={error}
              placeholder={'Enter JSON array (e.g., ["item1", "item2", 5, true, {}])'}
            />
          </Box>
        ) : (
          <Box className="space-y-4">
            {arrayItems.length === 0 ? (
              <Typography variant="body2" className="text-gray-500 p-2">
                {param.description || "No items in array. Add items below."}
              </Typography>
            ) : (
              arrayItems.map((item, index) => renderArrayItem(item, index))
            )}

            <Box className="flex items-center gap-4 mt-4">
              <Box className="w-40">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  {fieldTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </Box>
              <Button
                variant="outlined"
                onClick={handleAddItem}
                startIcon={<Plus size={16} />}
                size="small"
              >
                Add Item
              </Button>
            </Box>
          </Box>
        )}
      </DashedBox>
    </Box>
  );
};

export default ArrayParameter;