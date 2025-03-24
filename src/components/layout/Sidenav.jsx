"use client";

import { Box, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material"
import {
  LayoutDashboard,
  Inbox,
  User,
  Calendar,
  Search,
  BarChart,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Package,
  Rocket
} from "lucide-react"

const Menus = [
  { title: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { title: "Chat", icon: <MessageSquare size={18} /> },
  { title: "Models", icon: <Package size={18} /> },
  { title: "Rocket", icon: <Rocket size={18}/> },
  { title: "Settings", icon: <Settings size={18} /> },
]

export default function Sidenav({ open, setOpen }) {
  return (
    <div className={`${open ? "w-64" : "w-16"} bg-[#6c5ce7] h-dvh flex flex-col transition-all duration-300`}>
      <div className="flex-1 py-8">
        <List>
          {Menus.map((menu) => (
            <ListItem
              key={menu.title}
              className="mb-2 px-3"
            >
              <div className="flex items-center w-full rounded-lg p-2 text-white hover:bg-white/10 transition-colors cursor-pointer">
                <ListItemIcon className="min-w-10 !text-white">
                  {menu.icon}
                </ListItemIcon>
                <ListItemText
                  primary={menu.title}
                  className={`${!open && "hidden"} transition-opacity`}
                  primaryTypographyProps={{
                    className: "text-sm font-medium text-white"
                  }}
                />
              </div>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  )
}
