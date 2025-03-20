import React from 'react'; 
import { Drawer, Box } from '@mui/material';


const SideDrawer = () => {
  return (
    <Drawer anchor="left" open={false} sx={{ width: 280 }}>
        <Box sx={{ p: 2, height: '100vh' }}>Hi</Box>
    </Drawer>
  )
}

export default SideDrawer