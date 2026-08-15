import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Drawer,
  Dialog,
  IconButton,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  X as CloseIcon,
  Settings as SettingsIcon,
  User as PersonIcon,
  Globe as PublicIcon,
  NotepadText as DescriptionIcon,
  Code as CodeIcon,
  TextCursorInput as InputIcon,
  ChevronsLeftRightEllipsis as OutputIcon,
  Tags as TagsIcon,
  Info as InfoIcon,
  Trash2 as DeleteIcon,
  Edit as EditIcon,
  Play as PlayIcon,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { getNodeColor } from '@/utils/commonFunction';
import { getParameterComponent } from './InputParameterComponents';
import CustomAccordion from '@/components/Common/CustomAccordion';
import OutputParameterComponents from './OutputParameterComponents';
import NodeTestModal from './NodeTestModal';
import { updateNode } from '@/redux/slices/studioSlice';
import { getNodeDocs, toDisplayString } from './nodeDocsData';

const InfoItem = ({ label, value, icon }) => (
  <div key={label} className="flex justify-between items-center py-2 group">
    <div className="flex items-center gap-2 text-slate-500">
      {icon}
      <span className="text-[12px]">{label}</span>
    </div>
    <span className="text-[12px] font-medium text-slate-800">
      {value ?? 'N/A'}
    </span>
  </div>
);

const DescriptionSection = ({ description }) => (
  <div className="mb-3">
    <div className="flex items-center gap-1.5 mb-1.5">
      <DescriptionIcon className="text-slate-400" size={13} />
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Description</span>
    </div>
    <p className="text-[12.5px] text-slate-600 leading-relaxed">
      {description || 'No description available.'}
    </p>
  </div>
);

const TagsSection = ({ tags }) => (
  <div className="mb-3">
    <div className="flex items-center gap-1.5 mb-1.5">
      <TagsIcon className="text-slate-400" size={13} />
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Tags</span>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {tags && tags.length > 0 ? (
        tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-slate-100 text-slate-600"
          >
            {tag}
          </span>
        ))
      ) : (
        <span className="text-[11px] text-slate-400 italic">No tags</span>
      )}
    </div>
  </div>
);

const ModalHeader = ({
  title,
  type,
  color,
  onClose,
  onDelete,
  onUpdateName,
  handleSaveChanges,
  isDirty,
  disabled,
  loading,
  handleTestClick,
  isExpanded,
  toggleExpand,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(title || 'Undefined Node');

  useEffect(() => {
    setEditedName(title || 'Undefined Node');
  }, [title]);

  const handleEditClick = () => {
    if (isEditing) {
      onUpdateName(editedName);
    }
    setIsEditing(!isEditing);
  };

  const handleNameChange = (e) => {
    setEditedName(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onUpdateName(editedName);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: color || '#6366f1' }}
        >
          <SettingsIcon size={15} className="text-white" />
        </div>
        {isEditing ? (
          <TextField
            value={editedName}
            onChange={handleNameChange}
            onKeyPress={handleKeyPress}
            size="small"
            autoFocus
            className="min-w-[200px]"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '13px',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
                '&.Mui-focused fieldset': { borderColor: '#94a3b8' },
              },
              '& input': { py: '6px' },
            }}
          />
        ) : (
          <div className="min-w-0">
            <h3 className="text-[14.5px] font-semibold text-slate-900 truncate leading-tight">
              {editedName || 'Undefined Node'}
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {type || 'Custom Node'}
            </span>
          </div>
        )}

        <button
          onClick={handleEditClick}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={isEditing ? 'Save Name' : 'Edit Name'}
        >
          <EditIcon size={13} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {isDirty && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10.5px] font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Unsaved
          </span>
        )}

        <button
          onClick={handleSaveChanges}
          disabled={!isDirty || disabled || loading}
          className="px-3 py-1.5 text-[12px] font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Save
        </button>

        <div className="flex items-center gap-0.5 ml-1">
          <Tooltip title="Test Node">
            <IconButton
              onClick={handleTestClick}
              disabled={loading}
              size="small"
              className="!p-1.5 !text-slate-500 hover:!text-emerald-600 hover:!bg-emerald-50 !rounded-md"
            >
              <PlayIcon size={14} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Node">
            <IconButton
              onClick={onDelete}
              size="small"
              className="!p-1.5 !text-slate-400 hover:!text-red-600 hover:!bg-red-50 !rounded-md"
            >
              <DeleteIcon size={14} />
            </IconButton>
          </Tooltip>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          <Tooltip title={isExpanded ? "Dock to side" : "Expand"}>
            <IconButton
              onClick={toggleExpand}
              size="small"
              className="!p-1.5 !text-slate-500 hover:!text-slate-800 hover:!bg-slate-100 !rounded-md"
            >
              {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Close">
            <IconButton
              onClick={onClose}
              size="small"
              className="!p-1.5 !text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !rounded-md"
            >
              <CloseIcon size={14} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

const NodeDetailsModal = ({
  flowId,
  open,
  onClose,
  node,
  onDelete,
  onUpdateParameters,
  disabled,
  loading,
  sections = {
    displayBasicInformation: true,
    displayInputParameters: true,
    displayOutputParameters: true,
  },
  flow,
  onOpenExecutionOutput,
}) => {
  const dispatch = useDispatch();
  // Default to big screen centered modal
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [localInputParams, setLocalInputParams] = useState([]);
  const [localOutputParams, setLocalOutputParams] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [nodeTestOpen, setNodeTestOpen] = useState(false);
  const [copiedExample, setCopiedExample] = useState(false);

  useEffect(() => {
    if (node?.data) {
      setLocalInputParams(node.data.inputParameters || []);
      setLocalOutputParams(node.data.outputParameters || []);
      setIsDirty(false);
    }
  }, [node]);

  const nodeDocs = getNodeDocs(node);

  const handleInputChange = (updatedParams) => {
    setLocalInputParams(updatedParams);
    setIsDirty(true);
  };

  const handleOutputParamUpdate = (index, updatedParam) => {
    const updated = [...localOutputParams];
    updated[index] = updatedParam;
    setLocalOutputParams(updated);
    setIsDirty(true);
  };

  const handleCopyExample = () => {
    if (nodeDocs?.exampleConfig) {
      navigator.clipboard.writeText(JSON.stringify(nodeDocs.exampleConfig, null, 2));
      setCopiedExample(true);
      setTimeout(() => setCopiedExample(false), 2000);
    }
  };

  const handleTestClick = () => {
    if (!node?.id) return;
    setNodeTestOpen(true);
  };

  const handleSaveChanges = () => {
    if (node && isDirty) {
      dispatch(
        updateNode({
          flow: flow,
          nodeId: node.id,
          updatedNode: localInputParams,
          parameter: 'inputParameters',
        })
      );

      dispatch(
        updateNode({
          flow: flow,
          nodeId: node.id,
          updatedNode: localOutputParams,
          parameter: 'outputParameters',
        })
      );

      setIsDirty(false);
    }
  };

  const handleUpdateName = (newName) => {
    if (node && node.id) {
      dispatch(
        updateNode({
          flow: flow,
          nodeId: node.id,
          updatedNode: newName,
          parameter: 'displayName',
        })
      );
    }
  };

  const handleDelete = () => {
    if (onDelete && node) {
      onDelete(node);
      onClose();
    }
  };

  if (!node) return null;

  const { type, data } = node;
  const {
    name,
    description,
    version,
    isPublic,
    createdBy,
    status,
    tags,
  } = data || {};

  const nodeColor = getNodeColor(type || data?.type);

  const basicInfo = [
    { label: 'Created By', value: createdBy || 'User', icon: <PersonIcon size={14} /> },
    { label: 'Version', value: version || '1.0.0', icon: <SettingsIcon size={14} /> },
    { label: 'Visibility', value: isPublic ? 'Public' : 'Private', icon: <PublicIcon size={14} /> },
    { label: 'Status', value: status ? 'Active' : 'Draft', icon: <CodeIcon size={14} /> },
  ];

  const headerProps = {
    title: node?.data?.name || node?.name,
    type: node?.data?.type || node?.type,
    color: nodeColor,
    onClose,
    onDelete: handleDelete,
    onUpdateName: handleUpdateName,
    handleSaveChanges,
    isDirty,
    disabled,
    loading,
    handleTestClick,
    isExpanded,
    toggleExpand: () => setIsExpanded(!isExpanded),
  };

  return (
    <>
      {/* ─── EXPANDED CENTERED MODAL VIEW (DEFAULT) ─── */}
      {isExpanded ? (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: '82vh',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
            },
          }}
        >
          <ModalHeader {...headerProps} />

          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* Left Main Area */}
            <div className="lg:col-span-8 border-r border-slate-100 flex flex-col h-full overflow-hidden">
              {/* Pill-style tab bar */}
              <div className="flex items-center gap-0.5 px-5 py-1.5 border-b border-slate-100 bg-slate-50/50">
                {[
                  { idx: 0, icon: <InputIcon size={13} />, label: `Inputs (${localInputParams?.length || 0})` },
                  { idx: 1, icon: <OutputIcon size={13} />, label: `Outputs (${localOutputParams?.length || 0})` },
                  { idx: 2, icon: <BookOpen size={13} />, label: "Docs" },
                ].map((t) => (
                  <button
                    key={t.idx}
                    onClick={() => setActiveTab(t.idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                      activeTab === t.idx
                        ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {/* Tab 0: Input Parameters */}
                {activeTab === 0 && (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-[13px] font-semibold text-slate-800">Input Parameters</h4>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">
                        Configure values and connectors for this node.
                      </p>
                    </div>

                    {localInputParams?.length > 0 ? (
                      <div className="space-y-3">
                        {localInputParams.map((param, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white"
                          >
                            {getParameterComponent(param, nodeColor, (params) => handleInputChange(params), localInputParams, 'inputParameters')}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center border border-dashed border-slate-200 rounded-lg">
                        <Sliders size={20} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-[12px] font-medium text-slate-500">No Input Parameters</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">This node has no configurable inputs.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 1: Output Parameters */}
                {activeTab === 1 && (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-[13px] font-semibold text-slate-800">Output Parameters</h4>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">
                        Map output values to downstream nodes.
                      </p>
                    </div>

                    {localOutputParams?.length > 0 ? (
                      <div className="space-y-3">
                        {localOutputParams.map((param, index) => (
                          <OutputParameterComponents
                            key={index}
                            param={param}
                            index={index}
                            color={nodeColor}
                            onUpdate={(updated) => handleOutputParamUpdate(index, updated)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center border border-dashed border-slate-200 rounded-lg">
                        <OutputIcon size={20} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-[12px] font-medium text-slate-500">No Output Parameters</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">This node has no configured outputs.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Documentation */}
                {activeTab === 2 && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-slate-600" />
                        <h4 className="text-[13px] font-semibold text-slate-800">
                          {toDisplayString(nodeDocs?.title, "Node Documentation")}
                        </h4>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-relaxed">
                        {toDisplayString(nodeDocs?.summary) || toDisplayString(description)}
                      </p>
                      {nodeDocs?.whenToUse && (
                        <div className="mt-3 text-[11.5px] text-slate-600 bg-white p-2.5 rounded-md border border-slate-200">
                          <span className="font-semibold text-slate-700">When to use: </span>
                          {toDisplayString(nodeDocs.whenToUse)}
                        </div>
                      )}
                    </div>

                    {nodeDocs?.parameters?.length > 0 && (
                      <div>
                        <h5 className="text-[12px] font-semibold text-slate-700 mb-2">Field Reference</h5>
                        <div className="space-y-2">
                          {nodeDocs.parameters.map((p, pIdx) => (
                            <div key={pIdx} className="p-3 rounded-md border border-slate-200 bg-white">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[11.5px] font-semibold text-slate-800">{toDisplayString(p.name)}</span>
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                  {toDisplayString(p.type, "text")} · {p.required ? "required" : "optional"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">{toDisplayString(p.description)}</p>
                              {toDisplayString(p.example) && (
                                <div className="mt-1.5 font-mono text-[10.5px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 whitespace-pre-wrap break-words max-h-28 overflow-auto">
                                  <span className="text-slate-400">e.g. </span>
                                  {toDisplayString(p.example)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {nodeDocs?.exampleWorkflow && (
                      <div>
                        <h5 className="text-[12px] font-semibold text-slate-700 mb-1.5">Pipeline Example</h5>
                        <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-[11px] font-mono text-slate-600 overflow-x-auto">
                          {toDisplayString(nodeDocs.exampleWorkflow)}
                        </div>
                      </div>
                    )}

                    {nodeDocs?.exampleConfig && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-[12px] font-semibold text-slate-700">Sample Payload</h5>
                          <button
                            onClick={handleCopyExample}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
                          >
                            {copiedExample ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            <span>{copiedExample ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[11px] font-mono overflow-auto max-h-44 leading-relaxed">
                          <code>{JSON.stringify(nodeDocs.exampleConfig, null, 2)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between bg-white">
                <span className="text-[11px] text-slate-400">
                  {isDirty ? 'You have unsaved changes' : 'Up to date'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={!isDirty || disabled || loading}
                    className="px-3.5 py-1.5 text-[12px] font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-4 flex flex-col h-full overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {/* Node Info Card */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
                  <InfoIcon size={13} className="text-slate-500" />
                  <span className="text-[12px] font-semibold text-slate-700">Details</span>
                </div>
                <DescriptionSection description={description} />
                <TagsSection tags={tags} />
                <div className="pt-2 border-t border-slate-100 space-y-0">
                  {basicInfo.map((item) => (
                    <InfoItem key={item.label} {...item} />
                  ))}
                </div>
              </div>

              {/* Quick Test Card */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <PlayIcon size={13} className="text-slate-500" />
                  <span className="text-[12px] font-semibold text-slate-700">Quick Test</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Run this node in isolation to preview output.
                </p>
                <button
                  onClick={handleTestClick}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-50 rounded-md transition-colors"
                >
                  <PlayIcon size={12} /> Run Test
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      ) : (
        /* ─── DOCKED RIGHT DRAWER VIEW ─── */
        <Drawer
          anchor="right"
          open={open}
          onClose={onClose}
          PaperProps={{
            sx: {
              width: 520,
              maxWidth: '100%',
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <ModalHeader {...headerProps} />

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sections.displayInputParameters && (
              <CustomAccordion
                title="Input Parameters"
                icon={<InputIcon size={14} />}
                emptyStateMessage="No input parameters available."
              >
                <div className="space-y-2.5">
                  {localInputParams.map((param, index) => (
                    <div key={index} className="p-3 rounded-md border border-slate-200 bg-white">
                      {getParameterComponent(param, nodeColor, (params) => handleInputChange(params), localInputParams, 'inputParameters')}
                    </div>
                  ))}
                </div>
              </CustomAccordion>
            )}

            {sections.displayOutputParameters && (
              <CustomAccordion
                title="Output Parameters"
                icon={<OutputIcon size={14} />}
                emptyStateMessage="No output parameters configured."
              >
                <div className="space-y-2.5">
                  {localOutputParams.map((param, index) => (
                    <OutputParameterComponents
                      key={index}
                      param={param}
                      index={index}
                      color={nodeColor}
                      onUpdate={(updated) => handleOutputParamUpdate(index, updated)}
                    />
                  ))}
                </div>
              </CustomAccordion>
            )}

            {sections.displayBasicInformation && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <DescriptionSection description={description} />
                <TagsSection tags={tags} />
                <div className="pt-2 border-t border-slate-100">
                  {basicInfo.map((item) => (
                    <InfoItem key={item.label} {...item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Drawer>
      )}

      <NodeTestModal
        open={nodeTestOpen}
        onClose={() => setNodeTestOpen(false)}
        node={node}
      />
    </>
  );
};

export default NodeDetailsModal;
