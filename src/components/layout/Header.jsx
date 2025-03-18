"use client"

import { Typography, Box, Avatar, Menu, MenuItem, IconButton, Divider } from "@mui/material"
import { stringAvatar } from "@/utils/commonFunction"
import { Settings, LogOut, User, ChevronDown } from "lucide-react"
import { useState } from "react"

export default function Header({ title = "Home Page" }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box className="flex items-center justify-between p-2 min-h-[40px] border-b-1 border-[#ebf0f4]">
      <Typography className="!text-[15px] !font-bold" > 
        {title}
      </Typography>

      <Box>
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderRadius: '4px',
            padding: '4px 8px',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <Avatar {...stringAvatar('Prithvi')} sx={{ width: 24, height: 24,fontSize: '15px' }} />
          <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>Prithvi</Typography>
          <ChevronDown size={16} />
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
                width: '200px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                mt: 1
              }
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0' , marginBottom: '5px',borderRadius: '15px'}}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>Prithvi</Typography>
            <Typography sx={{ fontSize: '12px', color: '#666' }}>prithvi@example.com</Typography>
          </Box>
          <MenuItem sx={{ py: 1, px: 2, gap: 1.5, fontSize: '13px' }}>
            <User size={16} />
            Profile
          </MenuItem>
          <MenuItem sx={{ py: 1, px: 2, gap: 1.5, fontSize: '13px' }}>
            <Settings size={16} />
            Settings
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem sx={{ py: 1, px: 2, gap: 1.5, fontSize: '13px', color: '#d32f2f' }}>
            <LogOut size={16} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )
}
