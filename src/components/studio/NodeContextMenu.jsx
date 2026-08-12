"use client";

import { memo, useEffect, useRef } from "react";
import { Copy, Trash2, Crosshair, Settings2 } from "lucide-react";

const itemClass =
  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-700 transition-colors hover:bg-slate-100";

/**
 * Right-click menu for a node. Positioned in screen coordinates and rendered
 * outside of the React Flow viewport so it never re-renders on pan/zoom.
 */
const NodeContextMenu = memo(function NodeContextMenu({
  menu,
  onClose,
  onDuplicate,
  onDelete,
  onFocus,
  onOpenDetails,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!menu) return undefined;
    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  return (
    <div
      ref={ref}
      style={{ top: menu.top, left: menu.left }}
      className="fixed z-[1300] min-w-[176px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
    >
      <p className="truncate px-3 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {menu.label}
      </p>
      <button type="button" className={itemClass} onClick={() => onOpenDetails(menu.id)}>
        <Settings2 size={13} className="text-slate-400" /> Open settings
      </button>
      <button type="button" className={itemClass} onClick={() => onDuplicate(menu.id)}>
        <Copy size={13} className="text-slate-400" /> Duplicate
        <span className="ml-auto text-[10px] text-slate-400">Ctrl+D</span>
      </button>
      <button type="button" className={itemClass} onClick={() => onFocus(menu.id)}>
        <Crosshair size={13} className="text-slate-400" /> Focus node
      </button>
      <div className="my-1 h-px bg-slate-100" />
      <button
        type="button"
        className={`${itemClass} !text-rose-600 hover:!bg-rose-50`}
        onClick={() => onDelete(menu.id)}
      >
        <Trash2 size={13} /> Delete
        <span className="ml-auto text-[10px] text-rose-300">Del</span>
      </button>
    </div>
  );
});

export default NodeContextMenu;
