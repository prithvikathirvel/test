"use client";

import { Typography, Box, Avatar, Menu, MenuItem, Divider } from "@mui/material";
import { Settings, LogOut, User, ChevronDown, Bell, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { redirect } from "next/navigation";
import { convertToTitleCase } from "@/utils/commonFunction";

export default function Header({ title = "Home Page" }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    redirect("/login");
  };

  return (
    <Box className="w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <Box className="flex items-center justify-between px-6 py-2 min-h-[64px]">
        {/* Page Title & Breadcrumb */}
        <Box className="flex items-center gap-3">
          <Typography className="text-[15px] !font-semibold !text-slate-900 !tracking-tight">
            {convertToTitleCase(title)}
          </Typography>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <ShieldCheck size={12} className="text-emerald-600" />
            Active Environment
          </span>
        </Box>

        {/* User / Workspace Actions */}
        <Box className="flex items-center gap-3">
          <Box
            onClick={handleClick}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all border border-transparent hover:border-slate-200 hover:bg-slate-50"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #dbeafe",
              }}
            >
              PK
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>
                Prithvi
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#64748b", lineHeight: 1.2 }}>
                Enterprise Admin
              </Typography>
            </Box>
            <ChevronDown size={14} className="text-slate-400" />
          </Box>
        </Box>

        {/* Account Dropdown */}
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
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
                mt: 1.5,
                p: 0.5,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #f1f5f9" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>Prithvi Kathirvel</Typography>
            <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.25 }}>prithvi@example.com</Typography>
          </Box>

          <Box sx={{ py: 1 }}>
            <MenuItem sx={{ py: 1, px: 2, gap: 1.5, fontSize: "13px", color: "#334155", borderRadius: "6px" }}>
              <User size={16} className="text-slate-400" />
              User Profile
            </MenuItem>
            <MenuItem sx={{ py: 1, px: 2, gap: 1.5, fontSize: "13px", color: "#334155", borderRadius: "6px" }}>
              <Settings size={16} className="text-slate-400" />
              Workspace Settings
            </MenuItem>
          </Box>

          <Divider sx={{ my: 0.5, borderColor: "#f1f5f9" }} />

          <Box sx={{ py: 0.5 }}>
            <MenuItem
              sx={{
                py: 1,
                px: 2,
                gap: 1.5,
                fontSize: "13px",
                color: "#dc2626",
                borderRadius: "6px",
                "&:hover": {
                  backgroundColor: "#fef2f2",
                },
              }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </MenuItem>
          </Box>
        </Menu>
      </Box>
    </Box>
  );
}
