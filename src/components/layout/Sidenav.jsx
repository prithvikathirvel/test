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
    <div className={`${open ? "w-55" : "w-16"} bg-[#6c5ce7] h-screen p-3 pt-8 duration-300 relative`}>
      {/* <IconButton
        onClick={() => setOpen(!open)}
        size="small"
        sx={{
          position: "absolute",
          top: "10px",
          right: "-12px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: open ? "#6c5ce7" : "white",
          boxShadow: "0 3px 10px rgb(0,0,0,0.2)",
          border: open ? "2px solid #6c5ce7" : "2px solid transparent",
          transform: !open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "white",
          },
          zIndex: 10,
        }}
      >
        {open ? <ChevronLeft size={18} color={open ? "white" : "black"} /> : <ChevronRight size={18} />}
      </IconButton> */}

      <List className="pt-6">
        {Menus.map((menu, index) => (
          <ListItem
            key={index}
            className={`rounded-md cursor-pointer hover:bg-white/20 text-white min-h-[48px]
            ${menu.gap ? "mt-9" : "mt-2"} ${index === 0 && "bg-white/20"}`}
            sx={{
              padding: "8px 12px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)"
              }
            }}
          >
            <ListItemIcon className="min-w-[32px]">
              <Box className="text-white">{menu.icon}</Box>
            </ListItemIcon>
            <ListItemText 
              primary={menu.title} 
              className={`${!open && "hidden"} origin-left duration-200`}
              primaryTypographyProps={{
                style: {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </div>
  )
}
