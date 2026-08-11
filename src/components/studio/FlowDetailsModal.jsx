import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton } from '@mui/material';
import { X, Network } from 'lucide-react';
import InputBox from '@/components/Common/InputBox';
import CustomButton from '@/components/Common/CustomButton';

const FlowDetailsModal = ({ open, onClose, onSubmit, initialData }) => {
  const [flowDetails, setFlowDetails] = useState({
    name: initialData?.name || '',
    description: initialData?.graphSpec?.description || '',
  });

  useEffect(() => {
    if (initialData) {
      setFlowDetails({
        name: initialData?.name || '',
        description: initialData?.graphSpec?.description || '',
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
        description: flowDetails?.description,
      },
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Modal Header */}
      <Box className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <Box className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Network size={18} />
          </div>
          <div>
            <Typography className="!text-[15px] !font-bold !text-slate-900">
              {initialData?.name ? 'Edit Flow Specification' : 'Create Agentic Flow'}
            </Typography>
            <Typography className="!text-[12px] !text-slate-500">
              Configure flow name and behavioral description
            </Typography>
          </div>
        </Box>
        <IconButton onClick={onClose} size="small" className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </IconButton>
      </Box>

      {/* Modal Content */}
      <DialogContent className="!p-6 space-y-4">
        <InputBox
          id="name"
          label="Flow Name"
          autoFocus={true}
          value={flowDetails.name}
          onChange={(value) => setFlowDetails((prev) => ({ ...prev, name: value }))}
          placeholder="e.g. Customer Support Triage Agent"
          type="text"
        />
        <InputBox
          id="description"
          label="Flow Description"
          value={flowDetails.description}
          onChange={(value) => setFlowDetails((prev) => ({ ...prev, description: value }))}
          placeholder="Describe the primary purpose and execution trigger of this flow"
          type="text"
        />
      </DialogContent>

      {/* Modal Actions */}
      <DialogActions className="!px-6 !py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
        <CustomButton variant="outlined" onClick={onClose}>
          Cancel
        </CustomButton>
        <CustomButton
          variant="contained"
          onClick={handleSubmit}
          disabled={!flowDetails.name?.trim() || !flowDetails.description?.trim()}
        >
          {initialData?.name ? 'Save Changes' : 'Create Flow'}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default FlowDetailsModal;
