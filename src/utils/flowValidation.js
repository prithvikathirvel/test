/**
 * Validates output variable uniqueness and integrity across all nodes on the canvas.
 * 
 * @param {Array} nodes - List of ReactFlow node objects on the canvas
 * @returns {Object} { isValid: boolean, errors: Array, warnings: Array }
 */
/**
 * Resolves the variable name an output parameter maps to.
 *
 * New format: `{ key: "output", value: "response" }` — the name is `value`.
 * Legacy format: `{ key: "formatted_output", value: "" }` — the name is `key`.
 * Prefer `value` when it is a non-empty string, otherwise fall back gracefully.
 */
const resolveOutputVariableName = (param) => {
  if (typeof param === "string") return param;
  if (!param || typeof param !== "object") return "";

  const value = param.value;
  if (typeof value === "string" && value.trim() !== "") return value;

  if (typeof param.key === "string" && param.key.trim() !== "") return param.key;
  if (typeof param.name === "string" && param.name.trim() !== "") return param.name;

  return "";
};

export const validateFlowOutputVariables = (nodes = []) => {
  const errors = [];
  const warnings = [];
  const variableMap = {}; // { [variableKey]: [ { nodeId, nodeName, paramIndex, node } ] }

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return { isValid: true, errors: [], warnings: [] };
  }

  nodes.forEach((node) => {
    const nodeId = node.id || node.node_id;
    const nodeName = node.data?.displayName || node.displayName || node.data?.name || node.name || nodeId || "Unnamed Node";
    const outputParams = node.data?.outputParameters || node.outputParameters || [];

    const nodeSeenKeys = new Set();

    outputParams.forEach((param, paramIndex) => {
      // An output parameter's *variable name* now lives in `value` (the `key`
      // is always the fixed literal "output"). Fall back to `key`/`name` for
      // legacy payloads where the variable name was stored on the key.
      const rawKey = typeof param === "object" && param !== null
        ? resolveOutputVariableName(param)
        : String(param || "");

      const key = rawKey.trim();

      // Check 1: Empty Output Variable Name
      if (!key) {
        errors.push({
          type: "empty_key",
          variableName: "(empty)",
          nodeId: nodeId,
          nodeName: nodeName,
          node: node,
          paramIndex,
          message: `Node "${nodeName}" has an output parameter with an empty variable name. Every output variable must have a name.`,
        });
        return;
      }

      // Check 2: Duplicate within the same node
      if (nodeSeenKeys.has(key)) {
        errors.push({
          type: "duplicate_in_node",
          variableName: key,
          nodeId: nodeId,
          nodeName: nodeName,
          node: node,
          paramIndex,
          message: `Node "${nodeName}" defines duplicate output variable "${key}" more than once.`,
        });
      } else {
        nodeSeenKeys.add(key);
      }

      // Track occurrences across all nodes for cross-node collision detection
      if (!variableMap[key]) {
        variableMap[key] = [];
      }
      variableMap[key].push({
        nodeId: nodeId,
        nodeName: nodeName,
        node: node,
        paramIndex,
      });
    });
  });

  // Check 3: Duplicate output variable names across different nodes
  Object.entries(variableMap).forEach(([varKey, occurrences]) => {
    if (occurrences.length > 1) {
      const nodeNames = occurrences.map((o) => `"${o.nodeName}"`).join(" and ");
      errors.push({
        type: "cross_node_collision",
        variableName: varKey,
        occurrences,
        message: `Output variable "${varKey}" is duplicated in multiple nodes: ${nodeNames}. Please give each output a unique variable name to prevent runtime data overwrites.`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
