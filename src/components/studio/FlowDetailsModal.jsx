import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton } from '@mui/material';
import { X, Network, FileJson, AlertTriangle } from 'lucide-react';
import InputBox from '@/components/Common/InputBox';
import CustomButton from '@/components/Common/CustomButton';
import { validateFlowOutputVariables } from '@/utils/flowValidation';

const FlowDetailsModal = ({ open, onClose, onSubmit, initialData }) => {
  const initialDescription = initialData?.description || initialData?.graphSpec?.description || '';
  const isClone = Boolean(initialData?.__clone);

  const [flowDetails, setFlowDetails] = useState({
    name: initialData?.name || '',
    description: initialDescription,
  });
  const [importText, setImportText] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [skippedValidationIds, setSkippedValidationIds] = useState(() => new Set());

  useEffect(() => {
    if (initialData) {
      setFlowDetails({
        name: initialData?.name || '',
        description: initialData?.description || initialData?.graphSpec?.description || '',
      });
    }
    if (open) {
      setImportText('');
      setValidationErrors([]);
      setSkippedValidationIds(new Set());
    }
  }, [initialData, open]);

  const getValidationErrorId = (err) => {
    const occurrences = err?.occurrences?.map((occ) => `${occ.nodeId}:${occ.paramIndex}`).sort().join('|');
    return `${err?.type || 'error'}:${err?.variableName || ''}:${occurrences || `${err?.nodeId}:${err?.paramIndex}`}`;
  };

  const importParse = useMemo(() => {
    if (!importText.trim() || isClone || initialData?.name) return { flow: null, error: '' };
    try {
      return { flow: JSON.parse(importText), error: '' };
    } catch (err) {
      return { flow: null, error: `Invalid JSON: ${err.message}` };
    }
  }, [importText, isClone, initialData?.name]);

  const importedFlow = importParse.flow;

  const handleSubmit = () => {
    const importedGraphSpec = importedFlow?.graphSpec || null;
    const candidateNodes = importedGraphSpec?.nodes || [];
    if (candidateNodes.length > 0) {
      const result = validateFlowOutputVariables(candidateNodes);
      const activeErrors = (result.errors || []).filter((err) => !skippedValidationIds.has(getValidationErrorId(err)));
      if (activeErrors.length > 0) {
        setValidationErrors(activeErrors);
        return;
      }
    }

    const { description: _ignoredGraphDescription, ...cleanImportedGraphSpec } = importedGraphSpec || {};
    onSubmit({
      ...initialData,
      ...(importedFlow || {}),
      name: flowDetails?.name,
      description: flowDetails?.description,
      graphSpec: cleanImportedGraphSpec.nodes ? cleanImportedGraphSpec : (initialData?.graphSpec || undefined),
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
              {isClone ? 'Clone Flow' : initialData?.name ? 'Edit Flow Specification' : 'Create Agentic Flow'}
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
        {!isClone && !initialData?.name && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="mb-2 flex items-center gap-2">
              <FileJson size={14} className="text-slate-600" />
              <span className="text-[12px] font-semibold text-slate-700">Import Flow JSON</span>
              <span className="text-[10.5px] text-slate-400">optional</span>
            </div>
            <textarea
              value={importText}
              onChange={(event) => { setImportText(event.target.value); setValidationErrors([]); }}
              rows={5}
              placeholder='{ "graphSpec": { "nodes": [], "edges": [] }, "inputs": [] }'
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[11.5px] text-slate-800 outline-none resize-y focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
            />
            {importParse.error && <p className="mt-1 text-[11px] text-red-500">{importParse.error}</p>}
            {validationErrors.length > 0 && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-amber-800">
                  <AlertTriangle size={14} />
                  <span className="text-[12px] font-semibold">Output collision warning</span>
                </div>
                <div className="space-y-2">
                  {validationErrors.map((err, idx) => (
                    <div key={idx} className="rounded-md border border-amber-200 bg-white/70 p-2 text-[11px] text-slate-700">
                      <p>{err.message}</p>
                      {err.occurrences?.length > 0 && (
                        <p className="mt-1 text-slate-500">Nodes: {err.occurrences.map((o) => o.nodeName).join(', ')}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const id = getValidationErrorId(err);
                          setSkippedValidationIds((prev) => new Set([...prev, id]));
                          setValidationErrors((current) => current.filter((item) => getValidationErrorId(item) !== id));
                        }}
                        className="mt-2 rounded-md border border-slate-300 bg-white px-2 py-1 text-[10.5px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Skip this warning
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSkippedValidationIds((prev) => new Set([...prev, ...validationErrors.map(getValidationErrorId)]));
                    setValidationErrors([]);
                  }}
                  className="mt-3 rounded-md bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-900"
                >
                  Skip all warnings
                </button>
              </div>
            )}
          </div>
        )}
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
          {isClone ? 'Clone Flow' : initialData?.name ? 'Save Changes' : 'Create Flow'}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default FlowDetailsModal;
