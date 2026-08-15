"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Box, Drawer, Tooltip, IconButton } from "@mui/material";
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
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "& .MuiDrawer-paper": {
          width: isOpen ? 232 : 60,
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          color: "#1e293b",
          borderRight: "1px solid #e5e7eb",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
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
        <Box className="flex items-center min-h-[52px] border-b border-gray-100 px-3">
          <Link
            href="/studio"
            className="flex items-center justify-center no-underline overflow-hidden h-8 w-8 shrink-0"
          >
            <Image
              src="/agent-studio/branding/aurora-logo.png"
              alt="Sify Aurora"
              width={80}
              height={80}
              className="object-contain"
              priority
              unoptimized
            />
          </Link>

          <div
            className={`ml-auto transition-opacity duration-200 ${
              isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Tooltip title="Collapse sidebar" placement="right">
              <IconButton
                onClick={handleToggle}
                size="small"
                className="!text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !p-1.5 !rounded-md"
              >
                <PanelLeftClose size={15} />
              </IconButton>
            </Tooltip>
          </div>
        </Box>

        <Box className="py-3 px-2">
          <p
            className={`px-2 pb-1.5 pt-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest select-none whitespace-nowrap overflow-hidden transition-opacity duration-200 ${
              isOpen ? "opacity-100" : "opacity-0 h-0 p-0 m-0"
            }`}
          >
            Workspace
          </p>
          <div className="space-y-0.5 w-full">
            {Menus.map((menu) => {
              const isActive =
                pathname === menu.path || pathname?.startsWith(menu.path + "/");

              return (
                <Tooltip
                  key={menu.title}
                  title={isOpen ? "" : menu.title}
                  placement="right"
                  arrow
                >
                  <Link href={menu.path} className="no-underline block w-full">
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
                      <span className="shrink-0">
                        <NavIcon icon={menu.icon} active={isActive} />
                      </span>
                      <span
                        className={`whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200 text-[13px] leading-tight ${
                          isActive ? "font-semibold text-slate-800" : "font-medium text-slate-600"
                        } ${isOpen ? "opacity-100 max-w-[160px]" : "opacity-0 max-w-0"}`}
                      >
                        {menu.title}
                      </span>
                    </div>
                  </Link>
                </Tooltip>
              );
            })}
          </div>
        </Box>
      </Box>

      <Box className="p-2 border-t border-gray-100 flex justify-center">
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
