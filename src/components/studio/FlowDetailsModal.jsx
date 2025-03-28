import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';


const FlowDetailsModal = ({ open, onClose, onSubmit, initialData }) => {
    const [flowDetails, setFlowDetails] = useState({
        name: initialData?.name || '',
        description: initialData?.graphSpec?.description || ''
    });

    useEffect(() => {
        // Update the form when initialData changes
        if (initialData) {
            setFlowDetails({
                name: initialData?.name || '',
                description: initialData?.graphSpec?.description || ''
            });
        }
    }, [initialData]);

    const handleSubmit = () => {
        onSubmit({
            ...initialData,
            name: flowDetails?.name,
            description: flowDetails?.description,
            graphSpec: {
                ...(initialData?.graphSpec || {}),
                description: flowDetails?.description
            }
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Flow Details</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Flow Name"
                    fullWidth
                    value={flowDetails.name}
                    onChange={(e) => setFlowDetails(prev => ({ ...prev, name: e.target.value }))}
                    required
                />
                <TextField
                    margin="dense"
                    label="Flow Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={flowDetails.description}
                    onChange={(e) => setFlowDetails(prev => ({ ...prev, description: e.target.value }))}
                    required
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    color="primary"
                    disabled={!flowDetails.name || !flowDetails.description}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FlowDetailsModal;
