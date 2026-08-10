"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer, Box, Tooltip } from "@mui/material";
import {
  LayoutDashboard,
  Workflow,
  Database,
  Waypoints,
  Settings,
  ChevronLeft,
  ChevronRight,
  Command
} from "lucide-react";

const Menus = [
  { title: "Overview", icon: <LayoutDashboard size={17} />, path: "/dashboard" },
  { title: "Workflows", icon: <Workflow size={17} />, path: "/studio" },
  { title: "Knowledge", icon: <Database size={17} />, path: "/knowledge" },
  { title: "Graph", icon: <Waypoints size={17} />, path: "/knowledge-graph" },
  { title: "Settings", icon: <Settings size={17} />, path: "/settings" },
];

export default function Sidenav() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 220 : 64,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 220 : 64,
          backgroundColor: "#ffffff",
          color: "#18181b",
          borderRight: "1px solid #e4e4e7",
          transition: "width 0.2s ease-in-out",
          overflowX: "hidden",
        },
      }}
    >
      <Box className="flex flex-col h-full justify-between select-none bg-white">
        {/* Logo Header */}
        <Box>
          <Box className="flex items-center justify-between px-3.5 h-14 border-b border-zinc-200/80">
            <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
              <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
                <Command size={15} className="text-white" />
              </div>
              {open && (
                <span className="text-sm font-semibold tracking-tight text-zinc-900">
                  Sify Aurora
                </span>
              )}
            </Link>

            <button
              onClick={() => setOpen(!open)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            >
              {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </Box>

          {/* Navigation Links */}
          <Box className="py-3 px-2.5 space-y-0.5">
            {Menus.map((menu) => {
              const isActive = pathname === menu.path || pathname.startsWith(menu.path + "/");

              const content = (
                <div
                  className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-2 transition-colors cursor-pointer text-xs ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 font-semibold"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
                  }`}
                >
                  <span className={`shrink-0 ${isActive ? "text-zinc-900" : "text-zinc-500"}`}>
                    {menu.icon}
                  </span>
                  {open && <span className="truncate">{menu.title}</span>}
                </div>
              );

              return (
                <Link href={menu.path} key={menu.title} className="block no-underline">
                  {open ? (
                    content
                  ) : (
                    <Tooltip title={menu.title} placement="right" arrow>
                      {content}
                    </Tooltip>
                  )}
                </Link>
              );
            })}
          </Box>
        </Box>

        {/* Minimal Footer */}
        <Box className="p-3 border-t border-zinc-200/80">
          {open ? (
            <div className="flex items-center justify-between px-2 py-1 text-xs text-zinc-500 font-medium">
              <span>Workspace</span>
              <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                PROD
              </span>
            </div>
          ) : (
            <div className="flex justify-center text-[10px] font-mono text-zinc-400">
              PROD
            </div>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
