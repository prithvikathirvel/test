"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  RefreshCw,
  FileJson,
  ChevronDown,
  Import,
  Braces,
  Download,
  Lock,
} from "lucide-react";
import CustomTable from "@/components/Common/CustomTable";
import ConfirmDialog from "@/components/Common/ConfirmDialog";
import {
  REGISTRY_CONFIG,
  listRegistry,
  createRegistry,
  updateRegistry,
  deleteRegistry,
  buildPayload,
  recordToFormValues,
  extractParamsFromJson,
  paramsToEditor,
} from "@/utils/adminAPI";
import { InputParametersEditor, OutputParametersEditor } from "./ParametersEditor";
import { getCurrentUserFromToken } from "@/utils/jwt";
import { toast } from "sonner";

const Toggle = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
      checked ? "bg-indigo-600" : "bg-slate-200"
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-[18px]" : "translate-x-[2px]"
      }`}
    />
  </button>
);

const SectionLabel = ({ children, hint }) => (
  <div className="flex items-center justify-between mb-3">
    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{children}</span>
    {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
  </div>
);

/** Simple text / textarea / toggle field for the basic-info card. */
const BasicField = ({ field, value, onChange, disabled, readOnly = false }) => {
  if (field.type === "toggle") {
    return (
      <div className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
        <div>
          <p className="text-[12px] font-medium text-slate-700">{field.label}</p>
          {field.help && <p className="text-[11px] text-slate-400">{field.help}</p>}
        </div>
        <Toggle checked={Boolean(value)} onChange={(v) => onChange(v)} disabled={disabled} />
      </div>
    );
  }

  if (field.type === "textarea" || field.type === "json") {
    return (
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.type === "json" ? 4 : 2}
          className={`w-full px-3 py-2 text-[12.5px] bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-y ${
            field.type === "json" ? "font-mono text-[11.5px]" : ""
          }`}
        />
        {field.type === "json" && (
          <p className="text-[10.5px] text-slate-400 mt-1">
            Valid JSON object. Leave <span className="font-mono">{`{}`}</span> if none.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      {readOnly ? (
        <div className="flex items-center gap-1.5 w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed">
          <Lock size={12} className="text-slate-400 shrink-0" />
          <span className="text-[13px] font-mono truncate">{value ?? ""}</span>
        </div>
      ) : (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
        />
      )}
      {field.key === "tags" && (
        <p className="text-[10.5px] text-slate-400 mt-1">Comma-separated list.</p>
      )}
      {readOnly && (
        <p className="text-[10.5px] text-slate-400 mt-1">
          Fixed to <span className="font-mono">{value}</span> for this registry.
        </p>
      )}
    </div>
  );
};

const RegistrySection = ({ kind }) => {
  const config = REGISTRY_CONFIG[kind];

  // The `type` field is derived from the registry, not user-editable.
  const fixedType = kind === "tools" ? "tool" : kind === "models" ? "model" : "agent";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Import JSON state
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importCandidates, setImportCandidates] = useState([]);
  const [importMessage, setImportMessage] = useState(null);
  const [importSelected, setImportSelected] = useState(0);

  const hasField = useCallback(
    (key) => config.fields.some((f) => f.key === key),
    [config.fields]
  );

  const basicFields = useMemo(
    () => config.fields.filter((f) => f.type !== "params" && f.type !== "outputParams" && f.key !== "version"),
    [config.fields]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listRegistry(kind));
    } catch (err) {
      toast.error(`Could not load ${config.label.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [kind, config.label]);

  useEffect(() => {
    load();
  }, [load]);

  const defaultValues = useMemo(() => {
    const values = {};
    config.fields.forEach((f) => {
      if (f.type === "toggle") values[f.key] = f.key === "isActive" || f.key === "status" ? true : false;
      else if (f.type === "params" || f.type === "outputParams") values[f.key] = [];
      else values[f.key] = "";
    });
    // The registry type/version are fixed, never user-editable.
    values.type = fixedType;
    values.version = kind === "agents" ? "1" : "1.0.0";
    const me = getCurrentUserFromToken();
    if (me?.email) values.createdBy = me.email;
    return values;
  }, [config.fields, fixedType]);

  const openCreate = () => {
    setEditing(null);
    setFormValues(defaultValues);
    resetImport();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    // Rehydrate from the record, then pin the registry type.
    setFormValues({ ...recordToFormValues(kind, record), type: fixedType });
    resetImport();
    setModalOpen(true);
  };

  const resetImport = () => {
    setImportOpen(false);
    setImportText("");
    setImportCandidates([]);
    setImportMessage(null);
    setImportSelected(0);
  };

  const setField = (key, value) =>
    setFormValues((prev) => ({ ...prev, [key]: value }));

  const handleImportChange = (text) => {
    setImportText(text);
    const { candidates, message } = extractParamsFromJson(text);
    setImportCandidates(candidates);
    setImportMessage(message);
    setImportSelected(0);
  };

  const handleImportApply = () => {
    const sel = importCandidates[importSelected];
    if (!sel) return;

    const updates = {};
    if (sel.name && hasField("name")) updates.name = sel.name;
    if (sel.description && hasField("description")) updates.description = sel.description;
    if (Array.isArray(sel.tags) && hasField("tags")) updates.tags = sel.tags.join(", ");
    if (sel.specifications && hasField("specifications")) {
      updates.specifications =
        typeof sel.specifications === "object"
          ? JSON.stringify(sel.specifications, null, 2)
          : String(sel.specifications);
    }
    if (hasField("inputParameters")) {
      updates.inputParameters = paramsToEditor(sel.inputParameters);
    }
    if (hasField("outputParameters")) {
      updates.outputParameters = paramsToEditor(sel.outputParameters, { forceOutputKey: true });
    }

    // The registry `type` and `version` are fixed and must never be overridden by an import.
    delete updates.type;
    delete updates.version;

    setFormValues((prev) => ({ ...prev, ...updates }));
    toast.success("JSON imported — you can continue editing.");
    setImportOpen(false);
  };

  const handleExport = () => {
    const payload = buildPayload(kind, formValues);
    const json = JSON.stringify(payload, null, 2);

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).catch(() => {});
    }

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = (payload.name || config.singular.toLowerCase()).replace(/\s+/g, "-");
    a.download = `${baseName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Exported JSON (copied to clipboard).");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = buildPayload(kind, formValues);
      if (editing?.id) {
        await updateRegistry(kind, editing.id, payload);
        toast.success(`${config.singular} updated.`);
      } else {
        await createRegistry(kind, payload);
        toast.success(`${config.singular} created.`);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast.error(`Failed to save ${config.singular.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete?.id) return;
    setDeleting(true);
    try {
      await deleteRegistry(kind, pendingDelete.id);
      toast.success(`${config.singular} deleted.`);
      setPendingDelete(null);
      await load();
    } catch (err) {
      toast.error(`Failed to delete ${config.singular.toLowerCase()}.`);
    } finally {
      setDeleting(false);
    }
  };

  const tableColumns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <span className="text-[13px] font-semibold text-slate-800">{row.name}</span>
      ),
    },
    { key: "type", label: "Type" },
    {
      key: "tags",
      label: "Tags",
      render: (row) =>
        Array.isArray(row.tags) && row.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
              >
                {tag}
              </span>
            ))}
            {row.tags.length > 3 && (
              <span className="text-[10.5px] text-slate-400">+{row.tags.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    { key: "version", label: "Version" },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const active = row.isActive !== false && row.status !== false;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
              active
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];

  const selectedCandidate = importCandidates[importSelected];

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-800">{config.label}</h2>
          <p className="text-[12.5px] text-slate-500">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={load} className="!text-slate-500 hover:!text-slate-800">
              <RefreshCw size={14} />
            </IconButton>
          </Tooltip>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <Plus size={13} /> Add {config.singular}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <CircularProgress size={24} className="!text-indigo-600" />
        </div>
      ) : (
        <CustomTable
          columns={tableColumns}
          rows={items}
          rowKey="id"
          emptyMessage={`No ${config.label.toLowerCase()} registered yet.`}
          actions={[
            {
              icon: <Pencil size={15} />,
              tooltip: "Edit",
              onClick: openEdit,
            },
            {
              icon: <Trash2 size={15} />,
              tooltip: "Delete",
              color: "error",
              onClick: (row) => setPendingDelete(row),
            },
          ]}
        />
      )}

      {/* Create / Edit modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.08)",
          },
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Braces size={14} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[14px] font-bold text-slate-800 leading-tight">
                {editing ? `Edit ${config.singular}` : `Add ${config.singular}`}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {editing ? editing.name : "Create a new registry entry"}
              </p>
            </div>
          </div>
          <IconButton size="small" onClick={() => setModalOpen(false)} className="!text-slate-400 hover:!text-slate-700">
            <X size={16} />
          </IconButton>
        </div>

        <DialogContent sx={{ p: 0 }}>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Import / Export JSON */}
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setImportOpen((v) => !v)}
                  className="flex-1 flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileJson size={15} className="text-indigo-600" />
                    <span className="text-[12.5px] font-semibold text-slate-700">Import JSON</span>
                    <span className="hidden sm:inline text-[11px] text-slate-400">
                      paste a flow / node spec to auto-fill the fields
                    </span>
                  </span>
                  <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform ${importOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div className="border-l border-slate-100 h-6" />
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-3 text-[12.5px] font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Export the current fields as JSON"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>

              {importOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
                  <textarea
                    value={importText}
                    onChange={(e) => handleImportChange(e.target.value)}
                    placeholder='Paste a JSON spec here — e.g. { "inputParameters": [ { "key": "query", "type": "string", "value": "" } ], "outputParameters": [ { "key": "output", "type": "string", "value": "response" } ] }'
                    rows={5}
                    className="w-full px-3 py-2 text-[11.5px] font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-y"
                  />

                  {importMessage && (
                    <p className="text-[11.5px] text-amber-600">{importMessage}</p>
                  )}

                  {importCandidates.length > 0 && (
                    <>
                      {importCandidates.length > 1 && (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                            Select node to import from
                          </label>
                          <select
                            value={importSelected}
                            onChange={(e) => setImportSelected(Number(e.target.value))}
                            className="w-full h-9 px-2.5 text-[12px] bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                          >
                            {importCandidates.map((c, i) => (
                              <option key={i} value={i}>
                                {c.name || `Node ${i + 1}`} — {c.inputParameters.length} in /{" "}
                                {c.outputParameters.length} out
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {selectedCandidate && (
                        <div className="flex items-center gap-3 text-[11.5px] text-slate-500">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <Braces size={12} />
                            {selectedCandidate.inputParameters.length} input parameter
                            {selectedCandidate.inputParameters.length === 1 ? "" : "s"}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <Braces size={12} />
                            {selectedCandidate.outputParameters.length} output parameter
                            {selectedCandidate.outputParameters.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleImportApply}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                        >
                          <Import size={13} />
                          Apply Import
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Basic information */}
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs p-4">
              <SectionLabel hint="Required fields are marked *">Basic Information</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {basicFields.map((field) => (
                  <div
                    key={field.key}
                    className={
                      field.type === "textarea" || field.type === "json"
                        ? "sm:col-span-2"
                        : "sm:col-span-1"
                    }
                  >
                    <BasicField
                      field={field}
                      value={formValues[field.key]}
                      onChange={(v) => setField(field.key, v)}
                      disabled={saving}
                      readOnly={field.key === "type"}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Input parameters */}
            {hasField("inputParameters") && (
              <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs p-4">
                <SectionLabel hint="Add as many input parameters as you need">
                  Input Parameters
                </SectionLabel>
                <InputParametersEditor
                  params={formValues.inputParameters || []}
                  onChange={(v) => setField("inputParameters", v)}
                />
              </div>
            )}

            {/* Output parameters */}
            {hasField("outputParameters") && (
              <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs p-4">
                <SectionLabel hint="Key is always fixed to 'output'">
                  Output Parameters
                </SectionLabel>
                <OutputParametersEditor
                  params={formValues.outputParameters || []}
                  onChange={(v) => setField("outputParameters", v)}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg shadow-xs transition-colors"
            >
              {saving && <CircularProgress size={12} color="inherit" />}
              {editing ? "Save Changes" : "Create"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        tone="danger"
        title={`Delete ${config.singular.toLowerCase()}?`}
        description={`This will permanently remove "${pendingDelete?.name}" from the registry. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default RegistrySection;