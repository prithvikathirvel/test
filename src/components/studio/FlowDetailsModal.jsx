import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import InputBox from '@/components/Common/InputBox';

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
            <DialogTitle className='!text-[16px] !font-bold '>Flow Details</DialogTitle>
            <DialogContent>
                {/* <TextField
                    autoFocus
                    margin="dense"
                    label="Flow Name"
                    fullWidth
                    value={flowDetails.name}
                    onChange={(e) => setFlowDetails(prev => ({ ...prev, name: e.target.value }))}
                    required
                /> */}
                <InputBox
                    className="!mt-2"
                    id="name"
                    label='Flow Name'
                    icon={''}
                    autoFocus={true}
                    value={flowDetails.name}
                    onChange={(value) => setFlowDetails(prev => ({ ...prev, name: value }))}
                    placeholder="Enter flow name"
                    type="text"
                />

                <InputBox
                    className="!mt-2"
                    id="description"
                    label='Flow Description'
                    icon={''}
                    autoFocus={true}
                    value={flowDetails.description}
                    onChange={(value) => setFlowDetails(prev => ({ ...prev, description: value }))}
                    placeholder="Enter flow description"
                    type="text"
                />
                {/* <TextField
                    margin="dense"
                    label="Flow Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={flowDetails.description}
                    onChange={(e) => setFlowDetails(prev => ({ ...prev, description: e.target.value }))}
                    required
                /> */}
            </DialogContent>
            <DialogActions>
                <Button 
                    className={`px-5 py-2.5 !bg-[var(--primary-color)] !hover:cursor-pointer !text-white rounded-lg flex items-center font-medium !text-[12px]`}
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button 
                    className={`px-5 py-2.5 ${!flowDetails.name || !flowDetails.description ? '!bg-[var(--primary-color)]/20' : '!bg-[var(--primary-color)]'} !hover:cursor-pointer !text-white rounded-lg flex items-center font-medium !text-[12px]`}
                    onClick={handleSubmit} 
                    disabled={!flowDetails.name || !flowDetails.description}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FlowDetailsModal;
