"use client";

import { Typography, Box, Avatar, Menu, MenuItem, Divider } from "@mui/material";
import { stringAvatar } from "@/utils/commonFunction";
import { Settings, LogOut, User, ChevronDown, Key } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header({ title = "Workspace" }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    router.push("/login");
  };

  const navigateTo = (path) => {
    handleClose();
    router.push(path);
  };

  return (
    <Box className="w-full border-b border-zinc-200 bg-white sticky top-0 z-30">
      <Box className="flex items-center justify-between px-6 py-2.5 min-h-[52px]">
        {/* Minimal Title */}
        <Typography className="text-sm font-semibold text-zinc-900 tracking-tight">
          {title}
        </Typography>

        {/* Minimal User Menu */}
        <Box className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>

          <Box
            onClick={handleClick}
            className="flex items-center gap-2 rounded-lg px-2 py-1 cursor-pointer hover:bg-zinc-100 transition-colors"
          >
            <Avatar
              {...stringAvatar("Prithvi")}
              sx={{
                width: 26,
                height: 26,
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: "#18181b",
                color: "#ffffff",
              }}
            />
            <ChevronDown size={14} className="text-zinc-400" />
          </Box>

          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{
              paper: {
                sx: {
                  width: "190px",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  mt: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f4f4f5" }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#18181b" }}>
                Prithvi
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#71717a" }}>
                prithvi@sify.com
              </Typography>
            </Box>

            <Box sx={{ py: 0.5 }}>
              <MenuItem
                onClick={() => navigateTo("/settings")}
                sx={{ py: 1, px: 2, gap: 1.5, fontSize: "12px", color: "#27272a" }}
              >
                <User size={14} />
                <span>Profile</span>
              </MenuItem>
              <MenuItem
                onClick={() => navigateTo("/settings")}
                sx={{ py: 1, px: 2, gap: 1.5, fontSize: "12px", color: "#27272a" }}
              >
                <Key size={14} />
                <span>API keys</span>
              </MenuItem>
              <MenuItem
                onClick={() => navigateTo("/settings")}
                sx={{ py: 1, px: 2, gap: 1.5, fontSize: "12px", color: "#27272a" }}
              >
                <Settings size={14} />
                <span>Settings</span>
              </MenuItem>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            <Box sx={{ py: 0.5 }}>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1,
                  px: 2,
                  gap: 1.5,
                  fontSize: "12px",
                  color: "#dc2626",
                  "&:hover": { backgroundColor: "#fef2f2" },
                }}
              >
                <LogOut size={14} />
                <span>Sign out</span>
              </MenuItem>
            </Box>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}
