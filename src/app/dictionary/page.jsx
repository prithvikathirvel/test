"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Dialog,
  Tooltip,
} from "@mui/material";
import {
  BookMarked,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  Edit2,
  Code,
  FileCode,
  Brackets,
  AlignLeft,
  Hash,
  ToggleLeft,
  Sparkles,
  Layers,
  ArrowRight,
  AlertCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_GLOBAL_DICTIONARIES = [
  {
    id: "dict-01",
    key: "API_GATEWAY_ENDPOINTS",
    type: "object",
    description: "Centralized internal API microservice endpoints",
    value: {
      crm_service: "https://crm.internal.corp/v1",
      billing_service: "https://billing.internal.corp/v2",
      auth_service: "https://auth.internal.corp/oauth",
      vector_store: "https://qdrant.internal.corp:6333"
    },
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "dict-02",
    key: "DEFAULT_AGENT_PROMPT_GUARDRAILS",
    type: "array",
    description: "Mandatory safety & compliance guidelines injected into all agent system prompts",
    value: [
      "Never reveal internal database connection credentials or API tokens.",
      "Verify customer account ownership before returning transaction history.",
      "Escalate to human support when customer sentiment score drops below -0.6.",
      "Strictly refuse non-business prompts or unauthorized code execution."
    ],
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "dict-03",
    key: "MAX_AGENT_REASONING_LOOPS",
    type: "number",
    description: "Maximum execution loops permitted per agent before force termination",
    value: 12,
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "dict-04",
    key: "ACTIVE_ENVIRONMENT",
    type: "text",
    description: "Active deployment cluster target",
    value: "production-us-east-1",
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

const TYPE_FILTERS = ["all", "object", "array", "text", "number", "boolean"];

export default function DictionaryPage() {
  const [dictionaries, setDictionaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Modal Form State
  const [keyName, setKeyName] = useState("");
  const [dataType, setDataType] = useState("object");
  const [description, setDescription] = useState("");
  const [rawTextValue, setRawTextValue] = useState("");
  const [numValue, setNumValue] = useState(0);
  const [boolValue, setBoolValue] = useState(false);
  const [jsonText, setJsonText] = useState("{\n  \"key\": \"value\"\n}");
  const [jsonError, setJsonError] = useState(null);

  // Load from localStorage or defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aurora_global_dictionaries");
      if (saved) {
        setDictionaries(JSON.parse(saved));
      } else {
        setDictionaries(DEFAULT_GLOBAL_DICTIONARIES);
        localStorage.setItem("aurora_global_dictionaries", JSON.stringify(DEFAULT_GLOBAL_DICTIONARIES));
      }
    } catch {
      setDictionaries(DEFAULT_GLOBAL_DICTIONARIES);
    }
  }, []);

  const saveToStorage = (updated) => {
    setDictionaries(updated);
    try {
      localStorage.setItem("aurora_global_dictionaries", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCreateModal = () => {
    setEditItem(null);
    setKeyName("");
    setDataType("object");
    setDescription("");
    setRawTextValue("");
    setNumValue(0);
    setBoolValue(false);
    setJsonText("{\n  \"key\": \"value\"\n}");
    setJsonError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditItem(item);
    setKeyName(item.key);
    setDataType(item.type || "text");
    setDescription(item.description || "");
    setJsonError(null);

    if (item.type === "number") {
      setNumValue(Number(item.value) || 0);
    } else if (item.type === "boolean") {
      setBoolValue(Boolean(item.value));
    } else if (item.type === "object" || item.type === "array") {
      setJsonText(JSON.stringify(item.value, null, 2));
    } else {
      setRawTextValue(String(item.value || ""));
    }

    setModalOpen(true);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
      toast.success("Formatted cleanly");
    } catch (e) {
      setJsonError(`Invalid JSON: ${e.message}`);
    }
  };

  const handleSaveModal = () => {
    const cleanKey = keyName.trim().toUpperCase().replace(/\s+/g, "_");
    if (!cleanKey) {
      toast.error("Variable key name is required.");
      return;
    }

    // Check duplicate key
    const duplicate = dictionaries.some(
      (d) => d.key === cleanKey && d.id !== editItem?.id
    );
    if (duplicate) {
      toast.error(`Global variable "${cleanKey}" already exists.`);
      return;
    }

    let finalValue;
    if (dataType === "number") {
      finalValue = Number(numValue);
    } else if (dataType === "boolean") {
      finalValue = Boolean(boolValue);
    } else if (dataType === "object" || dataType === "array") {
      try {
        finalValue = JSON.parse(jsonText);
      } catch (e) {
        setJsonError(`Invalid JSON: ${e.message}`);
        toast.error("Please fix JSON syntax errors before saving.");
        return;
      }
    } else {
      finalValue = rawTextValue;
    }

    if (editItem) {
      // Update
      const updated = dictionaries.map((d) =>
        d.id === editItem.id
          ? {
              ...d,
              key: cleanKey,
              type: dataType,
              description,
              value: finalValue,
              updatedAt: new Date().toISOString(),
            }
          : d
      );
      saveToStorage(updated);
      toast.success(`Updated global variable "${cleanKey}"`);
    } else {
      // Create new
      const newItem = {
        id: `dict-${Date.now()}`,
        key: cleanKey,
        type: dataType,
        description,
        value: finalValue,
        updatedAt: new Date().toISOString(),
      };
      saveToStorage([newItem, ...dictionaries]);
      toast.success(`Registered global variable "${cleanKey}"`);
    }

    setModalOpen(false);
  };

  const handleDelete = (id) => {
    const item = dictionaries.find((d) => d.id === id);
    if (!item) return;
    const updated = dictionaries.filter((d) => d.id !== id);
    saveToStorage(updated);
    toast.info(`Deleted global variable "${item.key}"`);
  };

  const handleCopySyntax = (key) => {
    const syntax = `{{global.${key}}}`;
    navigator.clipboard.writeText(syntax);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(`Copied ${syntax} to clipboard`);
  };

  const filteredList = useMemo(() => {
    return dictionaries.filter((d) => {
      const matchSearch =
        d.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedType === "all" || d.type === selectedType;
      return matchSearch && matchType;
    });
  }, [dictionaries, searchTerm, selectedType]);

  const totalKeys = useMemo(() => {
    return dictionaries.reduce((acc, d) => {
      if (d.type === "object" && typeof d.value === "object" && d.value !== null) {
        return acc + Object.keys(d.value).length;
      }
      if (d.type === "array" && Array.isArray(d.value)) {
        return acc + d.value.length;
      }
      return acc + 1;
    }, 0);
  }, [dictionaries]);

  return (
    <Box className="min-h-screen bg-[#f8fafc]">
      <Box className="px-5 lg:px-5 py-5">
        {/* Top Page Header */}
        <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            {/* <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <span>Platform</span>
              <span>/</span>
              <span className="text-slate-700">Dictionary</span>
            </div> */}
            <h1 className="text-md font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
              Global Dictionary & Variables
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {dictionaries.length} Stores
              </span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Manage centralized key-value configurations and constants referenced across all Agent Flows.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <Plus size={15} /> Create Variable
          </button>
        </Box>

        {/* Metric Cards (Screenshot Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              TOTAL DICTIONARIES
            </p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{dictionaries.length}</p>
            <p className="text-xs text-slate-400 mt-1">Global stores</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              RESOLVABLE ENTRIES
            </p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{totalKeys}</p>
            <p className="text-xs text-slate-400 mt-1">Keys & array items</p>
          </div>

          <div className="sm:col-span-2 bg-gradient-to-br from-indigo-50/60 to-slate-50 p-5 rounded-2xl border border-indigo-100/80 shadow-2xs">
            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider mb-3">HOW TO USE</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">1</span>
                <p className="text-xs text-slate-600">Create a variable with a unique key (e.g. <code className="font-mono text-indigo-600 bg-white px-1 rounded border border-indigo-100">API_CONFIG</code>)</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">2</span>
                <p className="text-xs text-slate-600">Reference it in any flow node using <code className="font-mono text-indigo-600 bg-white px-1 rounded border border-indigo-100">{`{{global.API_CONFIG}}`}</code></p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center">3</span>
                <p className="text-xs text-slate-600">Update the value here—changes reflect instantly across all flows at runtime.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search global dictionary keys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs overflow-x-auto">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all whitespace-nowrap ${
                  selectedType === type
                    ? "bg-slate-100 text-slate-900 font-semibold shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {type === "all" ? "All Types" : type}
              </button>
            ))}
          </div>
        </div>

        {/* Dictionary Table */}
        <div className="w-full bg-white rounded-xl shadow-2xs overflow-hidden border border-slate-200/80">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="w-[30%] px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Global Key
                  </th>
                  <th className="w-[12%] px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Data Type
                  </th>
                  <th className="w-[38%] px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Value / Payload Preview
                  </th>
                  <th className="w-[20%] px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredList.length > 0 ? (
                  filteredList.map((item) => {
                    const isCopied = copiedId === item.key;
                    const previewText =
                      typeof item.value === "object"
                        ? JSON.stringify(item.value)
                        : String(item.value ?? "");

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 align-middle">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-mono font-bold text-slate-800 truncate">
                                {item.key}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[11.5px] text-slate-400 truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 align-middle">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                            {item.type}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 align-middle">
                          <div className="text-[11.5px] font-mono text-slate-500 truncate bg-slate-50 px-2.5 py-1 rounded border border-slate-200/60 max-w-md">
                            {previewText || "(empty)"}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 align-middle text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopySyntax(item.key)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                            >
                              {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                              <span>{isCopied ? "Copied" : "Copy Tag"}</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Variable"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Variable"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-14 text-center text-xs text-slate-400">
                      No global dictionary variables found matching your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Box>

      {/* Create / Edit Modal Dialog */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            backgroundColor: "#ffffff",
            p: { xs: 3, sm: 4 },
          },
        }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              {editItem ? "Edit Global Variable" : "Register Global Variable"}
            </h3>
            <p className="text-xs text-slate-400">
              Globally accessible in all agent workflows via <code className="font-mono text-indigo-600">{`{{global.KEY}}`}</code>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Variable Key Name *
            </label>
            <input
              type="text"
              autoFocus
              value={keyName}
              onChange={(e) => setKeyName(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
              placeholder="e.g. API_GATEWAY_CONFIG, ALLOWED_ROLES"
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe purpose or service dependency..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Data Type
            </label>
            <select
              value={dataType}
              onChange={(e) => {
                setDataType(e.target.value);
                setJsonError(null);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              <option value="object">JSON Object (Nested Key-Values)</option>
              <option value="array">Array / List of Items or JSON</option>
              <option value="text">String / Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean (True / False)</option>
            </select>
          </div>

          {/* Value Inputs */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Value Payload
              </label>
              {(dataType === "object" || dataType === "array") && (
                <button
                  type="button"
                  onClick={handleFormatJson}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Beautify JSON
                </button>
              )}
            </div>

            {dataType === "text" && (
              <textarea
                rows={4}
                value={rawTextValue}
                onChange={(e) => setRawTextValue(e.target.value)}
                placeholder="Enter string value..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            )}

            {dataType === "number" && (
              <input
                type="number"
                value={numValue}
                onChange={(e) => setNumValue(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            )}

            {dataType === "boolean" && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-700 font-medium">Value is set to:</span>
                <button
                  type="button"
                  onClick={() => setBoolValue(!boolValue)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    boolValue ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {boolValue ? "TRUE" : "FALSE"}
                </button>
              </div>
            )}

            {(dataType === "object" || dataType === "array") && (
              <div>
                <textarea
                  rows={8}
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setJsonError(null);
                  }}
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
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveModal}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
          >
            {editItem ? "Save Changes" : "Register Variable"}
          </button>
        </div>
      </Dialog>
    </Box>
  );
}
