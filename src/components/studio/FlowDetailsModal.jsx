import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogActions, Box, Typography, IconButton } from '@mui/material';
import { X, Network, FileJson, AlertTriangle, Upload, ClipboardPaste, FileText } from 'lucide-react';
import InputBox from '@/components/Common/InputBox';
import CustomButton from '@/components/Common/CustomButton';
import { validateFlowOutputVariables } from '@/utils/flowValidation';

const getValidationErrorId = (err) => {
  const occurrences = err?.occurrences?.map((occ) => `${occ.nodeId}:${occ.paramIndex}`).sort().join('|');
  return `${err?.type || 'error'}:${err?.variableName || ''}:${occurrences || `${err?.nodeId}:${err?.paramIndex}`}`;
};

const cleanGraphSpec = (graphSpec) => {
  const { description: _description, ...rest } = graphSpec || {};
  return rest;
};

const parseFlowJson = (text) => {
  if (!text?.trim()) return { flow: null, error: '' };
  try {
    const parsed = JSON.parse(text);
    return { flow: parsed, error: '' };
  } catch (err) {
    return { flow: null, error: `Invalid JSON: ${err.message}` };
  }
};

const FlowDetailsModal = ({ open, onClose, onSubmit, initialData }) => {
  const initialDescription = initialData?.description || initialData?.graphSpec?.description || '';
  const isClone = Boolean(initialData?.__clone);
  const isEdit = Boolean(initialData?.name) && !isClone;
  const canImport = !isClone && !isEdit;

  const [activeMode, setActiveMode] = useState('blank');
  const [flowDetails, setFlowDetails] = useState({
    name: initialData?.name || '',
    description: initialDescription,
  });
  const [pasteText, setPasteText] = useState('');
  const [importText, setImportText] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [skippedValidationIds, setSkippedValidationIds] = useState(() => new Set());

  useEffect(() => {
    setFlowDetails({
      name: initialData?.name || '',
      description: initialData?.description || initialData?.graphSpec?.description || '',
    });
    if (open) {
      setActiveMode('blank');
      setPasteText('');
      setImportText('');
      setValidationErrors([]);
      setSkippedValidationIds(new Set());
    }
  }, [initialData, open]);

  const sourceText = activeMode === 'paste' ? pasteText : activeMode === 'import' ? importText : '';
  const importParse = useMemo(() => parseFlowJson(sourceText), [sourceText]);
  const importedFlow = canImport && activeMode !== 'blank' ? importParse.flow : null;

  useEffect(() => {
    if (!importedFlow || activeMode === 'blank') return;
    setFlowDetails((prev) => ({
      name: importedFlow.name || importedFlow.agent_name || prev.name,
      description: importedFlow.description || importedFlow.agent_description || importedFlow.graphSpec?.description || prev.description,
    }));
    setValidationErrors([]);
  }, [importedFlow, activeMode]);

  const runImportedValidation = () => {
    if (activeMode === 'blank') return true;
    const candidateNodes = importedFlow?.graphSpec?.nodes || [];
    if (candidateNodes.length === 0) return true;
    const result = validateFlowOutputVariables(candidateNodes);
    const activeErrors = (result.errors || []).filter((err) => !skippedValidationIds.has(getValidationErrorId(err)));
    if (activeErrors.length > 0) {
      setValidationErrors(activeErrors);
      return false;
    }
    return true;
  };

  const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setImportText(text);
    setValidationErrors([]);
  };

  const handleSubmit = () => {
    if (!runImportedValidation()) return;

    const importedGraphSpec = importedFlow?.graphSpec ? cleanGraphSpec(importedFlow.graphSpec) : null;
    onSubmit({
      ...initialData,
      ...(importedFlow || {}),
      name: flowDetails?.name,
      description: flowDetails?.description,
      graphSpec: importedGraphSpec || (initialData?.graphSpec ? cleanGraphSpec(initialData.graphSpec) : undefined),
    });
    onClose();
  };

  const modeTabs = [
    { id: 'blank', label: 'Blank', icon: FileText, help: 'Start with an empty canvas.' },
    { id: 'paste', label: 'Paste', icon: ClipboardPaste, help: 'Paste a flow JSON payload.' },
    { id: 'import', label: 'Import', icon: Upload, help: 'Upload a .json flow file.' },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={canImport ? 'md' : 'sm'}
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
      <Box className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <Box className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Network size={18} />
          </div>
          <div>
            <Typography className="!text-[15px] !font-bold !text-slate-900">
              {isClone ? 'Clone Flow' : isEdit ? 'Edit Flow Specification' : 'Create Agentic Flow'}
            </Typography>
            <Typography className="!text-[12px] !text-slate-500">
              {canImport ? 'Start blank, paste JSON, or import a flow file' : 'Configure flow name and behavioral description'}
            </Typography>
          </div>
        </Box>
        <IconButton onClick={onClose} size="small" className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </IconButton>
      </Box>

      <DialogContent className="!p-0">
        <div className="max-h-[74vh] overflow-y-auto p-6 space-y-4">
          {canImport && (
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
              {modeTabs.map(({ id, label, icon: Icon, help }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setActiveMode(id); setValidationErrors([]); }}
                  className={`rounded-lg px-3 py-2 text-left transition-colors ${activeMode === id ? 'bg-white border border-slate-300 text-slate-900' : 'border border-transparent text-slate-500 hover:bg-white/70'}`}
                >
                  <span className="flex items-center gap-1.5 text-[12px] font-semibold"><Icon size={13} /> {label}</span>
                  <span className="mt-0.5 block text-[10.5px] leading-snug text-slate-400">{help}</span>
                </button>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Basic details</span>
              {importedFlow && <span className="text-[10.5px] text-slate-400">Auto-filled from JSON — edit if needed</span>}
            </div>
            <div className="space-y-4">
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
            </div>
          </div>

          {canImport && activeMode === 'paste' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ClipboardPaste size={14} className="text-slate-600" />
                <span className="text-[12px] font-semibold text-slate-700">Paste Flow JSON</span>
              </div>
              <textarea
                value={pasteText}
                onChange={(event) => { setPasteText(event.target.value); setValidationErrors([]); }}
                rows={8}
                placeholder='{ "name": "Shopping Assistant", "description": "...", "graphSpec": { "nodes": [], "edges": [] } }'
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[11.5px] text-slate-800 outline-none resize-y focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
              />
              {importParse.error && <p className="mt-1 text-[11px] text-red-500">{importParse.error}</p>}
            </div>
          )}

          {canImport && activeMode === 'import' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Upload size={14} className="text-slate-600" />
                <span className="text-[12px] font-semibold text-slate-700">Import Flow JSON file</span>
              </div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center hover:bg-slate-50">
                <Upload size={20} className="mb-2 text-slate-400" />
                <span className="text-[12px] font-semibold text-slate-700">Choose a .json file</span>
                <span className="mt-0.5 text-[11px] text-slate-400">The flow name and description will be filled automatically.</span>
                <input type="file" accept="application/json,.json" onChange={handleFileImport} className="hidden" />
              </label>
              {importText && <p className="mt-2 text-[11px] text-emerald-600">JSON loaded. Review details and create the flow.</p>}
              {importParse.error && <p className="mt-1 text-[11px] text-red-500">{importParse.error}</p>}
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-800">
                <AlertTriangle size={15} />
                <span className="text-[12px] font-semibold">Output collision warning</span>
              </div>
              <p className="mb-3 text-[11.5px] text-amber-800/80">These warnings are in the imported JSON. You can skip them and continue, or fix the JSON before creating.</p>
              <div className="space-y-2">
                {validationErrors.map((err, idx) => (
                  <div key={idx} className="rounded-lg border border-amber-200 bg-white/80 p-3 text-[11.5px] text-slate-700">
                    <p>{err.message}</p>
                    {err.occurrences?.length > 0 && <p className="mt-1 text-slate-500">Nodes: {err.occurrences.map((o) => o.nodeName).join(', ')}</p>}
                    <button
                      type="button"
                      onClick={() => {
                        const id = getValidationErrorId(err);
                        setSkippedValidationIds((prev) => new Set([...prev, id]));
                        setValidationErrors((current) => current.filter((item) => getValidationErrorId(item) !== id));
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Ignore this warning
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
      </DialogContent>

      <DialogActions className="!px-6 !py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
        <CustomButton variant="outlined" onClick={onClose}>Cancel</CustomButton>
        <CustomButton
          variant="contained"
          onClick={handleSubmit}
          disabled={!flowDetails.name?.trim() || !flowDetails.description?.trim() || Boolean(importParse.error)}
        >
          {isClone ? 'Clone Flow' : isEdit ? 'Save Changes' : 'Create Flow'}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default FlowDetailsModal;
