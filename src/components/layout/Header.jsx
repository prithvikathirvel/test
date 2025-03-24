"use client";

import { Typography, Box, Avatar, Menu, MenuItem, IconButton, Divider } from "@mui/material"
import { stringAvatar } from "@/utils/commonFunction"
import { Settings, LogOut, User, ChevronDown } from "lucide-react"
import { useState } from "react"
import { redirect } from "next/navigation";

export default function Header({ title = "Home Page" }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    redirect("/login")
  }

  return (
    <Box className="w-full border-b border-gray-200 bg-white">
      <Box className="flex items-center justify-between px-4 py-2 min-h-[64px]">
        <Typography className="text-[15px] !font-bold !font-montserrat !tracking-widest"> 
          {title.toUpperCase()}
        </Typography>

        <Box
          onClick={handleClick}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 cursor-pointer transition-all hover:bg-gray-100"
        >
          <Avatar
            {...stringAvatar("Prithvi")}
            sx={{
              width: 32,
              height: 32,
              fontSize: "14px",
              background: "linear-gradient(135deg, #3a7bd5, #00d2ff)",
            }}
          />
       <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.2 }}>Prithvi</Typography>
            <Typography sx={{ fontSize: "12px", color: "#666", lineHeight: 1.2 }}>Admin</Typography>
          </Box>
          <ChevronDown size={16} color="#666" />
        </Box>

        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              sx: {
                width: "240px",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                mt: 1.5,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0" }}>
            <Typography sx={{ fontSize: "15px", fontWeight: 600 }}>Prithvi</Typography>
            <Typography sx={{ fontSize: "13px", color: "#666", mt: 0.5 }}>prithvi@example.com</Typography>
          </Box>

          <Box sx={{ py: 1 }}>
            <MenuItem sx={{ py: 1.5, px: 2, gap: 1.5, fontSize: "14px" }}>
              <User size={18} />
              Profile
            </MenuItem>
            <MenuItem sx={{ py: 1.5, px: 2, gap: 1.5, fontSize: "14px" }}>
              <Settings size={18} />
              Settings
            </MenuItem>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Box sx={{ py: 1 }}>
            <MenuItem
              sx={{
                py: 1.5,
                px: 2,
                gap: 1.5,
                fontSize: "14px",
                color: "#d32f2f",
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                },
              }}
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </MenuItem>
          </Box>
        </Menu>
        
    </Box>
    </Box>

    
  )
}
