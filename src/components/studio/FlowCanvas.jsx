"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  SelectionMode,
  useReactFlow,
  useNodesInitialized,
} from "reactflow";
import FlowEdge from "@/components/FlowNodes/FlowEdge";
import ConnectionLine from "@/components/FlowNodes/ConnectionLine";
import CanvasToolbar from "@/components/studio/CanvasToolbar";
import TokenUsageWidget from "@/components/studio/TokenUsageWidget";
import NodeContextMenu from "@/components/studio/NodeContextMenu";
import NodeSearchPalette from "@/components/studio/NodeSearchPalette";
import useUndoRedo from "@/hooks/useUndoRedo";
import { getLayoutedElements, FLOW_EDGE_TYPE } from "@/utils/flowLayout";
import { getNodeColor } from "@/utils/commonFunction";

/* ---------------------------------------------------------------------------
 * Module scope constants.
 * Anything passed to <ReactFlow /> that is an object/array/function literal has
 * to be defined once, otherwise React Flow re-runs its store updaters (and, for
 * nodeTypes/edgeTypes, re-creates every node/edge component) on every render.
 * ------------------------------------------------------------------------- */
const EDGE_TYPES = { [FLOW_EDGE_TYPE]: FlowEdge };
const DEFAULT_EDGE_OPTIONS = {
  type: FLOW_EDGE_TYPE,
  style: { stroke: "var(--primary-color)", strokeWidth: 2 },
};
const FLOW_STYLE = { backgroundColor: "#F7F9FB" };
const SNAP_GRID = [16, 16];
const DELETE_KEY_CODES = ["Delete", "Backspace"];
const FIT_VIEW_OPTIONS = { padding: 0.2, duration: 300, maxZoom: 1.2 };
const PRO_OPTIONS = { hideAttribution: false };
const MINIMAP_STYLE = { backgroundColor: "#ffffff" };
const MINIMAP_MASK = "rgb(241, 245, 249, 0.7)";

const viewportStorageKey = (flowId) => `studio:viewport:${flowId}`;

const readStoredViewport = (flowId) => {
  if (typeof window === "undefined" || !flowId) return null;
  try {
    const raw = window.localStorage.getItem(viewportStorageKey(flowId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.x === "number" &&
      typeof parsed?.y === "number" &&
      typeof parsed?.zoom === "number"
    ) {
      return parsed;
    }
  } catch {
    /* corrupted entry — fall back to fitView */
  }
  return null;
};

const isTypingTarget = (target) => {
  if (!target) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable === true
  );
};

const minimapNodeColor = (node) => getNodeColor(node?.data?.type || node?.type);

const FlowCanvas = memo(function FlowCanvas({
  flowId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  onConnect,
  onNodeClick,
  onNodesDeleted,
  onEdgesDeleted,
  onAddSpecNode,
  onAddNodes,
  onOpenNodeDetails,
  sidebarCollapsed = false,
}) {
  const {
    screenToFlowPosition,
    getNodes,
    getEdges,
    setNodes,
    fitView,
    setCenter,
    getViewport,
    deleteElements,
  } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const { takeSnapshot, undo, redo, canUndo, canRedo } = useUndoRedo();

  const [snapToGrid, setSnapToGrid] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const clipboardRef = useRef([]);
  const connectStartRef = useRef(null);
  const pendingConnectionRef = useRef(null);
  const viewportSaveRef = useRef(null);
  const didRestoreViewportRef = useRef(false);

  // Read once, synchronously, so React Flow gets it as `defaultViewport`.
  const [storedViewport] = useState(() => readStoredViewport(flowId));

  /* ----------------------------- viewport persistence -------------------- */
  const persistViewport = useCallback(() => {
    if (typeof window === "undefined" || !flowId) return;
    if (viewportSaveRef.current) clearTimeout(viewportSaveRef.current);
    viewportSaveRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(
          viewportStorageKey(flowId),
          JSON.stringify(getViewport())
        );
      } catch {
        /* storage full / disabled — persistence is best effort */
      }
    }, 300);
  }, [flowId, getViewport]);

  useEffect(
    () => () => {
      if (viewportSaveRef.current) clearTimeout(viewportSaveRef.current);
    },
    []
  );

  // Fit the view once the freshly loaded nodes have been measured, but only when
  // the user has no persisted viewport for this flow.
  useEffect(() => {
    if (!nodesInitialized || didRestoreViewportRef.current) return;
    if (nodes.length === 0) return;
    didRestoreViewportRef.current = true;
    if (!storedViewport) fitView(FIT_VIEW_OPTIONS);
  }, [nodesInitialized, nodes.length, storedViewport, fitView]);

  /* ------------------------------- drag & drop --------------------------- */
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      try {
        const rawSpec = event.dataTransfer.getData("application/node-spec");
        if (!rawSpec) return;
        const spec = JSON.parse(rawSpec);
        if (!spec) return;

        const type = event.dataTransfer.getData("application/reactflow");
        // Proper screen -> flow projection: respects pan, zoom and the real
        // canvas offset instead of the hard coded sidebar/header math.
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

        takeSnapshot();
        onAddSpecNode({ spec, type, position });
      } catch (error) {
        console.error("Error handling node drop:", error);
      }
    },
    [screenToFlowPosition, takeSnapshot, onAddSpecNode]
  );

  /* ------------------------------ connections ---------------------------- */
  const isValidConnection = useCallback(
    (connection) => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (!source || !target) return false;
      // No self loops.
      if (source === target) return false;

      const targetNode = getNodes().find((node) => node.id === target);
      // Nothing may connect *into* a start node.
      const targetType = (targetNode?.data?.type || targetNode?.type || "").toLowerCase();
      if (targetType === "start") return false;

      // No duplicate connection between the same pair of handles.
      const duplicate = getEdges().some(
        (edge) =>
          edge.source === source &&
          edge.target === target &&
          (edge.sourceHandle || null) === (sourceHandle || null) &&
          (edge.targetHandle || null) === (targetHandle || null)
      );
      return !duplicate;
    },
    [getNodes, getEdges]
  );

  const handleConnectStart = useCallback((event, params) => {
    connectStartRef.current = params;
  }, []);

  const handleConnect = useCallback(
    (params) => {
      connectStartRef.current = null;
      takeSnapshot();
      onConnect(params);
    },
    [onConnect, takeSnapshot]
  );

  // Connect-on-drop: releasing a connection over empty canvas opens the palette
  // and wires the newly created node up automatically.
  const handleConnectEnd = useCallback(
    (event) => {
      const start = connectStartRef.current;
      connectStartRef.current = null;
      if (!start?.nodeId) return;

      const targetIsPane = event.target?.classList?.contains("react-flow__pane");
      if (!targetIsPane) return;

      const clientX = event.clientX ?? event.changedTouches?.[0]?.clientX;
      const clientY = event.clientY ?? event.changedTouches?.[0]?.clientY;
      if (clientX == null || clientY == null) return;

      pendingConnectionRef.current = {
        source: start.nodeId,
        sourceHandle: start.handleId,
        position: screenToFlowPosition({ x: clientX, y: clientY }),
      };
      setPaletteOpen(true);
    },
    [screenToFlowPosition]
  );

  /* --------------------------- palette / quick add ----------------------- */
  const openPalette = useCallback(() => {
    pendingConnectionRef.current = null;
    setPaletteOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    pendingConnectionRef.current = null;
    setPaletteOpen(false);
  }, []);

  const handlePaletteSelect = useCallback(
    (entry) => {
      const pending = pendingConnectionRef.current;
      pendingConnectionRef.current = null;

      const position =
        pending?.position ||
        screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });

      takeSnapshot();
      onAddSpecNode({
        spec: entry.spec,
        type: entry.nodeType,
        position,
        connectFrom: pending
          ? { source: pending.source, sourceHandle: pending.sourceHandle }
          : null,
      });
    },
    [screenToFlowPosition, takeSnapshot, onAddSpecNode]
  );

  /* ------------------------------ auto layout ---------------------------- */
  const applyLayout = useCallback(
    (direction) => {
      const currentNodes = getNodes();
      if (currentNodes.length === 0) return;
      takeSnapshot();
      setNodes(getLayoutedElements(currentNodes, getEdges(), direction));
      window.requestAnimationFrame(() => fitView(FIT_VIEW_OPTIONS));
    },
    [getNodes, getEdges, setNodes, fitView, takeSnapshot]
  );

  const layoutHorizontal = useCallback(() => applyLayout("LR"), [applyLayout]);
  const layoutVertical = useCallback(() => applyLayout("TB"), [applyLayout]);
  const handleFitView = useCallback(() => fitView(FIT_VIEW_OPTIONS), [fitView]);
  const toggleSnap = useCallback(() => setSnapToGrid((value) => !value), []);

  /* ---------------------------- copy / paste ----------------------------- */
  const duplicateNodes = useCallback(
    (sourceNodes, offset = 40) => {
      if (!sourceNodes || sourceNodes.length === 0) return;
      takeSnapshot();
      const stamp = Date.now();
      const clones = sourceNodes.map((node, index) => {
        const id = `${node.data?.name || node.name || "node"}_node-${stamp}-${index}-${Math.random()
          .toString(36)
          .slice(2, 9)}`;
        return {
          ...node,
          id,
          key: id,
          selected: false,
          dragging: false,
          position: {
            x: (node.position?.x || 0) + offset,
            y: (node.position?.y || 0) + offset,
          },
          data: { ...node.data, next: [] },
          next: [],
        };
      });
      onAddNodes(clones);
    },
    [onAddNodes, takeSnapshot]
  );

  const copySelection = useCallback(() => {
    const selected = getNodes().filter((node) => node.selected);
    if (selected.length > 0) clipboardRef.current = selected;
  }, [getNodes]);

  const pasteClipboard = useCallback(() => {
    duplicateNodes(clipboardRef.current, 60);
  }, [duplicateNodes]);

  const duplicateSelection = useCallback(() => {
    duplicateNodes(getNodes().filter((node) => node.selected));
  }, [duplicateNodes, getNodes]);

  /* ---------------------------- context menu ----------------------------- */
  const handleNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      id: node.id,
      label: node.data?.displayName || node.data?.name || node.id,
      top: Math.min(event.clientY, window.innerHeight - 200),
      left: Math.min(event.clientX, window.innerWidth - 200),
    });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleContextDuplicate = useCallback(
    (nodeId) => {
      closeContextMenu();
      const node = getNodes().find((item) => item.id === nodeId);
      if (node) duplicateNodes([node]);
    },
    [closeContextMenu, duplicateNodes, getNodes]
  );

  const handleContextDelete = useCallback(
    (nodeId) => {
      closeContextMenu();
      const node = getNodes().find((item) => item.id === nodeId);
      if (!node) return;
      takeSnapshot();
      // Let React Flow own the removal so `onNodesDelete` (Redux sync) and the
      // connected-edge cleanup run through exactly one code path.
      deleteElements({ nodes: [node] });
    },
    [closeContextMenu, deleteElements, getNodes, takeSnapshot]
  );

  const handleContextFocus = useCallback(
    (nodeId) => {
      closeContextMenu();
      const node = getNodes().find((item) => item.id === nodeId);
      if (!node) return;
      setCenter(
        node.position.x + (node.width || 250) / 2,
        node.position.y + (node.height || 100) / 2,
        { zoom: 1.2, duration: 400 }
      );
    },
    [closeContextMenu, getNodes, setCenter]
  );

  /* Disconnects every edge touching a node, leaving the node in place. Uses the
     same `deleteElements` path as regular edge deletion, so React Flow fires the
     usual `onEdgesDelete` + `onEdgesChange` callbacks and the debounced edges
     effect re-derives the specification (`next`, condition paths, etc.) exactly
     as it would for a manual multi-edge delete. */
  const handleContextDisconnect = useCallback(
    (nodeId) => {
      closeContextMenu();
      const connectedEdges = getEdges().filter(
        (edge) => edge.source === nodeId || edge.target === nodeId
      );
      if (connectedEdges.length === 0) return;
      takeSnapshot();
      deleteElements({ edges: connectedEdges });
    },
    [closeContextMenu, getEdges, deleteElements, takeSnapshot]
  );

  const handleContextOpenDetails = useCallback(
    (nodeId) => {
      closeContextMenu();
      const node = getNodes().find((item) => item.id === nodeId);
      if (node) onOpenNodeDetails(node);
    },
    [closeContextMenu, getNodes, onOpenNodeDetails]
  );

  /* --------------------------- keyboard shortcuts ------------------------ */
  useEffect(() => {
    const handler = (event) => {
      const mod = event.ctrlKey || event.metaKey;

      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (mod && event.key.toLowerCase() === "c") {
        copySelection();
        return;
      }
      if (mod && event.key.toLowerCase() === "v") {
        event.preventDefault();
        pasteClipboard();
        return;
      }
      if (mod && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelection();
        return;
      }
      if (event.shiftKey && event.key === "!") {
        event.preventDefault();
        handleFitView();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        // Snapshot before React Flow's own delete handler runs (this listener is
        // registered in the capture phase, React Flow listens on `document`).
        const hasSelection =
          getNodes().some((node) => node.selected) || getEdges().some((edge) => edge.selected);
        if (hasSelection) takeSnapshot();
      }
    };

    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [
    openPalette,
    undo,
    redo,
    copySelection,
    pasteClipboard,
    duplicateSelection,
    handleFitView,
    getNodes,
    getEdges,
    takeSnapshot,
  ]);

  /* -------------------------- mutation snapshots ------------------------- */
  const handleNodeDragStart = useCallback(() => takeSnapshot(), [takeSnapshot]);
  const handleSelectionDragStart = useCallback(() => takeSnapshot(), [takeSnapshot]);

  const handleNodesDelete = useCallback(
    (deleted) => {
      onNodesDeleted(deleted);
    },
    [onNodesDeleted]
  );

  const handleEdgesDelete = useCallback(
    (deleted) => {
      onEdgesDeleted?.(deleted);
    },
    [onEdgesDeleted]
  );

  const defaultViewport = useMemo(
    () => storedViewport || { x: 0, y: 0, zoom: 1 },
    [storedViewport]
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={EDGE_TYPES}
        connectionLineComponent={ConnectionLine}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDragStart={handleNodeDragStart}
        onSelectionDragStart={handleSelectionDragStart}
        onNodesDelete={handleNodesDelete}
        onEdgesDelete={handleEdgesDelete}
        onPaneClick={closeContextMenu}
        onMoveEnd={persistViewport}
        defaultViewport={defaultViewport}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        deleteKeyCode={DELETE_KEY_CODES}
        snapToGrid={snapToGrid}
        snapGrid={SNAP_GRID}
        selectionMode={SelectionMode.Partial}
        nodeDragThreshold={1}
        elevateNodesOnSelect
        elevateEdgesOnSelect
        proOptions={PRO_OPTIONS}
        style={FLOW_STYLE}
      >
        <Background color="#cbd5e1" gap={16} size={1} />
        <Controls className="!bg-white !border !border-slate-200 !rounded-lg !shadow-xs" />
        {/* <MiniMap
          pannable
          zoomable
          nodeColor={minimapNodeColor}
          nodeStrokeWidth={2}
          maskColor={MINIMAP_MASK}
          style={MINIMAP_STYLE}
          className="!bottom-3 !right-3 !rounded-lg !border !border-slate-200 !shadow-sm"
        /> */}
        <CanvasToolbar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onLayoutHorizontal={layoutHorizontal}
          onLayoutVertical={layoutVertical}
          onFitView={handleFitView}
          snapToGrid={snapToGrid}
          onToggleSnap={toggleSnap}
          onOpenSearch={openPalette}
        />
        <TokenUsageWidget sidebarCollapsed={sidebarCollapsed} />
      </ReactFlow>

      <NodeContextMenu
        menu={contextMenu}
        onClose={closeContextMenu}
        onDuplicate={handleContextDuplicate}
        onDelete={handleContextDelete}
        onFocus={handleContextFocus}
        onOpenDetails={handleContextOpenDetails}
        onDisconnect={handleContextDisconnect}
      />

      <NodeSearchPalette
        open={paletteOpen}
        onClose={closePalette}
        onSelect={handlePaletteSelect}
      />
    </div>
  );
});

export default FlowCanvas;
