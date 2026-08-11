/**
 * Validates output variable uniqueness and integrity across all nodes on the canvas.
 * 
 * @param {Array} nodes - List of ReactFlow node objects on the canvas
 * @returns {Object} { isValid: boolean, errors: Array, warnings: Array }
 */
export const validateFlowOutputVariables = (nodes = []) => {
  const errors = [];
  const warnings = [];
  const variableMap = {}; // { [variableKey]: [ { nodeId, nodeName, paramIndex, node } ] }

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return { isValid: true, errors: [], warnings: [] };
  }

  nodes.forEach((node) => {
    const nodeName = node.data?.name || node.name || "Unnamed Node";
    const outputParams = node.data?.outputParameters || node.outputParameters || [];

    const nodeSeenKeys = new Set();

    outputParams.forEach((param, paramIndex) => {
      const rawKey = typeof param === "object" && param !== null
        ? (param.key || param.name || "")
        : String(param || "");
      
      const key = rawKey.trim();

      // Check 1: Empty Output Variable Name
      if (!key) {
        errors.push({
          type: "empty_key",
          variableName: "(empty)",
          nodeId: node.id,
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
          nodeId: node.id,
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
        nodeId: node.id,
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
