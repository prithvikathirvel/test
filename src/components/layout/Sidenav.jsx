"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Drawer, Typography, Tooltip, IconButton } from "@mui/material";
import {
  LayoutDashboard,
  Settings,
  BookOpen,
  Share2,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";

const Menus = [
  { 
    title: "Flow Studio", 
    icon: <LayoutDashboard size={18} />, 
    path: "/studio" 
  },
  { 
    title: "Knowledge Base", 
    icon: <BookOpen size={18} />, 
    path: "/knowledge" 
  },
  { 
    title: "Knowledge Graph", 
    icon: <Share2 size={18} />, 
    path: "/knowledge-graph" 
  },
  { 
    title: "Settings", 
    icon: <Settings size={18} />, 
    path: "/settings" 
  },
];

export default function Sidenav({ open: initialOpen = true, onToggle }) {
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(initialOpen);

  const isOpen = onToggle !== undefined ? initialOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!isOpen);
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? 240 : 64,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isOpen ? 240 : 64,
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          color: "#1e293b",
          borderRight: "1px solid #e5e7eb",
          transition: "width 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "none",
        },
      }}
    >
      {/* Top Section */}
      <Box className="flex flex-col">
        {/* Brand Header */}
        <Box className={`flex items-center min-h-[56px] border-b border-gray-100 ${isOpen ? 'px-4 justify-between' : 'justify-center px-2'}`}>
          <Link href="/studio" className="flex items-center gap-2.5 no-underline overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles size={16} />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <Typography className="!text-[14px] !font-bold !text-slate-800 !leading-tight !tracking-tight">
                  Aurora
                </Typography>
              </div>
            )}
          </Link>

          {isOpen && (
            <Tooltip title="Collapse sidebar" placement="right">
              <IconButton
                onClick={handleToggle}
                size="small"
                className="!text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !p-1.5 !rounded-md"
              >
                <PanelLeftClose size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Navigation Items */}
        <Box className={`py-3 ${isOpen ? 'px-3' : 'px-2 flex flex-col items-center'}`}>
          <div className="space-y-1 w-full flex flex-col items-center">
            {Menus.map((menu) => {
              const isActive = pathname === menu.path || pathname?.startsWith(menu.path + "/");

              if (!isOpen) {
                return (
                  <Tooltip key={menu.title} title={menu.title} placement="right" arrow>
                    <Link href={menu.path} className="no-underline block">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? "bg-indigo-50 text-indigo-600 border border-indigo-200/80 shadow-2xs font-medium"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        {menu.icon}
                      </div>
                    </Link>
                  </Tooltip>
                );
              }

              return (
                <Link href={menu.path} key={menu.title} className="no-underline block w-full">
                  <div
                    className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-50/70 text-indigo-900 font-semibold border border-indigo-100/90 shadow-2xs"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className={isActive ? "text-indigo-600" : "text-slate-400"}>
                      {menu.icon}
                    </div>
                    <Typography
                      className={`!text-[13px] !tracking-tight ${
                        isActive ? "!font-semibold !text-indigo-950" : "!font-medium !text-slate-700"
                      }`}
                    >
                      {menu.title}
                    </Typography>
                  </div>
                </Link>
              );
            })}
          </div>
        </Box>
      </Box>

      {/* Bottom Section */}
      <Box className={`p-2.5 border-t border-gray-100 ${isOpen ? 'flex justify-end' : 'flex justify-center'}`}>
        <Tooltip title={isOpen ? "Collapse sidebar" : "Expand sidebar"} placement="right">
          <IconButton
            onClick={handleToggle}
            size="small"
            className="!text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !p-1.5 !rounded-md"
          >
            {isOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
