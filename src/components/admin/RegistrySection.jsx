"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Plus, X, Pencil, Trash2, RefreshCw } from "lucide-react";
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
} from "@/utils/adminAPI";
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

const Field = ({ field, value, onChange, disabled }) => {
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
          rows={field.type === "json" ? 5 : 3}
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
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-3 py-2 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
      />
      {field.key === "tags" && (
        <p className="text-[10.5px] text-slate-400 mt-1">Comma-separated list.</p>
      )}
    </div>
  );
};

const RegistrySection = ({ kind }) => {
  const config = REGISTRY_CONFIG[kind];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // record being edited, or null for create
  const [formValues, setFormValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      else if (f.type === "tags") values[f.key] = f.key === "agents" ? "" : "";
      else values[f.key] = "";
    });
    // Prefill "createdBy" from the admin's own JWT identity.
    const me = getCurrentUserFromToken();
    if (me?.email) values.createdBy = me.email;
    return values;
  }, [config.fields]);

  const openCreate = () => {
    setEditing(null);
    setFormValues(defaultValues);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setFormValues(recordToFormValues(kind, record));
    setModalOpen(true);
  };

  const setField = (key, value) =>
    setFormValues((prev) => ({ ...prev, [key]: value }));

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
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" },
        }}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 bg-white">
          <h3 className="text-[14px] font-bold text-slate-800">
            {editing ? `Edit ${config.singular}` : `Add ${config.singular}`}
          </h3>
          <IconButton size="small" onClick={() => setModalOpen(false)} className="!text-slate-400 hover:!text-slate-700">
            <X size={16} />
          </IconButton>
        </div>

        <DialogContent sx={{ p: 0 }}>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {config.fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={formValues[field.key]}
                onChange={(v) => setField(field.key, v)}
                disabled={saving}
              />
            ))}
          </div>
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
