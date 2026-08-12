"use client";

import { useCallback, useRef, useState } from "react";
import { useReactFlow } from "reactflow";

const MAX_HISTORY = 50;

/**
 * Minimal undo/redo stack for the canvas.
 *
 * A snapshot is taken explicitly (`takeSnapshot`) right before a mutating
 * interaction (drag start, connect, drop, delete, auto-layout ...) instead of
 * on every `nodes`/`edges` change, so typing/dragging does not flood the stack
 * and no extra renders are triggered while the canvas is idle.
 */
export default function useUndoRedo() {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const past = useRef([]);
  const future = useRef([]);
  // Only used to re-render the toolbar buttons; the stacks themselves are refs.
  const [state, setState] = useState({ canUndo: false, canRedo: false });

  const sync = useCallback(() => {
    setState((prev) => {
      const canUndo = past.current.length > 0;
      const canRedo = future.current.length > 0;
      if (prev.canUndo === canUndo && prev.canRedo === canRedo) return prev;
      return { canUndo, canRedo };
    });
  }, []);

  const takeSnapshot = useCallback(() => {
    past.current = [
      ...past.current.slice(past.current.length - MAX_HISTORY + 1),
      { nodes: getNodes(), edges: getEdges() },
    ];
    future.current = [];
    sync();
  }, [getNodes, getEdges, sync]);

  const undo = useCallback(() => {
    const previous = past.current[past.current.length - 1];
    if (!previous) return false;

    past.current = past.current.slice(0, past.current.length - 1);
    future.current = [...future.current, { nodes: getNodes(), edges: getEdges() }];
    setNodes(previous.nodes);
    setEdges(previous.edges);
    sync();
    return true;
  }, [getNodes, getEdges, setNodes, setEdges, sync]);

  const redo = useCallback(() => {
    const next = future.current[future.current.length - 1];
    if (!next) return false;

    future.current = future.current.slice(0, future.current.length - 1);
    past.current = [...past.current, { nodes: getNodes(), edges: getEdges() }];
    setNodes(next.nodes);
    setEdges(next.edges);
    sync();
    return true;
  }, [getNodes, getEdges, setNodes, setEdges, sync]);

  const reset = useCallback(() => {
    past.current = [];
    future.current = [];
    sync();
  }, [sync]);

  return { takeSnapshot, undo, redo, reset, canUndo: state.canUndo, canRedo: state.canRedo };
}
