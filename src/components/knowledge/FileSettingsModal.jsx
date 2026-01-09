import React, { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    Box, 
    Typography,
    Button
} from "@mui/material";

const FileSettingsModal = ({ open, onClose, onSave, initialData, fileType }) => {
    const [name, setName] = useState("");
    const [chunkWord, setChunkWord] = useState("");

    useEffect(() => {
        if (open && initialData) {
            setName(initialData.customName || "");
            // Handle as string
            setChunkWord(initialData.chunkWord || "");
        }
    }, [open, initialData]);

    const handleSave = () => {
        onSave(name, chunkWord);
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                File Settings
            </DialogTitle>
            
            <DialogContent dividers>
                <Box className="flex flex-col gap-4 py-2">
                    <Box>
                        <Typography variant="caption" className="text-gray-500 mb-1 block">
                            File Type: {fileType?.toUpperCase()}
                        </Typography>
                    </Box>

                    <TextField
                        label="Knowledge Base Name"
                        variant="outlined"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        helperText="The name used to identify this document in the knowledge base."
                    />

                    <TextField
                        label="Chunk Word"
                        variant="outlined"
                        fullWidth
                        type="text" 
                        value={chunkWord}
                        onChange={(e) => setChunkWord(e.target.value)}
                        placeholder="Enter chunk word (e.g. Separator)"
                        helperText="Define the chunk word parameter for processing."
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ padding: 2 }}>
                <Button onClick={onClose} variant="outlined" color="inherit">
                    Cancel
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    color="primary"
                    disabled={!name.trim()}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FileSettingsModal;