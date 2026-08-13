"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Box, Drawer, Typography, Tooltip, IconButton } from "@mui/material";
import {
  LayoutDashboard,
  Settings,
  BookOpen,
  Share2,
  BookMarked,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";

const ICON_SIZE = 16;

const Menus = [
  {
    title: "Flow Studio",
    icon: LayoutDashboard,
    path: "/studio",
  },
  {
    title: "Knowledge Base",
    icon: BookOpen,
    path: "/knowledge",
  },
  {
    title: "Knowledge Graph",
    icon: Share2,
    path: "/knowledge-graph",
  },
  {
    title: "Dictionary",
    icon: BookMarked,
    path: "/dictionary",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

const NavIcon = ({ icon: Icon, active }) => (
  <span
    className={`inline-flex h-5 w-5 items-center justify-center shrink-0 ${
      active ? "text-indigo-600" : "text-slate-400"
    }`}
  >
    <Icon size={ICON_SIZE} strokeWidth={1.75} />
  </span>
);

export default function Sidenav({ open: initialOpen = true, onToggle }) {
  const rawPathname = usePathname();
  const pathname = (rawPathname || "/").replace(/\/+$/, "") || "/";
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
        width: isOpen ? 232 : 60,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isOpen ? 232 : 60,
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
          fontFamily: "inherit",
        },
        "& .MuiDrawer-paper *": {
          fontFamily: "inherit",
        },
      }}
    >
      <Box className="flex flex-col">
        <Box
          className={`flex items-center min-h-[52px] border-b border-gray-100 ${
            isOpen ? "px-3 justify-between" : "justify-center px-0"
          }`}
        >
          <Link
            href="/studio"
            className="flex items-center justify-center no-underline overflow-hidden h-8 w-8"
          >
            <Image
              src="/agent-studio/branding/aurora-icon.png"
              alt="Sify Aurora"
              width={20}
              height={20}
              className="object-contain"
              priority
              unoptimized
            />
          </Link>

          {isOpen && (
            <Tooltip title="Collapse sidebar" placement="right">
              <IconButton
                onClick={handleToggle}
                size="small"
                className="!text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !p-1.5 !rounded-md"
              >
                <PanelLeftClose size={15} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box className={`py-3 ${isOpen ? "px-2.5" : "px-0"}`}>
          {isOpen && (
            <p className="px-2 pb-1.5 pt-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest select-none">
              Workspace
            </p>
          )}
          <div className={`space-y-0.5 w-full ${isOpen ? "" : "flex flex-col items-center"}`}>
            {Menus.map((menu) => {
              const isActive =
                pathname === menu.path || pathname?.startsWith(menu.path + "/");

              if (!isOpen) {
                return (
                  <Tooltip key={menu.title} title={menu.title} placement="right" arrow>
                    <Link href={menu.path} className="no-underline flex justify-center">
                      <div
                        className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                          isActive
                            ? "bg-slate-100 text-indigo-600"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        <NavIcon icon={menu.icon} active={isActive} />
                      </div>
                    </Link>
                  </Tooltip>
                );
              }

              return (
                <Link href={menu.path} key={menu.title} className="no-underline block w-full">
                  <div
                    className={`relative flex items-center gap-2.5 w-full rounded-md px-2.5 py-[7px] transition-colors cursor-pointer ${
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 inset-y-[5px] w-[2px] rounded-r-full bg-slate-700" />
                    )}
                    <NavIcon icon={menu.icon} active={isActive} />
                    <Typography
                      className={`!text-[13px] !leading-tight ${
                        isActive
                          ? "!font-semibold !text-slate-800"
                          : "!font-medium !text-slate-600"
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

      <Box
        className={`p-2 border-t border-gray-100 ${
          isOpen ? "flex justify-end" : "flex justify-center"
        }`}
      >
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
