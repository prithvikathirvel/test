"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  RefreshCw,
  Loader2,
  ServerCrash,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/Common/ConfirmDialog";
import PageHeader from "@/components/layout/PageHeader";
import {
  listDictionaries,
  createDictionary,
  updateDictionary,
  deleteDictionary,
  validateDictionaryKey,
  validateDictionaryValue,
} from "@/utils/dictionaryAPI";

const TYPE_FILTERS = ["all", "object", "array", "text", "number", "boolean"];

export default function DictionaryPage() {
  const [dictionaries, setDictionaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Remote data lifecycle
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal Form State
  const [keyName, setKeyName] = useState("");
  const [dataType, setDataType] = useState("object");
  const [description, setDescription] = useState("");
  const [rawTextValue, setRawTextValue] = useState("");
  const [numValue, setNumValue] = useState(0);
  const [boolValue, setBoolValue] = useState(false);
  const [jsonText, setJsonText] = useState("{\n  \"key\": \"value\"\n}");
  const [jsonError, setJsonError] = useState(null);

  /**
   * Loads the global dictionary from the API.
   *
   * Filtering/search are applied client-side (as they always were) so typing in
   * the search box stays instant; the endpoint's `search`/`type` params are
   * still honoured for the initial fetch when a filter is already active.
   */
  const loadDictionaries = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setLoadError(null);
    try {
      const { items } = await listDictionaries({ limit: 200 });
      setDictionaries(items);
    } catch (error) {
      setLoadError(error?.message || "Unable to load global dictionaries.");
      if (silent) toast.error(error?.message || "Unable to refresh dictionaries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDictionaries();
  }, [loadDictionaries]);

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

  const handleSaveModal = async () => {
    const cleanKey = keyName.trim().toUpperCase().replace(/\s+/g, "_");

    // Contract validation (DICTIONARY_API_SPEC.md §2.B)
    const keyError = validateDictionaryKey(cleanKey);
    if (keyError) {
      toast.error(keyError);
      return;
    }

    // Local duplicate guard: fail fast before the round-trip. The server is
    // still authoritative and answers 409 / DUPLICATE_KEY.
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

    const valueError = validateDictionaryValue(dataType, finalValue);
    if (valueError) {
      if (dataType === "object" || dataType === "array") setJsonError(valueError);
      toast.error(valueError);
      return;
    }

    const payload = {
      key: cleanKey,
      type: dataType,
      description,
      value: finalValue,
    };

    setSaving(true);
    try {
      if (editItem) {
        const saved = await updateDictionary(editItem.id, payload);
        setDictionaries((prev) =>
          prev.map((d) => (d.id === editItem.id ? { ...d, ...saved } : d))
        );
        toast.success(`Updated global variable "${cleanKey}"`);
      } else {
        const created = await createDictionary(payload);
        setDictionaries((prev) => [created, ...prev]);
        toast.success(`Registered global variable "${cleanKey}"`);
      }
      setModalOpen(false);
    } catch (error) {
      if (error?.code === "DUPLICATE_KEY") {
        toast.error(error.message || `Global variable "${cleanKey}" already exists.`);
      } else {
        toast.error(error?.message || "Failed to save global variable.");
      }
    } finally {
      setSaving(false);
    }
  };

  /** Opens the confirmation dialog; the request itself runs on confirm. */
  const handleDelete = (id) => {
    const item = dictionaries.find((d) => d.id === id);
    if (!item) return;
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDictionary(deleteTarget.id);
      setDictionaries((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.info(`Deleted global variable "${deleteTarget.key}"`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.message || "Failed to delete global variable.");
    } finally {
      setDeleting(false);
    }
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
        <PageHeader
          icon={BookMarked}
          title="Global Dictionary"
          description="Manage centralized key-value configurations referenced across all agent flows"
          actions={
            <>
              <button
                onClick={() => loadDictionaries({ silent: true })}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-60"
                title="Refresh from server"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                <Plus size={15} /> Create Variable
              </button>
            </>
          }
        />

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
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                        <Loader2 size={15} className="animate-spin" />
                        Loading global dictionaries…
                      </div>
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={4} className="py-14 text-center">
                      <div className="inline-flex flex-col items-center gap-2.5">
                        <ServerCrash size={22} className="text-slate-300" />
                        <p className="text-xs text-slate-500 max-w-sm">{loadError}</p>
                        <button
                          onClick={() => loadDictionaries()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors"
                        >
                          <RefreshCw size={13} /> Try again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredList.length > 0 ? (
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
                      {dictionaries.length === 0
                        ? "No global dictionary variables registered yet. Create your first variable to get started."
                        : "No global dictionary variables found matching your filter."}
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
            disabled={saving}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveModal}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {saving
              ? editItem
                ? "Saving…"
                : "Registering…"
              : editItem
              ? "Save Changes"
              : "Register Variable"}
          </button>
        </div>
      </Dialog>

      {/* Delete confirmation — deleting a global variable breaks every flow
          that references it, so it must never be a single-click action. */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        tone="danger"
        title="Delete global variable?"
        description={
          deleteTarget
            ? `"${deleteTarget.key}" will be removed from the workspace dictionary. Any flow referencing {{global.${deleteTarget.key}}} will stop resolving it.`
            : ""
        }
        confirmLabel="Delete Variable"
        cancelLabel="Cancel"
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => (deleting ? null : setDeleteTarget(null))}
      />
    </Box>
  );
}
