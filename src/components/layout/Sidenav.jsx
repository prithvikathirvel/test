"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, ListItem, ListItemIcon, ListItemText, Box, Drawer, Typography } from "@mui/material";
import {
  LayoutDashboard,
  Settings,
  BookOpen,
  Share2,
  Sparkles,
} from "lucide-react";

const Menus = [
  { title: "Flow Studio", icon: <LayoutDashboard size={18} />, path: "/studio" },
  { title: "Knowledge Base", icon: <BookOpen size={18} />, path: "/knowledge" },
  { title: "Knowledge Graph", icon: <Share2 size={18} />, path: "/knowledge-graph" },
  { title: "Settings", icon: <Settings size={18} />, path: "/settings" },
];

export default function Sidenav({ open, setOpen }) {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 68,
        "& .MuiDrawer-paper": {
          width: open ? 240 : 68,
          backgroundColor: '#0f172a',
          color: "#f8fafc",
          borderRight: '1px solid #1e293b',
          transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          overflowX: "hidden",
        },
      }}
    >
      {/* Brand Header */}
      <Box className="flex items-center gap-3 px-4 py-5 border-b border-slate-800/80 min-h-[64px]">
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/20">
          <Sparkles size={18} />
        </div>
        {open && (
          <div className="overflow-hidden">
            <Typography className="!text-[14px] !font-bold !text-white !leading-tight !tracking-tight">
              Sify Aurora
            </Typography>
            <Typography className="!text-[11px] !text-slate-400 !leading-tight">
              Enterprise Agent OS
            </Typography>
          </div>
        )}
      </Box>

      {/* Navigation Links */}
      <Box sx={{ flex: 1, py: 3, px: 2 }}>
        <List className="space-y-1">
          {Menus.map((menu) => {
            const isActive = pathname === menu.path || pathname?.startsWith(menu.path + "/");

            return (
              <Link href={menu.path} key={menu.title} className="no-underline block">
                <ListItem disablePadding className="mb-1">
                  <div
                    className={`flex items-center w-full rounded-lg px-3 py-2.5 transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-slate-800 text-white font-medium shadow-xs border-l-2 border-blue-500 pl-2.5"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    }`}
                  >
                    <ListItemIcon
                      className={`min-w-8 transition-colors ${
                        isActive ? "!text-blue-400" : "!text-slate-400"
                      }`}
                    >
                      {menu.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={menu.title}
                        primaryTypographyProps={{
                          className: `text-[13px] tracking-tight ${
                            isActive ? "text-white font-semibold" : "text-slate-300 font-medium"
                          }`,
                        }}
                      />
                    )}
                  </div>
                </ListItem>
              </Link>
            );
          })}
        </List>
      </Box>

      {/* Footer / Status Indicator */}
      {open && (
        <Box className="p-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-300 text-[11px]">Production Cluster</span>
          </div>
        </Box>
      )}
    </Drawer>
  );
}
