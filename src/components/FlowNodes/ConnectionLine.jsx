"use client";

import { memo } from "react";
import { getBezierPath } from "reactflow";

/**
 * Animated connection line shown while the user drags from a handle.
 * `connectionStatus` is supplied by React Flow: "valid" when the pointer is
 * over a compatible handle (respecting `isValidConnection`), "invalid" when it
 * is over an incompatible one, `null` over empty canvas.
 */
const ConnectionLine = memo(function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  connectionStatus,
}) {
  const [path] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  const stroke =
    connectionStatus === "valid"
      ? "#10b981"
      : connectionStatus === "invalid"
      ? "#f43f5e"
      : "#6366f1";

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeDasharray="6 4"
        className="studio-connection-line"
      />
      <circle cx={toX} cy={toY} r={4} fill={stroke} stroke="#fff" strokeWidth={1.5} />
    </g>
  );
});

export default ConnectionLine;
