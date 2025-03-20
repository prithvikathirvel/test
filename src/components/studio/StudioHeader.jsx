import { Box, Typography } from "@mui/material";

const StudioHeader = ({ title, viewMode }) => {
  return (
    <Box className="!border-b-1 border-gray-300 flex items-center justify-between" sx={{ height: '50px', backgroundColor: 'white', px: 2 }}>
      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#666' }}>
        {viewMode === 'graph' ? 'Flow Editor' : 'Flow Specification'}
      </Typography>
    </Box>
  );
};

export default StudioHeader;
