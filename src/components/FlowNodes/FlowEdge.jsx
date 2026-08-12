"use client";

import { memo, useState } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from "reactflow";
import { X } from "lucide-react";

/**
 * Default edge for the studio canvas.
 *
 * Identical visuals to the previous bezier edges, plus a delete affordance that
 * only mounts while the edge is hovered/selected (so we never render N buttons
 * for N edges).
 */
const FlowEdge = memo(function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
  data,
}) {
  const [hovered, setHovered] = useState(false);
  const { deleteElements } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const showDelete = hovered || selected;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {/* Invisible, thick path purely for hit testing. */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={18}
        className="react-flow__edge-interaction"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {showDelete && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <button
              type="button"
              title="Delete connection"
              aria-label="Delete connection"
              onClick={(event) => {
                event.stopPropagation();
                data?.onDelete?.(id);
                // `deleteElements` goes through the same path as the Delete key,
                // so `onEdgesDelete` / the Redux sync still fire exactly once.
                deleteElements({ edges: [{ id }] });
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-500 shadow-sm transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            >
              <X size={11} strokeWidth={3} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export default FlowEdge;
