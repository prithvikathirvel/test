import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogActions, Box, Typography, IconButton } from '@mui/material';
import { X, Network, AlertTriangle, Upload, ClipboardPaste, FileText, CheckCircle2 } from 'lucide-react';
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

const validateFlowJsonShape = (json) => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return 'The pasted JSON must be a flow object.';
  }
  if (!json.graphSpec || typeof json.graphSpec !== 'object') {
    return 'This is not a valid flow JSON: missing graphSpec object.';
  }
  if (!Array.isArray(json.graphSpec.nodes)) {
    return 'This is not a valid flow JSON: graphSpec.nodes must be an array.';
  }
  if (!Array.isArray(json.graphSpec.edges)) {
    return 'This is not a valid flow JSON: graphSpec.edges must be an array.';
  }
  return '';
};

const parseFlowJson = (text) => {
  if (!text?.trim()) return { flow: null, error: '', isValidFlow: false };
  try {
    const parsed = JSON.parse(text);
    const shapeError = validateFlowJsonShape(parsed);
    if (shapeError) return { flow: null, error: shapeError, isValidFlow: false };
    return { flow: parsed, error: '', isValidFlow: true };
  } catch (err) {
    return { flow: null, error: `Invalid JSON: ${err.message}`, isValidFlow: false };
  }
};

const FlowSummary = ({ flow }) => {
  if (!flow) return null;
  const name = flow.name || flow.agent_name || 'Untitled Flow';
  const description = flow.description || flow.agent_description || flow.graphSpec?.description || 'No description in JSON.';
  const nodes = Array.isArray(flow.graphSpec?.nodes) ? flow.graphSpec.nodes : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 size={15} className="text-emerald-600" />
        <span className="text-[12px] font-semibold text-slate-800">Valid flow JSON detected</span>
      </div>
      <div className="space-y-2 text-[12px]">
        <div>
          <span className="font-semibold text-slate-600">Name: </span>
          <span className="text-slate-800">{name}</span>
        </div>
        <div>
          <span className="font-semibold text-slate-600">Description: </span>
          <span className="text-slate-600">{description}</span>
        </div>
      </div>
      <div className="mt-3">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Nodes ({nodes.length})
        </p>
        <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
          {nodes.length > 0 ? nodes.map((node, index) => (
            <span key={node.node_id || index} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10.5px] font-medium text-slate-600">
              {node.displayName || node.name || node.node_id || `Node ${index + 1}`}
            </span>
          )) : (
            <span className="text-[11px] text-slate-400">No nodes found.</span>
          )}
        </div>
      </div>
    </div>
  );
};

const CollisionWarnings = ({ errors, onIgnoreOne, onIgnoreAll }) => {
  if (!errors.length) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-amber-800">
        <AlertTriangle size={15} />
        <span className="text-[12px] font-semibold">Output collision warning</span>
      </div>
      <p className="mb-3 text-[11.5px] text-amber-800/80">
        These warnings are in the imported JSON. You can ignore them and continue, or fix the JSON before creating.
      </p>
      <div className="space-y-2">
        {errors.map((err, idx) => (
          <div key={idx} className="rounded-lg border border-amber-200 bg-white/80 p-3 text-[11.5px] text-slate-700">
            <p>{err.message}</p>
            {err.occurrences?.length > 0 && (
              <p className="mt-1 text-slate-500">Nodes: {err.occurrences.map((o) => o.nodeName).join(', ')}</p>
            )}
            <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2">
              <p className="mb-1 text-[10.5px] text-slate-500">Use only if this duplicate output is intentional.</p>
              <button
                type="button"
                onClick={() => onIgnoreOne(err)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[10.5px] font-semibold text-slate-800 hover:bg-slate-100"
              >
                <CheckCircle2 size={11} /> Ignore only this warning
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onIgnoreAll}
        className="mt-3 rounded-md bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-900"
      >
        Skip all warnings
      </button>
    </div>
  );
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

  const activeDetails = importedFlow
    ? {
        name: importedFlow.name || importedFlow.agent_name || '',
        description: importedFlow.description || importedFlow.agent_description || importedFlow.graphSpec?.description || '',
      }
    : flowDetails;

  const runImportedValidation = () => {
    if (activeMode === 'blank') return true;
    if (!importedFlow) return false;
    const result = validateFlowOutputVariables(importedFlow.graphSpec?.nodes || []);
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
    setSkippedValidationIds(new Set());
  };

  const handleSubmit = () => {
    if (!runImportedValidation()) return;

    const importedGraphSpec = importedFlow?.graphSpec ? cleanGraphSpec(importedFlow.graphSpec) : null;
    onSubmit({
      ...initialData,
      ...(importedFlow || {}),
      name: activeDetails?.name,
      description: activeDetails?.description,
      graphSpec: importedGraphSpec || (initialData?.graphSpec ? cleanGraphSpec(initialData.graphSpec) : undefined),
    });
    onClose();
  };

  const ignoreOne = (err) => {
    const id = getValidationErrorId(err);
    setSkippedValidationIds((prev) => new Set([...prev, id]));
    setValidationErrors((current) => current.filter((item) => getValidationErrorId(item) !== id));
  };

  const ignoreAll = () => {
    setSkippedValidationIds((prev) => new Set([...prev, ...validationErrors.map(getValidationErrorId)]));
    setValidationErrors([]);
  };

  const modeTabs = [
    { id: 'blank', label: 'Blank', icon: FileText, help: 'Start with an empty canvas.' },
    { id: 'paste', label: 'Paste', icon: ClipboardPaste, help: 'Paste a flow JSON payload.' },
    { id: 'import', label: 'Import', icon: Upload, help: 'Upload a .json flow file.' },
  ];

  const canSubmit = activeMode === 'blank'
    ? Boolean(flowDetails.name?.trim() && flowDetails.description?.trim())
    : Boolean(importedFlow && activeDetails.name?.trim() && activeDetails.description?.trim() && !importParse.error);

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
                  onClick={() => {
                    setActiveMode(id);
                    setValidationErrors([]);
                    setSkippedValidationIds(new Set());
                  }}
                  className={`rounded-lg px-3 py-2 text-left transition-colors ${activeMode === id ? 'bg-white border border-slate-300 text-slate-900' : 'border border-transparent text-slate-500 hover:bg-white/70'}`}
                >
                  <span className="flex items-center gap-1.5 text-[12px] font-semibold"><Icon size={13} /> {label}</span>
                  <span className="mt-0.5 block text-[10.5px] leading-snug text-slate-400">{help}</span>
                </button>
              ))}
            </div>
          )}

          {(!canImport || activeMode === 'blank') && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Basic details</span>
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
          )}

          {canImport && activeMode === 'paste' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ClipboardPaste size={14} className="text-slate-600" />
                <span className="text-[12px] font-semibold text-slate-700">Paste Flow JSON</span>
              </div>
              <textarea
                value={pasteText}
                onChange={(event) => {
                  setPasteText(event.target.value);
                  setValidationErrors([]);
                  setSkippedValidationIds(new Set());
                }}
                rows={8}
                placeholder='{ "name": "Shopping Assistant", "description": "...", "graphSpec": { "nodes": [], "edges": [] } }'
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[11.5px] text-slate-800 outline-none resize-y focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
              />
              {pasteText.trim() && importParse.error && <p className="mt-2 text-[11.5px] font-medium text-red-600">{importParse.error}</p>}
              {pasteText.trim() && importedFlow && <FlowSummary flow={importedFlow} />}
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
                <span className="mt-0.5 text-[11px] text-slate-400">After upload, details and nodes will be shown below.</span>
                <input type="file" accept="application/json,.json" onChange={handleFileImport} className="hidden" />
              </label>
              {importText.trim() && importParse.error && <p className="mt-2 text-[11.5px] font-medium text-red-600">{importParse.error}</p>}
              {importText.trim() && importedFlow && <div className="mt-3"><FlowSummary flow={importedFlow} /></div>}
            </div>
          )}

          <CollisionWarnings errors={validationErrors} onIgnoreOne={ignoreOne} onIgnoreAll={ignoreAll} />
        </div>
      </DialogContent>

      <DialogActions className="!px-6 !py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5">
        <CustomButton variant="outlined" onClick={onClose}>Cancel</CustomButton>
        <CustomButton variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
          {isClone ? 'Clone Flow' : isEdit ? 'Save Changes' : 'Create Flow'}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default FlowDetailsModal;
