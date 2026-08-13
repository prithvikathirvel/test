import APIKit from "@/utils/APIKit";

/**
 * Admin registry API + declarative field/column configuration.
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
  const { data } = await APIKit.get(ENDPOINTS[kind].list);
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

/**
 * Field definitions. Each registry's "required" fields (per the OpenAPI
 * schemas) are surfaced with user-friendly labels, toggles and JSON editors.
 *
 * type: "text" | "textarea" | "json" | "toggle" | "tags"
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
      { key: "inputParameters", label: "Input Parameters (JSON)", type: "json", required: true, placeholder: '{ "query": { "type": "string", "required": true } }' },
      { key: "outputParameters", label: "Output Parameters (JSON)", type: "json", required: true, placeholder: '{ "results": { "type": "array" } }' },
      { key: "status", label: "Status", type: "toggle", required: true, help: "Whether this tool is enabled." },
      { key: "isPublic", label: "Public", type: "toggle", required: true, help: "Visible to other users in the workspace." },
      { key: "isActive", label: "Active", type: "toggle", required: true, help: "Currently available for use in flows." },
      { key: "version", label: "Version", type: "text", required: true, placeholder: "1.0.0" },
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
      { key: "inputParameters", label: "Input Parameters (JSON)", type: "json", required: true, placeholder: '{ "temperature": { "type": "number", "default": 0.7 } }' },
      { key: "outputParameters", label: "Output Parameters (JSON)", type: "json", required: true, placeholder: '{ "response": { "type": "string" } }' },
      { key: "status", label: "Status", type: "toggle", required: false, help: "Whether this model is enabled." },
      { key: "isPublic", label: "Public", type: "toggle", required: true, help: "Visible to other users in the workspace." },
      { key: "isActive", label: "Active", type: "toggle", required: true, help: "Currently available for use in flows." },
      { key: "version", label: "Version", type: "text", required: true, placeholder: "1.0.0" },
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
      { key: "inputParameters", label: "Input Parameters (JSON)", type: "json", required: true, placeholder: '{ "query": { "type": "string" } }' },
      { key: "outputParameters", label: "Output Parameters (JSON)", type: "json", required: true, placeholder: '{ "answer": { "type": "string" } }' },
      { key: "status", label: "Status", type: "toggle", required: true, help: "Whether this agent is enabled." },
      { key: "isPublic", label: "Public", type: "toggle", required: true, help: "Visible to other users in the workspace." },
      { key: "isActive", label: "Active", type: "toggle", required: true, help: "Currently available for use in flows." },
      { key: "version", label: "Version", type: "text", required: true, placeholder: "1" },
      { key: "createdBy", label: "Created By", type: "text", required: true, placeholder: "user@example.com" },
    ],
  },
};

/** Builds a request body from raw form values (parses JSON + tag lists). */
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
    }
    payload[field.key] = value;
  });
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

/** Flattens a record into editable form values (objects -> pretty JSON). */
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
    } else {
      values[field.key] = raw ?? "";
    }
  });
  return values;
};
