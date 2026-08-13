"use client";

import { Plus, Trash2, Lock } from "lucide-react";
import { PARAM_TYPE_OPTIONS } from "@/utils/adminAPI";

const selectClass =
  "h-9 px-2.5 text-[12px] bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all";
const inputClass =
  "h-9 px-2.5 text-[12px] bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all";
const textareaClass =
  "px-2.5 py-1.5 text-[11.5px] font-mono bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-y";

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
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

/** Type-aware value editor. */
const ValueInput = ({ type, value, onChange }) => {
  const t = (type || "string").toLowerCase();

  if (t === "boolean") {
    return (
      <div className="flex h-9 items-center px-1">
        <Toggle checked={value === true || value === "true"} onChange={onChange} />
      </div>
    );
  }

  if (t === "number") {
    return (
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className={`${inputClass} w-full`}
      />
    );
  }

  if (t === "array" || t === "json" || t === "object") {
    return (
      <textarea
        rows={2}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t === "array" ? '[ "item" ]' : '{ "field": "value" }'}
        className={`${textareaClass} w-full`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="value"
      className={`${inputClass} w-full`}
    />
  );
};

const ParamRow = ({
  param,
  index,
  onUpdate,
  onRemove,
  fixedKey = false,
}) => {
  const update = (patch) => onUpdate(index, { ...param, ...patch });

  return (
    <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5 space-y-2">
      <div className="grid grid-cols-[1fr_130px_1.5fr_auto] gap-2 items-start">
        {/* Key */}
        {fixedKey ? (
          <div className="flex h-9 items-center gap-1.5 px-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500">
            <Lock size={11} className="text-slate-400 shrink-0" />
            <span className="text-[11.5px] font-mono font-medium truncate">output</span>
          </div>
        ) : (
          <input
            type="text"
            value={param.key ?? ""}
            onChange={(e) => update({ key: e.target.value })}
            placeholder="key"
            className={`${inputClass} w-full font-mono`}
          />
        )}

        {/* Type */}
        <select
          value={param.type || "string"}
          onChange={(e) => update({ type: e.target.value })}
          className={`${selectClass} w-full`}
        >
          {PARAM_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Value */}
        <ValueInput
          type={param.type}
          value={param.value}
          onChange={(v) => update({ value: v })}
        />

        {/* Remove */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Remove parameter"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Optional dropdown options */}
      {(param.type || "").toLowerCase() === "dropdown" && (
        <div className="pl-1">
          <label className="block text-[10.5px] font-medium text-slate-500 mb-1">
            Dropdown options (comma-separated)
          </label>
          <input
            type="text"
            value={Array.isArray(param.dropdownOptions) ? param.dropdownOptions.join(", ") : ""}
            onChange={(e) =>
              update({
                dropdownOptions: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Option A, Option B"
            className={`${inputClass} w-full`}
          />
        </div>
      )}
    </div>
  );
};

const AddButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors"
  >
    <Plus size={13} />
    {children}
  </button>
);

/**
 * Editor for `inputParameters`. Each row is `{ key, type, value }`; the user can
 * add as many as needed.
 */
export const InputParametersEditor = ({ params = [], onChange }) => {
  const update = (index, patch) => {
    const next = [...params];
    next[index] = patch;
    onChange(next);
  };
  const remove = (index) => onChange(params.filter((_, i) => i !== index));
  const add = () =>
    onChange([...(params || []), { key: "", type: "string", value: "" }]);

  return (
    <div className="space-y-2">
      {(params || []).map((param, index) => (
        <ParamRow
          key={index}
          param={param}
          index={index}
          onUpdate={update}
          onRemove={remove}
        />
      ))}
      {(!params || params.length === 0) && (
        <p className="text-[11.5px] text-slate-400 py-2">No input parameters yet.</p>
      )}
      <AddButton onClick={add}>Add Input Parameter</AddButton>
    </div>
  );
};

/**
 * Editor for `outputParameters`. The key is always the fixed literal `output`;
 * only `type` and `value` are editable.
 */
export const OutputParametersEditor = ({ params = [], onChange }) => {
  const update = (index, patch) => {
    const next = [...params];
    next[index] = { ...patch, key: "output" };
    onChange(next);
  };
  const remove = (index) => onChange(params.filter((_, i) => i !== index));
  const add = () =>
    onChange([...(params || []), { key: "output", type: "string", value: "" }]);

  return (
    <div className="space-y-2">
      {(params || []).map((param, index) => (
        <ParamRow
          key={index}
          param={param}
          index={index}
          onUpdate={update}
          onRemove={remove}
          fixedKey
        />
      ))}
      {(!params || params.length === 0) && (
        <p className="text-[11.5px] text-slate-400 py-2">No output parameters yet.</p>
      )}
      <AddButton onClick={add}>Add Output Parameter</AddButton>
    </div>
  );
};
