/**
 * Flow/node values may be template references such as `{{CHAT_QUERY}}`
 * or `{{global.API_GATEWAY}}`. Those are not JSON and must not be
 * validated or parsed as JSON.
 */
export const isTemplateRef = (value) => {
  if (value == null) return false;
  if (typeof value !== "string") return false;
  return value.trim().startsWith("{{");
};

export const looksLikeJson = (value) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed || isTemplateRef(trimmed)) return false;
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  return (first === "{" && last === "}") || (first === "[" && last === "]");
};

/** Persistable flow inputs: global entries never send `value`. */
export const serializeFlowInputs = (inputs = []) =>
  (Array.isArray(inputs) ? inputs : []).map((input) => {
    const scope = input?.scope === "global" ? "global" : "local";
    const next = {
      key: input?.key || input?.name || "",
      type: input?.type || "text",
      scope,
    };
    if (scope === "local") {
      next.value = input?.value ?? "";
    }
    return next;
  });
