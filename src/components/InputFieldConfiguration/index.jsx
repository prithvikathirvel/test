"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateSpecification } from "@/redux/slices/studioSlice";
import { Dialog, Tooltip } from "@mui/material";
import {
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Sliders,
  Globe,
  Lock,
  ChevronDown,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { listDictionaries } from "@/utils/dictionaryAPI";

const TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "object", label: "Object" },
  { value: "array", label: "Array" },
];

const previewValue = (type, value) => {
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  if (value === undefined || value === null || value === "") return "(empty)";
  return String(value);
};

const emptyEditor = () => ({
  keyName: "",
  dataType: "text",
  textVal: "",
  numVal: 0,
  boolVal: false,
  jsonVal: '{\n  "key": "value"\n}',
  jsonError: null,
  isGlobal: false,
});

export default function InputFieldConfiguration({ open, onClose, onSave }) {
  const dispatch = useDispatch();
  const specification = useSelector((state) => state.studio.specification);

  const [fields, setFields] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [editor, setEditor] = useState(emptyEditor());

  const [globals, setGlobals] = useState([]);
  const [globalsLoading, setGlobalsLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!open || !specification) return;

    const existing = specification.inputs || [];
    setFields(
      existing.map((f) => ({
        key: f.key || f.name || "",
        type: f.type || "text",
        value: f.value ?? "",
        description: f.description || "",
        scope: f.scope === "global" ? "global" : "local",
      }))
    );
    setSelectedIdx(null);
    setEditor(emptyEditor());
    setSearchQuery("");
    setScopeFilter("all");
    setPickerOpen(false);
  }, [open, specification]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setGlobalsLoading(true);
    listDictionaries({ limit: 200 })
      .then(({ items }) => {
        if (!cancelled) setGlobals(items || []);
      })
      .catch(() => {
        if (!cancelled) setGlobals([]);
      })
      .finally(() => {
        if (!cancelled) setGlobalsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!pickerOpen) return undefined;
    const onPointer = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [pickerOpen]);

  const usedKeys = useMemo(
    () => new Set(fields.map((f) => f.key.toLowerCase())),
    [fields]
  );

  const filteredGlobals = useMemo(() => {
    const q = editor.keyName.trim().toLowerCase();
    return globals.filter((g) => {
      if (usedKeys.has((g.key || "").toLowerCase()) && editor.keyName.toLowerCase() !== (g.key || "").toLowerCase()) {
        return false;
      }
      if (!q) return true;
      return (
        g.key.toLowerCase().includes(q) ||
        (g.description || "").toLowerCase().includes(q)
      );
    });
  }, [globals, editor.keyName, usedKeys]);

  const resetEditor = () => {
    setSelectedIdx(null);
    setEditor(emptyEditor());
    setPickerOpen(false);
  };

  const applyEditorFromField = (field, idx) => {
    setSelectedIdx(idx);
    setPickerOpen(false);

    const next = emptyEditor();
    next.keyName = field.key;
    next.dataType = field.type || "text";
    next.isGlobal = field.scope === "global";

    if (field.type === "number") {
      next.numVal = Number(field.value) || 0;
    } else if (field.type === "boolean") {
      next.boolVal = Boolean(field.value);
    } else if (field.type === "object" || field.type === "array") {
      if (typeof field.value === "object" && field.value !== null) {
        next.jsonVal = JSON.stringify(field.value, null, 2);
      } else {
        next.jsonVal = String(field.value || (field.type === "array" ? "[]" : "{}"));
      }
    } else {
      next.textVal = String(field.value ?? "");
    }
    setEditor(next);
  };

  const applyGlobal = (item) => {
    const type = item.type || "text";
    const next = emptyEditor();
    next.keyName = item.key;
    next.dataType = type;
    next.isGlobal = true;

    if (type === "number") {
      next.numVal = Number(item.value) || 0;
    } else if (type === "boolean") {
      next.boolVal = Boolean(item.value);
    } else if (type === "object" || type === "array") {
      next.jsonVal =
        typeof item.value === "object" && item.value !== null
          ? JSON.stringify(item.value, null, 2)
          : String(item.value || (type === "array" ? "[]" : "{}"));
    } else {
      next.textVal = String(item.value ?? "");
    }

    setEditor(next);
    setPickerOpen(false);
  };

  const buildFieldFromEditor = () => {
    const cleanKey = editor.keyName.trim();
    if (!cleanKey) {
      toast.error("Variable key name is required.");
      return null;
    }

    const duplicate = fields.some(
      (f, idx) => f.key.toLowerCase() === cleanKey.toLowerCase() && idx !== selectedIdx
    );
    if (duplicate) {
      toast.error(`Variable key "${cleanKey}" already exists in this flow.`);
      return null;
    }

    let resolvedValue;
    if (editor.dataType === "number") {
      resolvedValue = Number(editor.numVal);
    } else if (editor.dataType === "boolean") {
      resolvedValue = Boolean(editor.boolVal);
    } else if (editor.dataType === "object" || editor.dataType === "array") {
      try {
        resolvedValue = JSON.parse(editor.jsonVal);
      } catch (e) {
        setEditor((prev) => ({ ...prev, jsonError: `Invalid JSON: ${e.message}` }));
        toast.error("Please fix JSON syntax before adding this variable.");
        return null;
      }
    } else {
      resolvedValue = editor.textVal;
    }

    return {
      key: cleanKey,
      type: editor.dataType,
      value: resolvedValue,
      scope: editor.isGlobal ? "global" : "local",
    };
  };

  const handleSaveField = () => {
    const updatedFieldObj = buildFieldFromEditor();
    if (!updatedFieldObj) return false;

    if (selectedIdx !== null) {
      setFields((prev) => prev.map((f, i) => (i === selectedIdx ? updatedFieldObj : f)));
      toast.success(`Updated "${updatedFieldObj.key}"`);
    } else {
      setFields((prev) => [...prev, updatedFieldObj]);
      toast.success(`Added "${updatedFieldObj.key}" to the flow dictionary`);
    }
    resetEditor();
    return true;
  };

  const handleDeleteField = (idxToDelete) => {
    const deleted = fields[idxToDelete];
    setFields((prev) => prev.filter((_, i) => i !== idxToDelete));
    if (selectedIdx === idxToDelete) resetEditor();
    toast.info(`Removed "${deleted?.key}"`);
  };

  const handleCopyTag = (key) => {
    const tag = `{{${key}}}`;
    navigator.clipboard.writeText(tag);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success(`Copied ${tag}`);
  };

  const persistFields = (nextFields) => {
    dispatch(updateSpecification({ inputs: nextFields }));
    onSave?.(nextFields);
    onClose();
    toast.success("Flow dictionary saved.");
  };

  const handleSaveAllAndClose = () => {
    // Users often skip "Add to Flow Dictionary" and hit Save. If the form has
    // a key, commit that draft first so the value is not silently dropped.
    if (editor.keyName.trim()) {
      const drafted = buildFieldFromEditor();
      if (!drafted) return;
      const next =
        selectedIdx !== null
          ? fields.map((f, i) => (i === selectedIdx ? drafted : f))
          : [...fields, drafted];
      persistFields(next);
      return;
    }
    persistFields(fields);
  };

  const filteredFields = useMemo(() => {
    return fields.filter((f) => {
      const matchScope = scopeFilter === "all" || f.scope === scopeFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        f.key.toLowerCase().includes(q) ||
        String(f.type).toLowerCase().includes(q);
      return matchScope && matchSearch;
    });
  }, [fields, searchQuery, scopeFilter]);

  const localCount = fields.filter((f) => f.scope !== "global").length;
  const globalCount = fields.filter((f) => f.scope === "global").length;
  const hasDraft = Boolean(editor.keyName.trim());

  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(editor.jsonVal);
      setEditor((prev) => ({
        ...prev,
        jsonVal: JSON.stringify(parsed, null, 2),
        jsonError: null,
      }));
      toast.success("JSON formatted.");
    } catch (e) {
      setEditor((prev) => ({ ...prev, jsonError: `Invalid JSON: ${e.message}` }));
    }
  }, [editor.jsonVal]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          height: "78vh",
          maxHeight: 720,
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 16px 40px -16px rgba(15, 23, 42, 0.2)",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-8 w-8 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
            <Sliders size={15} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-slate-800 tracking-tight">
              Flow Dictionary
            </h2>
            <p className="text-[11.5px] text-slate-400 truncate">
              Local inputs and workspace globals resolved when this flow runs
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* Left: variables already on this flow */}
        <div className="lg:col-span-5 border-r border-slate-200 bg-slate-50/40 flex flex-col min-h-0">
          <div className="p-3 border-b border-slate-200 bg-white space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search this flow…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>
              <button
                type="button"
                onClick={resetEditor}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md shrink-0"
              >
                <Plus size={12} /> New
              </button>
            </div>
            <div className="flex items-center gap-1">
              {[
                { id: "all", label: `All ${fields.length}` },
                { id: "local", label: `Local ${localCount}` },
                { id: "global", label: `Global ${globalCount}` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setScopeFilter(tab.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    scopeFilter === tab.id
                      ? "bg-slate-100 text-slate-800"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {filteredFields.length > 0 ? (
              filteredFields.map((field) => {
                const actualIdx = fields.findIndex(
                  (f) => f.key === field.key && f.scope === field.scope
                );
                const isSelected = selectedIdx === actualIdx;
                const isCopied = copiedKey === field.key;
                const isGlobal = field.scope === "global";

                return (
                  <div
                    key={`${field.scope}-${field.key}`}
                    onClick={() => applyEditorFromField(field, actualIdx)}
                    className={`px-2.5 py-2 rounded-md border cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-white border-slate-400"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-mono font-semibold text-slate-800 truncate">
                        {field.key}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                            isGlobal
                              ? "bg-slate-50 text-slate-600 border-slate-200"
                              : "bg-white text-slate-500 border-slate-200"
                          }`}
                        >
                          {isGlobal ? <Globe size={9} /> : <Lock size={9} />}
                          {isGlobal ? "global" : "local"}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          {field.type}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {previewValue(field.type, field.value)}
                      </p>
                      <div className="flex items-center">
                        <Tooltip title="Copy {{tag}}">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyTag(field.key);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          >
                            {isCopied ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </Tooltip>
                        <Tooltip title="Remove from this flow">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteField(actualIdx);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 px-4 text-center text-[12px] text-slate-400">
                {searchQuery || scopeFilter !== "all"
                  ? "No variables match this filter."
                  : "Nothing in this flow yet. Add a local variable or pick a workspace global."}
              </div>
            )}
          </div>
        </div>

        {/* Right: editor */}
        <div className="lg:col-span-7 bg-white flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-800">
                {selectedIdx !== null ? "Edit variable" : "Add variable"}
              </h3>
              <p className="text-[11.5px] text-slate-400 mt-0.5">
                Click the key field to reuse a workspace global, or type a new local key.
              </p>
            </div>

            <div ref={pickerRef} className="relative">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={editor.keyName}
                  onFocus={() => setPickerOpen(true)}
                  onChange={(e) => {
                    setEditor((prev) => ({
                      ...prev,
                      keyName: e.target.value.replace(/\s+/g, "_"),
                    }));
                    setPickerOpen(true);
                  }}
                  placeholder="e.g. CHAT_QUERY or pick a global…"
                  className="w-full px-3 py-2 pr-8 text-xs font-mono bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setPickerOpen((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Browse global variables"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {pickerOpen && (
                <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Workspace globals
                  </div>
                  {globalsLoading ? (
                    <p className="px-3 py-3 text-[12px] text-slate-400">Loading…</p>
                  ) : filteredGlobals.length === 0 ? (
                    <p className="px-3 py-3 text-[12px] text-slate-400">
                      {globals.length === 0
                        ? "No globals in the workspace dictionary yet."
                        : "No matching globals."}
                    </p>
                  ) : (
                    filteredGlobals.map((item) => (
                      <button
                        key={item.id || item.key}
                        type="button"
                        onClick={() => applyGlobal(item)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-mono font-semibold text-slate-800 truncate">
                            {item.key}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
                            <Globe size={9} />
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                          {item.description || previewValue(item.type, item.value)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
              <p className="text-[10.5px] text-slate-400 mt-1">
                Reference in nodes as{" "}
                <code className="font-mono text-slate-600">
                  {`{{${editor.keyName || "KEY"}}}`}
                </code>
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map((t) => {
                  const active = editor.dataType === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setEditor((prev) => ({
                          ...prev,
                          dataType: t.value,
                          jsonError: null,
                          jsonVal:
                            t.value === "array"
                              ? '[\n  "item_1"\n]'
                              : t.value === "object"
                              ? '{\n  "key": "value"\n}'
                              : prev.jsonVal,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium border transition-colors ${
                        active
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Value
                </label>
                {(editor.dataType === "object" || editor.dataType === "array") && (
                  <button
                    type="button"
                    onClick={formatJson}
                    className="text-[11px] font-medium text-slate-600 hover:text-slate-900"
                  >
                    Format JSON
                  </button>
                )}
              </div>

              {editor.dataType === "text" && (
                <textarea
                  rows={3}
                  value={editor.textVal}
                  onChange={(e) =>
                    setEditor((prev) => ({ ...prev, textVal: e.target.value }))
                  }
                  placeholder="Default value used at run time"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
              )}

              {editor.dataType === "number" && (
                <input
                  type="number"
                  value={editor.numVal}
                  onChange={(e) =>
                    setEditor((prev) => ({ ...prev, numVal: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-slate-400"
                />
              )}

              {editor.dataType === "boolean" && (
                <button
                  type="button"
                  onClick={() =>
                    setEditor((prev) => ({ ...prev, boolVal: !prev.boolVal }))
                  }
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border ${
                    editor.boolVal
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {editor.boolVal ? "true" : "false"}
                </button>
              )}

              {(editor.dataType === "object" || editor.dataType === "array") && (
                <div>
                  <textarea
                    rows={6}
                    value={editor.jsonVal}
                    onChange={(e) =>
                      setEditor((prev) => ({
                        ...prev,
                        jsonVal: e.target.value,
                        jsonError: null,
                      }))
                    }
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                  {editor.jsonError && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{editor.jsonError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={editor.isGlobal}
                onChange={(e) =>
                  setEditor((prev) => ({ ...prev, isGlobal: e.target.checked }))
                }
                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-slate-800"
              />
              <span>
                <span className="block text-[12.5px] font-medium text-slate-800">
                  Global variable
                </span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Saved with <code className="font-mono">scope: &quot;global&quot;</code>.
                  Unchecked entries are local to this flow.
                </span>
              </span>
            </label>
          </div>

          <div className="px-5 py-3 border-t border-slate-100 bg-white">
            <button
              type="button"
              onClick={handleSaveField}
              disabled={!editor.keyName.trim()}
              className="w-full py-2 text-[12.5px] font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {selectedIdx !== null ? "Update in Flow Dictionary" : "Add to Flow Dictionary"}
            </button>
            <p className="text-[10.5px] text-slate-400 text-center mt-1.5">
              Adds the variable to the list on the left. Then save the configuration.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-slate-500 min-w-0">
          {hasDraft ? (
            <span className="text-amber-700">
              Unsaved draft for <span className="font-mono">{editor.keyName}</span> — it will be
              added when you save.
            </span>
          ) : (
            <span>
              {fields.length} variable{fields.length === 1 ? "" : "s"} on this flow
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAllAndClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-md"
          >
            Save configuration
          </button>
        </div>
      </div>
    </Dialog>
  );
}
