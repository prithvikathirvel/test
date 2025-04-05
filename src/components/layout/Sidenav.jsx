"use client";

import { List, ListItem, ListItemIcon, ListItemText, Box, Drawer } from "@mui/material"
import {
  LayoutDashboard,
  Settings,
  MessageSquare,
  Package,
  Rocket
} from "lucide-react"

import colors from "@/utils/colors";

const Menus = [
  { title: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { title: "Chat", icon: <MessageSquare size={18} /> },
  { title: "Models", icon: <Package size={18} /> },
  { title: "Rocket", icon: <Rocket size={18}/> },
  { title: "Settings", icon: <Settings size={18} /> },
]

export default function Sidenav({ open, setOpen }) {
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
      </Box>
    </Drawer>
  )
}
