"use client"

import { useState } from "react"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Paper,
    Box,
    Tabs,
    Tab,
    IconButton,
    Chip,
    useTheme,
} from "@mui/material"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import CloseIcon from "@mui/icons-material/Close"
import CheckIcon from "@mui/icons-material/Check"

const FlowOutputModal = ({ open, onClose, output, lastParam }) => {
    const [activeTab, setActiveTab] = useState(0)
    const [copied, setCopied] = useState({ full: false, last: false })
    const theme = useTheme()

    if (!output) return null

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue)
    }

    const handleCopy = (type, data) => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2))
        setCopied({ ...copied, [type]: true })
        setTimeout(() => setCopied({ ...copied, [type]: false }), 2000)
    }

    const lastParamData = lastParam && output[lastParam] ? output[lastParam] : null

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    pb: 1,
                }}
            >
                <span style={{ fontWeight: 500 }}>Flow Execution Output</span>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="output tabs">
                <Tab label="Formatted Output" disabled={!lastParamData} />
                    <Tab label="Complete Output" />
                </Tabs>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                {activeTab === 0 && (


                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="subtitle1" fontWeight="500">
                                    Last Parameter
                                </Typography>
                                <Chip label={lastParam} size="small" color="primary" variant="outlined" sx={{ height: 24 }} />
                            </Box>
                            <IconButton
                                size="small"
                                onClick={() => handleCopy("last", lastParamData)}
                                color={copied.last ? "success" : "default"}
                            >
                                {copied.last ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                            </IconButton>
                        </Box>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
                                borderRadius: 1,
                                maxHeight: "400px",
                                overflow: "auto",
                                fontFamily: "monospace",
                                fontSize: "0.875rem",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                            }}
                        >
                            {JSON.stringify(lastParamData, null, 2)}
                        </Paper>
                    </Box>
                )}

                {activeTab === 1 && lastParamData && (
                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="500">
                                Complete Results
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => handleCopy("full", output)}
                                color={copied.full ? "success" : "default"}
                            >
                                {copied.full ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                            </IconButton>
                        </Box>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)",
                                borderRadius: 1,
                                maxHeight: "400px",
                                overflow: "auto",
                                fontFamily: "monospace",
                                fontSize: "0.875rem",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                            }}
                        >
                            {JSON.stringify(output, null, 2)}
                        </Paper>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1.5 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default FlowOutputModal

