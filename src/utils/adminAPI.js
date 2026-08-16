import APIKit from "@/utils/APIKit";

/**
 * Admin registry API + declarative field/parameter configuration.
 *
 * Endpoints follow the existing studioSlice convention (APIKit's `/api` base is
 * rewritten to the agent-studio service), mirroring the OpenAPI paths:
 *
 *   GET    /tools          -> list tools        (OpenAPI /agent-studio/tools)
 *   POST   /tool           -> create tool       (OpenAPI /agent-studio/tool)
 *   PUT    /tool/{id}      -> update tool
 *   DELETE /tool/{id}      -> delete tool
 *   (same pattern for /models, /agents; /users is read-only)
 */

export const REGISTRY_KINDS = ["tools", "models", "agents"];

const ENDPOINTS = {
  tools: { list: "/tools", item: "/tool" },
  models: { list: "/models", item: "/model" },
  agents: { list: "/agents", item: "/agent" },
};

export const listRegistry = async (kind) => {
  const separator = ENDPOINTS[kind].list.includes("?") ? "&" : "?";
  const { data } = await APIKit.get(`${ENDPOINTS[kind].list}${separator}status=all`);
  return Array.isArray(data) ? data : [];
};

export const createRegistry = async (kind, payload) => {
  const { data } = await APIKit.post(ENDPOINTS[kind].item, payload);
  return data;
};

export const updateRegistry = async (kind, id, payload) => {
  const { data } = await APIKit.put(`${ENDPOINTS[kind].item}/${encodeURIComponent(id)}`, payload);
  return data;
};

export const deleteRegistry = async (kind, id) => {
  const { data } = await APIKit.delete(`${ENDPOINTS[kind].item}/${encodeURIComponent(id)}`);
  return data;
};

export const listUsers = async () => {
  const { data } = await APIKit.get("/users");
  return Array.isArray(data) ? data : [];
};

export const listFlows = async () => {
  const { data } = await APIKit.get("/agent-flows");
  return Array.isArray(data) ? data : [];
};

/* ---------------------------------------------------------------------------
 * Parameter handling
 *
 * Input / output parameters are modelled as structured lists, not free-form
 * JSON. Each input parameter is `{ key, type, value }`; each output parameter
 * is `{ key: "output", type, value }` (the key is fixed).
 *
 * In the editor, `value` is kept as a string (or a native boolean for the
 * `boolean` type) so typing is natural; it is converted to/from the API's
 * native types (number / boolean / JSON array / JSON object) at the boundary.
 * ------------------------------------------------------------------------- */

export const PARAM_TYPE_OPTIONS = [
  { value: "string", label: "String" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "array", label: "Array (JSON)" },
  { value: "json", label: "JSON / Object" },
  { value: "dropdown", label: "Dropdown" },
];

/** Whether a param type holds structured (array/object) data. */
const isStructuredType = (type) => {
  const t = String(type || "").toLowerCase();
  return t === "array" || t === "json" || t === "object";
};

/** Native value -> editor value (string, or boolean for `boolean` type). */
export const paramValueToEditor = (type, raw) => {
  const t = String(type || "string").toLowerCase();

  if (t === "boolean") {
    return raw === true || raw === "true";
  }

  if (t === "number") {
    if (raw === "" || raw == null) return "";
    return String(raw);
  }

  if (isStructuredType(t)) {
    if (raw == null || raw === "") return "";
    if (typeof raw === "string") return raw; // already a JSON string
    try {
      return JSON.stringify(raw, null, 2);
    } catch {
      return String(raw);
    }
  }

  return raw == null ? "" : String(raw);
};

/** Native param object -> editor param object. */
export const paramToEditor = (param) => ({
  key: param?.key ?? "",
  type: param?.type || "string",
  value: paramValueToEditor(param?.type, param?.value),
  dropdownOptions: Array.isArray(param?.dropdownOptions)
    ? param.dropdownOptions
    : param?.dropdownOptions
    ? [param.dropdownOptions]
    : undefined,
  description: param?.description,
});

export const paramsToEditor = (params, { forceOutputKey = false } = {}) =>
  (Array.isArray(params) ? params : []).map((p) => {
    const editor = paramToEditor(p);
    if (forceOutputKey) editor.key = "output";
    return editor;
  });

/** Editor value -> native value. */
export const editorValueToNative = (type, value) => {
  const t = String(type || "string").toLowerCase();

  if (t === "boolean") return value === true || value === "true";

  if (t === "number") {
    if (value === "" || value == null) return "";
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  }

  if (isStructuredType(t)) {
    if (value == null || String(value).trim() === "") {
      return t === "array" ? [] : {};
    }
    try {
      return JSON.parse(value);
    } catch {
      return value; // leave as-is if it can't be parsed yet
    }
  }

  return value ?? "";
};

/** Editor param object -> native param object. */
export const paramFromEditor = (param) => {
  const out = {
    key: param.key ?? "",
    type: param.type || "string",
    value: editorValueToNative(param.type, param.value),
  };
  if (Array.isArray(param.dropdownOptions) && param.dropdownOptions.length) {
    out.dropdownOptions = param.dropdownOptions;
  }
  if (param.description) out.description = param.description;
  return out;
};

export const paramsFromEditor = (params) =>
  (Array.isArray(params) ? params : []).map(paramFromEditor);

/* ---------------------------------------------------------------------------
 * Registry field configuration
 * ------------------------------------------------------------------------- */

/**
 * Field definitions. Each registry's "required" fields (per the OpenAPI
 * schemas) are surfaced with user-friendly labels, toggles and editors.
 *
 * type:
 *   "text"        — single-line input
 *   "textarea"    — multi-line input
 *   "json"        — JSON textarea (specifications)
 *   "toggle"      — on/off switch (status / isPublic / isActive)
 *   "tags"        — comma-separated list
 *   "params"      — structured Input Parameters editor
 *   "outputParams"— structured Output Parameters editor (key fixed to "output")
 */
export const REGISTRY_CONFIG = {
  tools: {
    label: "Tools Registry",
    singular: "Tool",
    description: "Register and manage the HTTP / API tools available to agents.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. web-search" },
      { key: "type", label: "Type", type: "text", required: true, placeholder: "e.g. http" },
      { key: "tags", label: "Tags", type: "tags", required: true, placeholder: "search, nlp" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Performs a web search query." },
      { key: "specifications", label: "Specifications (JSON)", type: "json", required: true, placeholder: '{ "endpoint": "https://...", "method": "POST" }' },
      { key: "inputParameters", label: "Input Parameters", type: "params", required: true },
      { key: "outputParameters", label: "Output Parameters", type: "outputParams", required: true },
      { key: "status", label: "Status", type: "toggle", required: true, help: "Whether this tool is enabled." },
      { key: "isPublic", label: "Public", type: "toggle", required: true, help: "Visible to other users in the workspace." },
      { key: "isActive", label: "Active", type: "toggle", required: true, help: "Currently available for use in flows." },
      { key: "createdBy", label: "Created By", type: "text", required: true, placeholder: "user@example.com" },
    ],
  },
  models: {
    label: "Models Registry",
    singular: "Model",
    description: "Register the LLM / ML models agents can invoke.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. gpt-4o" },
      { key: "type", label: "Type", type: "text", required: true, placeholder: "e.g. llm" },
      { key: "tags", label: "Tags", type: "tags", required: true, placeholder: "openai, chat" },
      { key: "description", label: "Description", type: "textarea", placeholder: "OpenAI GPT-4o model." },
      { key: "specifications", label: "Specifications (JSON)", type: "json", required: true, placeholder: '{ "provider": "openai", "version": "2024-08-01-preview", "authentication": { "type": "api-key", "key": "sk-..." } }' },
      { key: "inputParameters", label: "Input Parameters", type: "params", required: true },
      { key: "outputParameters", label: "Output Parameters", type: "outputParams", required: true },
      { key: "status", label: "Status", type: "toggle", required: false, help: "Whether this model is enabled." },
      { key: "isPublic", label: "Public", type: "toggle", required: true, help: "Visible to other users in the workspace." },
      { key: "isActive", label: "Active", type: "toggle", required: true, help: "Currently available for use in flows." },
      { key: "createdBy", label: "Created By", type: "text", required: true, placeholder: "user@example.com" },
    ],
  },
  agents: {
    label: "Agents Registry",
    singular: "Agent",
    description: "Register the autonomous agents available for orchestration.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. research-agent" },
      { key: "type", label: "Type", type: "text", required: true, placeholder: "e.g. llm" },
      { key: "tags", label: "Tags", type: "tags", required: true, placeholder: "research, nlp" },
      { key: "description", label: "Description", type: "textarea", placeholder: "An agent that performs research tasks." },
      { key: "tools", label: "Tools (IDs)", type: "tags", required: true, placeholder: "tool-id-1, tool-id-2" },
      { key: "agents", label: "Sub-agents (IDs)", type: "tags", required: true, placeholder: "(leave empty if none)" },
      { key: "specifications", label: "Specifications (JSON)", type: "json", required: true, placeholder: '{ "endpoint": "https://...", "authentication": { "type": "bearer", "token": "..." } }' },
      { key: "inputParameters", label: "Input Parameters", type: "params", required: true },
      { key: "outputParameters", label: "Output Parameters", type: "outputParams", required: true },
      { key: "status", label: "Status", type: "toggle", required: true, help: "Whether this agent is enabled." },
      { key: "isPublic", label: "Public", type: "toggle", required: true, help: "Visible to other users in the workspace." },
      { key: "isActive", label: "Active", type: "toggle", required: true, help: "Currently available for use in flows." },
      { key: "createdBy", label: "Created By", type: "text", required: true, placeholder: "user@example.com" },
    ],
  },
};

/**
 * Builds a request body from raw form values (parses JSON + tag lists + the
 * structured parameter editors).
 */
export const buildPayload = (kind, values) => {
  const config = REGISTRY_CONFIG[kind];
  const payload = {};
  config.fields.forEach((field) => {
    let value = values[field.key];
    if (field.type === "json") {
      value = safeParseJson(value, {});
    } else if (field.type === "tags") {
      value = (value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (field.type === "toggle") {
      value = Boolean(value);
    } else if (field.type === "params" || field.type === "outputParams") {
      value = paramsFromEditor(value);
    }
    payload[field.key] = value;
  });
  payload.version = values.version || (kind === "agents" ? "1" : "1.0.0");
  return payload;
};

const safeParseJson = (value, fallback) => {
  if (value == null || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

/** Flattens a record into editable form values (objects -> pretty JSON, etc.). */
export const recordToFormValues = (kind, record) => {
  const config = REGISTRY_CONFIG[kind];
  const values = {};
  config.fields.forEach((field) => {
    const raw = record?.[field.key];
    if (field.type === "json") {
      values[field.key] =
        raw == null || raw === "" ? "" : JSON.stringify(raw, null, 2);
    } else if (field.type === "tags") {
      values[field.key] = Array.isArray(raw) ? raw.join(", ") : raw ?? "";
    } else if (field.type === "params") {
      values[field.key] = paramsToEditor(raw);
    } else if (field.type === "outputParams") {
      values[field.key] = paramsToEditor(raw, { forceOutputKey: true });
    } else {
      values[field.key] = raw ?? "";
    }
  });
  return values;
};

/**
 * Extracts registry fields (name, description, tags, type, version,
 * specifications) and input/output parameters from a pasted JSON spec.
 *
 * Accepts, in order of precedence:
 *   1. A plain array of parameters            -> input parameters.
 *   2. A node object with `inputParameters` / `outputParameters` (and any of
 *      the scalar fields above).
 *   3. A flow object with `graphSpec.nodes`  -> every node becomes a candidate
 *      the user can pick from.
 *
 * @returns {{ candidates: Array<{
 *   name, description, tags, type, version, specifications,
 *   inputParameters, outputParameters
 * }>, message: string|null }}
 */
export const extractParamsFromJson = (text) => {
  if (!text || !String(text).trim()) {
    return { candidates: [], message: "Paste a JSON spec to import." };
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    return { candidates: [], message: `Invalid JSON: ${err.message}` };
  }

  const emptyCandidate = () => ({
    name: null,
    description: null,
    tags: null,
    type: null,
    version: null,
    specifications: null,
    inputParameters: [],
    outputParameters: [],
  });

  const fromObject = (obj) => {
    const c = emptyCandidate();
    if (obj?.name) c.name = obj.name;
    else if (obj?.displayName) c.name = obj.displayName;
    if (obj?.description) c.description = obj.description;
    if (obj?.tags != null) c.tags = Array.isArray(obj.tags) ? obj.tags : [];
    if (obj?.type) c.type = obj.type;
    if (obj?.version != null) c.version = obj.version;
    if (obj?.specifications != null) c.specifications = obj.specifications;
    c.inputParameters = Array.isArray(obj?.inputParameters) ? obj.inputParameters : [];
    c.outputParameters = Array.isArray(obj?.outputParameters) ? obj.outputParameters : [];
    return c;
  };

  // 1. Plain array of parameters.
  if (Array.isArray(json)) {
    const c = emptyCandidate();
    c.inputParameters = json;
    return { candidates: [c], message: null };
  }

  if (json && typeof json === "object") {
    // 2. A single node object.
    if (Array.isArray(json.inputParameters) || Array.isArray(json.outputParameters)) {
      return { candidates: [fromObject(json)], message: null };
    }

    // 3. A full flow.
    if (json.graphSpec && Array.isArray(json.graphSpec.nodes)) {
      const nodes = json.graphSpec.nodes.map((n) => fromObject(n));
      if (nodes.length === 0) {
        return { candidates: [], message: "No nodes found in this flow." };
      }
      return { candidates: nodes, message: null };
    }
  }

  return {
    candidates: [],
    message: "Could not find inputParameters / outputParameters in this JSON.",
  };
};
