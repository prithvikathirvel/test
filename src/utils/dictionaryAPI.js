import axios from "axios";

/**
 * Dictionary API client.
 *
 * The Global Dictionary service lives on its own host, documented in
 * `DICTIONARY_API_SPEC.md`, which is *not* the host behind `APIKit` (that one
 * resolves through the `/api` rewrite in `next.config`). A dedicated axios
 * instance keeps the two from fighting over `baseURL` while still reusing the
 * same bearer-token convention. `fetchMcpTools` already sets the precedent for
 * calling an absolute third-party URL from this codebase.
 *
 * Override with `NEXT_PUBLIC_DICTIONARY_API_URL` per environment.
 */
export const DICTIONARY_BASE_URL =
  process.env.NEXT_PUBLIC_DICTIONARY_API_URL ||
  "https://apidev.sifymodernization.digital/ai/api/agent-studio";

const DictionaryKit = axios.create({
  baseURL: DICTIONARY_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

DictionaryKit.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Normalises every axios failure into `{ message, code, status }` so the page
 * can render one consistent error surface. The spec's error envelope is
 * `{ status: "error", code, message }`.
 */
const toApiError = (error) => {
  const payload = error?.response?.data;
  return {
    message:
      payload?.message ||
      error?.message ||
      "Unable to reach the dictionary service.",
    code: payload?.code || null,
    status: error?.response?.status ?? null,
  };
};

DictionaryKit.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error))
);

export const DICTIONARY_TYPES = ["text", "number", "boolean", "object", "array"];

/** Spec rule: `^[A-Z0-9_]+$`, max 64 characters. */
export const DICTIONARY_KEY_PATTERN = /^[A-Z0-9_]+$/;
export const DICTIONARY_KEY_MAX_LENGTH = 64;

/**
 * Validates a key against the documented contract.
 * @returns {string|null} An error message, or `null` when the key is valid.
 */
export const validateDictionaryKey = (key) => {
  if (!key) return "Variable key name is required.";
  if (key.length > DICTIONARY_KEY_MAX_LENGTH)
    return `Key must be ${DICTIONARY_KEY_MAX_LENGTH} characters or fewer.`;
  if (!DICTIONARY_KEY_PATTERN.test(key))
    return "Key may only contain uppercase letters, numbers and underscores.";
  return null;
};

/**
 * Validates that `value` conforms to `type` exactly as the spec requires.
 * @returns {string|null} An error message, or `null` when valid.
 */
export const validateDictionaryValue = (type, value) => {
  switch (type) {
    case "object":
      if (typeof value !== "object" || value === null || Array.isArray(value))
        return "Value must be a valid JSON object.";
      return null;
    case "array":
      if (!Array.isArray(value)) return "Value must be a valid JSON array.";
      return null;
    case "number":
      if (typeof value !== "number" || !Number.isFinite(value))
        return "Value must be a finite number.";
      return null;
    case "boolean":
      if (typeof value !== "boolean") return "Value must be true or false.";
      return null;
    case "text":
      if (typeof value !== "string") return "Value must be text.";
      return null;
    default:
      return `Unsupported type "${type}".`;
  }
};

/**
 * Maps an API record onto the shape the page has always rendered.
 * The UI reads `updatedAt`; the API returns `created_at` / `updated_at`.
 */
export const mapDictionaryFromApi = (item) => ({
  id: item?.id,
  key: item?.key || "",
  type: item?.type || "text",
  description: item?.description || "",
  value: item?.value,
  createdBy: item?.created_by || null,
  createdAt: item?.created_at || null,
  updatedAt: item?.updated_at || item?.created_at || null,
});

/** Builds the request body for create/update. */
const toApiPayload = ({ key, type, description, value }) => ({
  key,
  type,
  description: description || "",
  value,
});

/**
 * `GET /dictionary`
 * @returns {Promise<{items: Array, total: number, page: number, limit: number}>}
 */
export const listDictionaries = async (params = {}) => {
  const { type, search, page = 1, limit = 50 } = params;
  const query = { page, limit };
  if (type && type !== "all") query.type = type;
  if (search) query.search = search;

  const response = await DictionaryKit.get("/dictionary", { params: query });
  const data = response?.data?.data || {};
  const items = Array.isArray(data.items) ? data.items : [];

  return {
    items: items.map(mapDictionaryFromApi),
    total: Number.isFinite(data.total) ? data.total : items.length,
    page: data.page ?? page,
    limit: data.limit ?? limit,
  };
};

/** `POST /dictionary` → 201 Created. */
export const createDictionary = async (payload) => {
  const response = await DictionaryKit.post(
    "/dictionary",
    toApiPayload(payload)
  );
  return mapDictionaryFromApi(response?.data?.data || {});
};

/** `PUT /dictionary/:id`. */
export const updateDictionary = async (id, payload) => {
  const response = await DictionaryKit.put(
    `/dictionary/${encodeURIComponent(id)}`,
    toApiPayload(payload)
  );
  return mapDictionaryFromApi(response?.data?.data || { id, ...payload });
};

/** `DELETE /dictionary/:id`. */
export const deleteDictionary = async (id) => {
  const response = await DictionaryKit.delete(
    `/dictionary/${encodeURIComponent(id)}`
  );
  return response?.data?.message || "Global dictionary variable deleted.";
};

export default DictionaryKit;
