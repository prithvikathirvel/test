"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, ListItem, ListItemIcon, ListItemText, Box, Drawer, Typography, Tooltip, IconButton } from "@mui/material";
import {
  LayoutDashboard,
  Settings,
  BookOpen,
  Share2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Cpu,
  Layers,
  HelpCircle
} from "lucide-react";
import { useState } from "react";

const Menus = [
  { 
    title: "Flow Studio", 
    subtitle: "AI Workflows & Agents",
    icon: <LayoutDashboard size={19} />, 
    path: "/studio" 
  },
  { 
    title: "Knowledge Base", 
    subtitle: "Documents & Embeddings",
    icon: <BookOpen size={19} />, 
    path: "/knowledge" 
  },
  { 
    title: "Knowledge Graph", 
    subtitle: "Entities & Relations",
    icon: <Share2 size={19} />, 
    path: "/knowledge-graph" 
  },
  { 
    title: "Settings", 
    subtitle: "API Keys & Models",
    icon: <Settings size={19} />, 
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
        width: isOpen ? 250 : 70,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isOpen ? 250 : 70,
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          borderRight: "1px solid #e2e8f0",
          transition: "width 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02)",
        },
      }}
    >
      {/* Top Section */}
      <Box>
        {/* Brand & Toggle Header */}
        <Box className="flex items-center justify-between px-3.5 py-4 border-b border-slate-100 min-h-[64px]">
          <Link href="/studio" className="flex items-center gap-2.5 no-underline overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/25">
              <Sparkles size={18} />
            </div>
            {isOpen && (
              <div className="overflow-hidden transition-all duration-200">
                <Typography className="!text-[14px] !font-bold !text-slate-900 !leading-tight !tracking-tight">
                  Sify Aurora
                </Typography>
                <Typography className="!text-[11px] !text-slate-500 !leading-tight font-medium">
                  Enterprise Agent OS
                </Typography>
              </div>
            )}
          </Link>

          <Tooltip title={isOpen ? "Collapse sidebar" : "Expand sidebar"} placement="right">
            <IconButton
              onClick={handleToggle}
              size="small"
              className="!text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !p-1.5 !rounded-lg"
            >
              {isOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Navigation Menu List */}
        <Box className="py-3 px-2">
          {isOpen && (
            <Typography className="!px-3 !pb-2 !text-[11px] !font-semibold !text-slate-400 !uppercase !tracking-wider">
              Platform
            </Typography>
          )}

          <List className="space-y-1 p-0">
            {Menus.map((menu) => {
              const isActive = pathname === menu.path || pathname?.startsWith(menu.path + "/");

              const content = (
                <div
                  className={`flex items-center w-full rounded-lg px-2.5 py-2 transition-all duration-150 cursor-pointer group ${
                    isActive
                      ? "bg-blue-50/80 text-blue-700 font-semibold border-l-[3px] border-blue-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <ListItemIcon
                    className={`min-w-8 transition-colors ${
                      isActive ? "!text-blue-600" : "!text-slate-500 group-hover:!text-slate-800"
                    }`}
                  >
                    {menu.icon}
                  </ListItemIcon>

                  {isOpen && (
                    <Box className="overflow-hidden flex-1">
                      <Typography
                        className={`!text-[13px] !tracking-tight ${
                          isActive ? "!font-semibold !text-blue-700" : "!font-medium !text-slate-700 group-hover:!text-slate-900"
                        }`}
                      >
                        {menu.title}
                      </Typography>
                      <Typography className="!text-[11px] !text-slate-400 !truncate">
                        {menu.subtitle}
                      </Typography>
                    </Box>
                  )}
                </div>
              );

              return (
                <Link href={menu.path} key={menu.title} className="no-underline block">
                  <ListItem disablePadding className="mb-0.5">
                    {!isOpen ? (
                      <Tooltip title={menu.title} placement="right" arrow>
                        <div className="w-full">{content}</div>
                      </Tooltip>
                    ) : (
                      content
                    )}
                  </ListItem>
                </Link>
              );
            })}
          </List>
        </Box>
      </Box>

      {/* Bottom Section */}
      <Box className="p-3 border-t border-slate-100 bg-slate-50/50">
        {isOpen ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-700">Cluster 01</span>
              </div>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400">
              <span>v2.4.0-enterprise</span>
              <span className="hover:text-slate-600 cursor-pointer flex items-center gap-0.5">
                <HelpCircle size={12} /> Docs
              </span>
            </div>
          </div>
        ) : (
          <Tooltip title="Cluster Status: Operational (v2.4.0)" placement="right" arrow>
            <div className="flex justify-center py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
            </div>
          </Tooltip>
        )}
      </Box>
    </Drawer>
  );
}
