import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

const Loader = ({ loadingText = 'Loading...' ,loaderColor="text.secondary",loaderSize=24}) => {
    return (
        <Box className="flex flex-col items-center justify-center py-8">
            <CircularProgress size={loaderSize} className="mb-2" />
            <Typography
                variant="body2"
                color={loaderColor}
                className="text-center"
            >
                {loadingText}
            </Typography>
        </Box>
    )
}

export default Loader