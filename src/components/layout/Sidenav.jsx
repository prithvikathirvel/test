"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, ListItem, ListItemIcon, ListItemText, Box, Drawer } from "@mui/material";
import {
  LayoutDashboard,
  Settings,
  BookOpen,
} from "lucide-react";

const Menus = [
  // { title: "Home", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
  { title: "Flow Listing", icon: <LayoutDashboard size={18} />, path: "/studio" },
  { title: "LLM", icon: <BookOpen size={18} />, path: "/knowledge" },
  { title: "Settings", icon: <Settings size={18} />, path: "/settings" },
];

export default function Sidenav({ open, setOpen }) {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 256 : 64,
        "& .MuiDrawer-paper": {
          width: open ? 256 : 64,
          backgroundColor: 'var(--primary-color)',
          color: "white",
          transition: "width 0.3s ease-in-out",
        },
      }}
    >
      <Box sx={{ flex: 1, py: 2 }}>
        <List>
          {Menus.map((menu) => {
            const isActive = pathname === menu.path;

            return (
              <Link href={menu.path} key={menu.title} className="no-underline">
                <ListItem className="mb-2 px-3">
                  <div
                    className={`flex items-center w-full rounded-lg p-2 text-white transition-colors cursor-pointer ${
                      isActive ? "bg-white/20" : "hover:bg-white/10"
                    }`}
                  >
                    <ListItemIcon className="min-w-10 !text-white">
                      {menu.icon}
                    </ListItemIcon>
                    {open && (
                      <ListItemText
                        primary={menu.title}
                        primaryTypographyProps={{
                          className: "text-sm font-medium text-white",
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
    </Drawer>
  );
}
