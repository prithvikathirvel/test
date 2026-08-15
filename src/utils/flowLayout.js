/**
 * Flow layout helpers.
 *
 * The `graphSpec` helpers below were extracted verbatim from
 * `src/app/studio/[id]/page.jsx` so the exact same positions / node shapes are
 * produced as before, but without re-creating the whole algorithm (and its
 * closures) on every render of the Studio page.
 *
 * `getLayoutedElements` is an in-house (no external dependency, no React Flow
 * Pro code) layered auto-layout used by the "Auto layout" canvas action.
 */

const HORIZONTAL_SPACING = 300;
const BASE_VERTICAL_SPACING = 280;
const BASE_NODE_HEIGHT = 75;

/** Edge renderer used for every edge on the canvas (adds hover-to-delete). */
export const FLOW_EDGE_TYPE = "flowEdge";

export const getEdgeStrokeColor = (handleType) =>
  handleType === "true" ? "#4CAF50" : handleType === "false" ? "#F44336" : "#555";

/* -------------------------------------------------------------------------- */
/* graphSpec -> canvas                                                         */
/* -------------------------------------------------------------------------- */

/** Dynamic node height based on type and content. */
export const calculateNodeHeight = (node) => {
  const nodeType = node?.type?.toLowerCase();
  let height = BASE_NODE_HEIGHT;

  // Question nodes have additional content
  if (nodeType === "question") {
    // Base height + question content + options
    height = 140; // Header + question text (increased from 120)
    const optionsParam = node.inputParameters?.find((param) => param.key === "options");
    const optionsCount = optionsParam?.value ? Object.keys(optionsParam.value).length : 0;
    height += Math.max(optionsCount * 45, 70); // Each option adds ~45px, minimum 70px for options section
  }
  // Decision/Condition nodes have additional content
  else if (nodeType === "decision" || nodeType === "conditions" || nodeType === "condition") {
    height = 140; // Header + condition content (increased from 120)
    const conditionParam = node.inputParameters?.find((param) => param.type === "condition");
    const conditionsCount = conditionParam?.value ? conditionParam.value.length : 0;
    height += Math.max(conditionsCount * 50, 70); // Each condition adds ~50px, minimum 70px for conditions section
  }
  // Iterator nodes are slightly taller due to multiple handles
  else if (nodeType === "iterator") {
    height = 110;
  } else if (nodeType === "tool") {
    height = 100;
  } else if (nodeType === "react_agent" || nodeType === "react_agent_v2") {
    const promptParam = node.inputParameters?.find((param) => param.key === "system_prompt");
    const promptLength = String(promptParam?.value || "").length;
    height = 118 + Math.min(28, Math.ceil(promptLength / 90) * 14);
  } else if (nodeType === "agent") {
    height = 105;
  } else if (nodeType === "model") {
    height = 95;
  } else if (nodeType === "inputs" || nodeType === "input") {
    height = 90;
  } else if (nodeType === "output") {
    height = 90;
  } else if (nodeType === "agentflow") {
    height = 100;
  } else {
    height = 85;
  }

  return height;
};

/** Dynamic vertical spacing between two nodes. */
export const calculateVerticalSpacing = (node1, node2) => {
  const height1 = calculateNodeHeight(node1);
  const height2 = calculateNodeHeight(node2);
  const maxHeight = Math.max(height1, height2);

  // Ensure minimum spacing based on the taller node
  return Math.max(BASE_VERTICAL_SPACING, maxHeight + 120); // 120px buffer between nodes
};

/**
 * Calculates the fallback positions for every node of a `graphSpec`.
 * (Nodes that already carry a `position` keep it — see `buildNodesFromGraphSpec`.)
 */
export const calculateGraphSpecPositions = (graphSpec) => {
  const specNodes = graphSpec?.nodes || [];
  const specEdges = graphSpec?.edges || [];

  const adjacencyList = {};
  specEdges.forEach((edge) => {
    if (!adjacencyList[edge.from]) adjacencyList[edge.from] = [];
    adjacencyList[edge.from].push(edge.to);
  });

  const nodeMap = {};
  specNodes.forEach((node) => {
    nodeMap[node.node_id] = node;
  });

  const incomingEdges = {};
  specEdges.forEach((edge) => {
    incomingEdges[edge.to] = (incomingEdges[edge.to] || 0) + 1;
  });

  const rootNodes = specNodes
    .filter((node) => !incomingEdges[node.node_id])
    .map((node) => node.node_id);

  const positions = {};
  const processedNodes = new Set();
  const levelSpaceUsed = {};

  const processNode = (nodeId, level = 0, verticalPosition = 0) => {
    if (processedNodes.has(nodeId)) return;
    processedNodes.add(nodeId);

    if (!levelSpaceUsed[level]) levelSpaceUsed[level] = 0;

    const currentNode = nodeMap[nodeId];
    const children = adjacencyList[nodeId] || [];

    positions[nodeId] = {
      x: level * HORIZONTAL_SPACING,
      y: verticalPosition,
    };

    if (children.length > 0) {
      const nextLevel = level + 1;
      if (!levelSpaceUsed[nextLevel]) levelSpaceUsed[nextLevel] = 0;

      // Calculate dynamic spacing for each child
      const childrenSpacing = [];
      children.forEach((childId) => {
        const childNode = nodeMap[childId];
        childrenSpacing.push(calculateVerticalSpacing(currentNode, childNode));
      });

      // Use the maximum spacing needed
      const maxSpacing = Math.max(...childrenSpacing, BASE_VERTICAL_SPACING);
      const totalStackHeight = (children.length - 1) * maxSpacing;
      const startY = verticalPosition - totalStackHeight / 2;

      children.forEach((childId, index) => {
        const childY = startY + index * maxSpacing;
        processNode(childId, nextLevel, childY);
      });
    }
  };

  rootNodes.forEach((rootId, index) => {
    const rootNode = nodeMap[rootId];
    const rootNodeHeight = calculateNodeHeight(rootNode);
    const rootSpacing = Math.max(BASE_VERTICAL_SPACING * 2, rootNodeHeight + 160);
    const rootY = index * rootSpacing;
    processNode(rootId, 0, rootY);
    levelSpaceUsed[0] = rootY + rootSpacing;
  });

  specNodes.forEach((node) => {
    if (!processedNodes.has(node.node_id)) {
      const disconnectedLevel = Object.keys(levelSpaceUsed).length;
      if (!levelSpaceUsed[disconnectedLevel]) levelSpaceUsed[disconnectedLevel] = 0;

      const verticalPos = levelSpaceUsed[disconnectedLevel];
      positions[node.node_id] = {
        x: disconnectedLevel * HORIZONTAL_SPACING,
        y: verticalPos,
      };

      const nodeHeight = calculateNodeHeight(node);
      const nodeSpacing = Math.max(BASE_VERTICAL_SPACING, nodeHeight + 120);
      levelSpaceUsed[disconnectedLevel] += nodeSpacing;
      processedNodes.add(node.node_id);

      const children = adjacencyList[node.node_id] || [];
      if (children.length > 0) {
        const childrenSpacing = [];
        children.forEach((childId) => {
          const childNode = nodeMap[childId];
          childrenSpacing.push(calculateVerticalSpacing(node, childNode));
        });

        const maxSpacing = Math.max(...childrenSpacing, BASE_VERTICAL_SPACING);
        children.forEach((childId, index) => {
          const childY =
            verticalPos - ((children.length - 1) * maxSpacing) / 2 + index * maxSpacing;
          processNode(childId, disconnectedLevel + 1, childY);
        });
      }
    }
  });

  return positions;
};

/** Maps `graphSpec.nodes` to React Flow nodes (identical shape to the previous inline code). */
export const buildNodesFromGraphSpec = (graphSpec) => {
  const positions = calculateGraphSpecPositions(graphSpec);

  return (graphSpec?.nodes || []).map((node) => {
    const calculatedPosition = positions[node.node_id] || { x: 0, y: 0 };
    const nodeData = {
      ...node,
      id: node.node_id,
      key: node.node_id,
      data: {
        label: node.name || "Unnamed Node",
        name: node.name || "Unnamed Node",
        type: node.type || "default",
        displayName: node.displayName || node.name,
        description: node.description || "",
        inputParameters: node.inputParameters || [],
        outputParameters: node.outputParameters || [],
        next: node.next || [],
      },
      position: {
        x: node.position?.x ?? calculatedPosition.x,
        y: node.position?.y ?? calculatedPosition.y,
      },
    };

    if (node.type === "decision" || node.data?.type === "decision") {
      nodeData.conditionMetPath = node.conditionMetPath || null;
      nodeData.conditionNotMetPath = node.conditionNotMetPath || null;
      nodeData.data.conditionMetPath = node.conditionMetPath || null;
      nodeData.data.conditionNotMetPath = node.conditionNotMetPath || null;
    }

    if (node.type === "question" || node.data?.type === "question") {
      nodeData.interrupt = node.interrupt || false;
      nodeData.data.interrupt = node.interrupt || false;
    }

    return nodeData;
  });
};

/** Maps `graphSpec.edges` to React Flow edges (de-duplicated, same ids/colors as before). */
export const buildEdgesFromGraphSpec = (graphSpec) => {
  const edgeSet = new Set();

  return (graphSpec?.edges || [])
    .filter((edge) => edge.from && edge.to)
    .map((edge) => {
      let handleType = edge.condition;
      if (edge.condition === "conditionMet") {
        handleType = "true";
      } else if (edge.condition === "conditionNotMet") {
        handleType = "false";
      }

      const edgeId = `${edge.from}-${edge.to}-${handleType || ""}`;
      if (edgeSet.has(edgeId)) return null;
      edgeSet.add(edgeId);

      return {
        id: edgeId,
        source: edge.from,
        target: edge.to,
        sourceHandle: handleType,
        type: FLOW_EDGE_TYPE,
        style: { stroke: getEdgeStrokeColor(handleType) },
      };
    })
    .filter(Boolean);
};

/* -------------------------------------------------------------------------- */
/* Auto layout (in-house layered layout, no external dependency)               */
/* -------------------------------------------------------------------------- */

const DEFAULT_NODE_WIDTH = 260;
const DEFAULT_NODE_HEIGHT = 120;

/**
 * Assigns every node to a "rank" (longest path from a root) and packs the ranks
 * along the requested direction. Cycles are tolerated: a node is never demoted
 * more than `nodes.length` times.
 */
export const getLayoutedElements = (nodes = [], edges = [], direction = "LR") => {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];

  const isHorizontal = direction === "LR";
  const rankGap = isHorizontal ? 120 : 90;
  const siblingGap = 40;

  const nodeIds = new Set(nodes.map((node) => node.id));
  const outgoing = new Map();
  const incomingCount = new Map();

  nodes.forEach((node) => {
    outgoing.set(node.id, []);
    incomingCount.set(node.id, 0);
  });

  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return;
    if (edge.source === edge.target) return;
    outgoing.get(edge.source).push(edge.target);
    incomingCount.set(edge.target, incomingCount.get(edge.target) + 1);
  });

  const rank = new Map();
  nodes.forEach((node) => rank.set(node.id, 0));

  const roots = nodes.filter((node) => incomingCount.get(node.id) === 0).map((node) => node.id);
  const queue = roots.length > 0 ? [...roots] : [nodes[0].id];
  const visits = new Map();
  const maxVisits = nodes.length + 1;

  while (queue.length > 0) {
    const current = queue.shift();
    const seen = (visits.get(current) || 0) + 1;
    visits.set(current, seen);
    if (seen > maxVisits) continue; // cycle guard

    const currentRank = rank.get(current);
    outgoing.get(current).forEach((child) => {
      if (rank.get(child) < currentRank + 1) {
        rank.set(child, currentRank + 1);
        queue.push(child);
      } else if (!visits.has(child)) {
        queue.push(child);
      }
    });
  }

  // Group by rank, keeping a stable order based on the current canvas position.
  const ranks = new Map();
  nodes.forEach((node) => {
    const r = rank.get(node.id) || 0;
    if (!ranks.has(r)) ranks.set(r, []);
    ranks.get(r).push(node);
  });

  const sortedRanks = [...ranks.keys()].sort((a, b) => a - b);
  const sizeOf = (node) => ({
    width: node.width || DEFAULT_NODE_WIDTH,
    height: node.height || calculateNodeHeight(node.data || node) || DEFAULT_NODE_HEIGHT,
  });

  // Cross-axis extent of the widest rank, used to center every rank.
  let maxCrossExtent = 0;
  const rankMetrics = new Map();

  sortedRanks.forEach((r) => {
    const group = ranks.get(r);
    group.sort((a, b) =>
      isHorizontal ? a.position.y - b.position.y : a.position.x - b.position.x
    );
    const crossExtent = group.reduce((total, node) => {
      const { width, height } = sizeOf(node);
      return total + (isHorizontal ? height : width) + siblingGap;
    }, -siblingGap);
    const mainExtent = group.reduce((max, node) => {
      const { width, height } = sizeOf(node);
      return Math.max(max, isHorizontal ? width : height);
    }, 0);
    rankMetrics.set(r, { crossExtent, mainExtent });
    maxCrossExtent = Math.max(maxCrossExtent, crossExtent);
  });

  const layouted = [];
  let mainOffset = 0;

  sortedRanks.forEach((r) => {
    const group = ranks.get(r);
    const { crossExtent, mainExtent } = rankMetrics.get(r);
    let crossOffset = (maxCrossExtent - crossExtent) / 2;

    group.forEach((node) => {
      const { width, height } = sizeOf(node);
      const position = isHorizontal
        ? { x: mainOffset, y: crossOffset }
        : { x: crossOffset, y: mainOffset };

      layouted.push({ ...node, position });
      crossOffset += (isHorizontal ? height : width) + siblingGap;
    });

    mainOffset += mainExtent + rankGap;
  });

  // Preserve the incoming node order so React Flow does not remount nodes.
  const byId = new Map(layouted.map((node) => [node.id, node]));
  return nodes.map((node) => byId.get(node.id) || node);
};
