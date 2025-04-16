"use client";

import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useId } from "react";

const CustomSelect = ({
  label,
  value,
  onChange,
  options,
  icon,
  placeholder,
  width = "200px",
}) => {
  const id = useId();

  return (
    <div
      className="relative"
      style={{ width }}
    >
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <FormControl
        variant="outlined"
        size="small"
        className="w-full bg-white border border-gray-200"
      >
        <Select
          id={id}
          value={value}
          onChange={onChange}
          displayEmpty
          inputProps={{ className: "p-2" }}
          className="text-sm font-medium text-gray-800"

        >
          <MenuItem value="">
            <span className="text-gray-400">{placeholder}</span>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon && <span className="text-gray-500">{option.icon}</span>}
                <span className="text-gray-900 font-medium">{option.label}</span>
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default CustomSelect;
