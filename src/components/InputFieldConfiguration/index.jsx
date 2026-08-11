"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateSpecification } from "@/redux/slices/studioSlice";
import {
  Dialog,
  Box,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Code,
  Copy,
  Check,
  Variable,
  Layers,
  Sparkles,
  AlertCircle,
  FileCode,
  CheckCircle2,
  Sliders,
  AlignLeft,
  Hash,
  ToggleLeft,
  Brackets,
} from "lucide-react";
import { toast } from "sonner";

const TYPE_CONFIGS = [
  { value: "text", label: "String / Text", icon: <AlignLeft size={14} />, defaultVal: "" },
  { value: "number", label: "Number", icon: <Hash size={14} />, defaultVal: 0 },
  { value: "boolean", label: "Boolean", icon: <ToggleLeft size={14} />, defaultVal: false },
  { value: "object", label: "JSON Object (Nested)", icon: <FileCode size={14} />, defaultVal: "{\n  \"key\": \"value\"\n}" },
  { value: "array", label: "Array / List", icon: <Brackets size={14} />, defaultVal: "[\n  \"item_1\",\n  \"item_2\"\n]" },
];

export default function InputFieldConfiguration({ open, onClose, onSave }) {
  const dispatch = useDispatch();
  const specification = useSelector((state) => state.studio.specification);

  const [fields, setFields] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null); // null means creating new
  const [copiedKey, setCopiedKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Editor form state
  const [keyName, setKeyName] = useState("");
  const [dataType, setDataType] = useState("text");
  const [textVal, setTextVal] = useState("");
  const [numVal, setNumVal] = useState(0);
  const [boolVal, setBoolVal] = useState(false);
  const [jsonVal, setJsonVal] = useState("{\n  \"key\": \"value\"\n}");
  const [jsonError, setJsonError] = useState(null);

  // Load existing inputs from flow specification
  useEffect(() => {
    if (open && specification) {
      const existing = specification.inputs || [];
      const normalized = existing.map((f) => {
        let val = f.value;
        if (f.type === "object" || f.type === "array") {
          if (typeof val === "object" && val !== null) {
            val = JSON.stringify(val, null, 2);
          }
        }
        return {
          key: f.key || f.name || "",
          type: f.type || "text",
          value: val ?? "",
          description: f.description || "",
        };
      });
      setFields(normalized);
      resetEditor();
    }
  }, [open, specification]);

  const resetEditor = () => {
    setSelectedIdx(null);
    setKeyName("");
    setDataType("text");
    setTextVal("");
    setNumVal(0);
    setBoolVal(false);
    setJsonVal("{\n  \"key\": \"value\"\n}");
    setJsonError(null);
  };

  const handleSelectFieldToEdit = (field, idx) => {
    setSelectedIdx(idx);
    setKeyName(field.key);
    setDataType(field.type || "text");
    setJsonError(null);

    if (field.type === "number") {
      setNumVal(Number(field.value) || 0);
    } else if (field.type === "boolean") {
      setBoolVal(Boolean(field.value));
    } else if (field.type === "object" || field.type === "array") {
      if (typeof field.value === "object" && field.value !== null) {
        setJsonVal(JSON.stringify(field.value, null, 2));
      } else {
        setJsonVal(String(field.value || ""));
      }
    } else {
      setTextVal(String(field.value || ""));
    }
  };

  // Format and validate JSON/Array inputs
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonVal);
      setJsonVal(JSON.stringify(parsed, null, 2));
      setJsonError(null);
      toast.success("JSON formatted cleanly.");
    } catch (e) {
      setJsonError(`Invalid JSON: ${e.message}`);
    }
  };

  // Add or Update Variable
  const handleSaveField = () => {
    const cleanKey = keyName.trim();
    if (!cleanKey) {
      toast.error("Variable key name is required.");
      return;
    }

    // Check duplicate key
    const duplicate = fields.some(
      (f, idx) => f.key.toLowerCase() === cleanKey.toLowerCase() && idx !== selectedIdx
    );
    if (duplicate) {
      toast.error(`Variable key "${cleanKey}" already exists in this flow.`);
      return;
    }

    let resolvedValue;
    if (dataType === "number") {
      resolvedValue = Number(numVal);
    } else if (dataType === "boolean") {
      resolvedValue = Boolean(boolVal);
    } else if (dataType === "object" || dataType === "array") {
      try {
        resolvedValue = JSON.parse(jsonVal);
      } catch (e) {
        setJsonError(`Invalid JSON payload: ${e.message}`);
        toast.error("Please resolve JSON syntax errors before saving.");
        return;
      }
    } else {
      resolvedValue = textVal;
    }

    const updatedFieldObj = {
      key: cleanKey,
      type: dataType,
      value: resolvedValue,
    };

    let newFieldsList;
    if (selectedIdx !== null) {
      newFieldsList = [...fields];
      newFieldsList[selectedIdx] = updatedFieldObj;
      toast.success(`Updated variable "${cleanKey}"`);
    } else {
      newFieldsList = [...fields, updatedFieldObj];
      toast.success(`Added variable "${cleanKey}"`);
    }

    setFields(newFieldsList);
    resetEditor();
  };

  const handleDeleteField = (idxToDelete) => {
    const deleted = fields[idxToDelete];
    const updated = fields.filter((_, i) => i !== idxToDelete);
    setFields(updated);
    if (selectedIdx === idxToDelete) {
      resetEditor();
    }
    toast.info(`Removed variable "${deleted?.key}"`);
  };

  const handleCopyTag = (key) => {
    const tag = `{{${key}}}`;
    navigator.clipboard.writeText(tag);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success(`Copied ${tag} to clipboard`);
  };

  const handleSaveAllAndClose = () => {
    // Save to Redux flow specification
    const updatedSpec = {
      ...specification,
      inputs: fields,
    };
    dispatch(updateSpecification(updatedSpec));
    onSave?.(fields);
    onClose();
    toast.success("Flow input dictionary updated successfully.");
  };

  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) return fields;
    return fields.filter(
      (f) =>
        f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(f.type).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fields, searchQuery]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          height: "82vh",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Modal Topbar */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <Sliders size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Configure Flow Input Variables
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {fields.length} variables
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Define input variables and dictionary parameters resolved at flow execution
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Configured Variables List (5 Cols) */}
        <div className="lg:col-span-5 border-r border-slate-200/80 bg-slate-50/50 flex flex-col h-full overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-white">
            <input
              type="text"
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={resetEditor}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shrink-0 shadow-2xs"
            >
              <Plus size={13} /> New
            </button>
          </div>

          {/* Variables List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredFields.length > 0 ? (
              filteredFields.map((field, idx) => {
                const isSelected = selectedIdx === idx;
                const isCopied = copiedKey === field.key;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectFieldToEdit(field, idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                        : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Variable size={13} className="text-indigo-600 shrink-0" />
                        <span className="text-xs font-mono font-bold text-slate-800 truncate">
                          {field.key}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {field.type}
                        </span>
                        <Tooltip title="Copy variable tag">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyTag(field.key);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          >
                            {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteField(idx);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="text-[11.5px] font-mono text-slate-400 truncate bg-slate-50 px-2 py-1 rounded">
                      {typeof field.value === "object" ? JSON.stringify(field.value) : String(field.value || "(empty)")}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                {searchQuery ? "No matching variables" : "No variables configured yet. Click '+ New' to create one."}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Variable Editor Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white flex flex-col h-full overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {selectedIdx !== null ? `Edit Variable: {{${keyName || "..."}}}` : "Create New Flow Variable"}
              </h3>
              <p className="text-[11.5px] text-slate-400">
                Set variable key and choose value datatype
              </p>
            </div>

            {selectedIdx !== null && (
              <button
                type="button"
                onClick={resetEditor}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Switch to New
              </button>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Key Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Variable Key Name *
              </label>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value.replace(/\s+/g, "_"))}
                placeholder="e.g. USER_QUERY, API_KEY, SYSTEM_CONFIG"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
              />
              <span className="text-[10.5px] text-slate-400 mt-1 block">
                Reference anywhere in flow as: <code className="text-indigo-600 font-mono">{`{{${keyName || "VARIABLE_NAME"}}}`}</code>
              </span>
            </div>

            {/* Data Type Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Data Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TYPE_CONFIGS.map((t) => {
                  const isSelected = dataType === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        setDataType(t.value);
                        setJsonError(null);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-indigo-50/80 border-indigo-500 text-indigo-900 font-semibold shadow-2xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className={isSelected ? "text-indigo-600" : "text-slate-400"}>
                        {t.icon}
                      </span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Value Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Default Value
                </label>
                {(dataType === "object" || dataType === "array") && (
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Format JSON
                  </button>
                )}
              </div>

              {dataType === "text" && (
                <textarea
                  rows={4}
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="Enter text value, prompt template, or URL..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              )}

              {dataType === "number" && (
                <input
                  type="number"
                  value={numVal}
                  onChange={(e) => setNumVal(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              )}

              {dataType === "boolean" && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-700 font-medium">Value is set to:</span>
                  <button
                    type="button"
                    onClick={() => setBoolVal(!boolVal)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      boolVal ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {boolVal ? "TRUE" : "FALSE"}
                  </button>
                </div>
              )}

              {(dataType === "object" || dataType === "array") && (
                <div>
                  <textarea
                    rows={7}
                    value={jsonVal}
                    onChange={(e) => {
                      setJsonVal(e.target.value);
                      setJsonError(null);
                    }}
                    placeholder={dataType === "object" ? "{\n  \"key\": \"value\"\n}" : "[\"item1\", \"item2\"]"}
                    className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  {jsonError && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{jsonError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save Variable Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveField}
                disabled={!keyName.trim()}
                className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl shadow-xs transition-colors"
              >
                {selectedIdx !== null ? "Update Variable" : "+ Add to Flow Dictionary"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Actions Footer */}
      <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Variables are accessible in all nodes via <code className="font-mono text-slate-600">{`{{VAR_NAME}}`}</code>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAllAndClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </Dialog>
  );
}
