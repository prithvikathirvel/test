import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Drawer,
  Dialog,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  Tabs,
  Tab,
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
  Save as SaveIcon,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { getNodeColor } from '@/utils/commonFunction';
import { getParameterComponent } from './InputParameterComponents';
import CustomAccordion from '@/components/Common/CustomAccordion';
import OutputParameterComponents from './OutputParameterComponents';
import JsonOutputDrawer from './JsonOutputDrawer';
import { updateNode, runFlow } from '@/redux/slices/studioSlice';
import { getNodeDocs, toDisplayString } from './nodeDocsData';

const InfoItem = ({ label, value, icon }) => (
  <Box key={label} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
      {icon}
      <Typography variant="body2" className="!text-[12.5px] !text-slate-600">
        {label}
      </Typography>
    </Stack>
    <Typography variant="body2" className="!text-[12.5px] !font-medium !text-slate-800">
      {value ?? 'N/A'}
    </Typography>
  </Box>
);

const DescriptionSection = ({ description }) => (
  <Box className="mb-4">
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <DescriptionIcon className="text-slate-400" size={15} />
      <Typography className="!text-[12.5px] !font-semibold !text-slate-700">Description</Typography>
    </Stack>
    <Box className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
      <Typography className="!text-[12.5px] !text-slate-600 !leading-relaxed">
        {description || 'No description available.'}
      </Typography>
    </Box>
  </Box>
);

const TagsSection = ({ tags }) => (
  <Box className="mb-4">
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <TagsIcon className="text-slate-400" size={15} />
      <Typography className="!text-[12.5px] !font-semibold !text-slate-700">Tags</Typography>
    </Stack>
    <Box className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-wrap gap-1.5">
      {tags && tags.length > 0 ? (
        tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs"
          >
            {tag}
          </span>
        ))
      ) : (
        <Typography className="!text-[11px] !text-slate-400">No tags configured</Typography>
      )}
    </Box>
  </Box>
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
    <Box className="flex justify-between items-center px-6 py-3.5 border-b border-slate-200/80 bg-slate-50/70">
      <Box className="flex items-center gap-3 min-w-0">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
          style={{ backgroundColor: color || '#4f46e5' }}
        />
        {isEditing ? (
          <TextField
            value={editedName}
            onChange={handleNameChange}
            onKeyPress={handleKeyPress}
            size="small"
            autoFocus
            className="min-w-[220px] bg-white"
            sx={{ '& input': { fontSize: '13.5px', py: '5px' } }}
          />
        ) : (
          <Box className="min-w-0">
            <Typography className="!font-bold !text-[14.5px] !text-slate-800 !tracking-tight !truncate">
              {editedName || 'Undefined Node'}
            </Typography>
            <Typography className="!text-[10.5px] !text-slate-400 font-mono uppercase tracking-wider">
              {type || 'Custom Node'}
            </Typography>
          </Box>
        )}

        <IconButton
          onClick={handleEditClick}
          size="small"
          className="!text-slate-400 hover:!text-slate-700 !p-1"
          title={isEditing ? 'Save Name' : 'Edit Name'}
        >
          <EditIcon size={13} />
        </IconButton>
      </Box>

      {/* Action Controls */}
      <Box className="flex items-center gap-2">
        {isDirty && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Unsaved Changes
          </span>
        )}

        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
          <Tooltip title="Test Node Execution">
            <IconButton
              onClick={handleTestClick}
              disabled={loading}
              size="small"
              className="!p-1.5 !text-slate-700 hover:!bg-slate-50 !rounded-md"
            >
              <PlayIcon size={14} className="fill-slate-700" />
            </IconButton>
          </Tooltip>

          <Tooltip title={isDirty ? "Save Changes" : "No changes to save"}>
            <span>
              <IconButton
                onClick={handleSaveChanges}
                disabled={!isDirty || disabled || loading}
                size="small"
                className={`!p-1.5 !rounded-md transition-all ${
                  isDirty
                    ? '!text-indigo-600 !bg-indigo-50 hover:!bg-indigo-100'
                    : '!text-slate-400 hover:!bg-slate-50'
                }`}
              >
                <SaveIcon size={14} />
              </IconButton>
            </span>
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

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <Tooltip title={isExpanded ? "Collapse to Side Panel" : "Expand to Centered Modal"}>
            <IconButton
              onClick={toggleExpand}
              size="small"
              className="!p-1.5 !text-slate-600 hover:!text-slate-900 hover:!bg-slate-50 !rounded-md"
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
      </Box>
    </Box>
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
  const [outputDrawerOpen, setOutputDrawerOpen] = useState(false);
  const [output, setOutput] = useState(null);
  const [copiedExample, setCopiedExample] = useState(false);
  const isFlowRunning = useSelector((state) => state.studio.isFlowRunning);

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

  const handleTestClick = async () => {
    if (!node?.id) return;
    setOutputDrawerOpen(true);

    try {
      const response = await dispatch(
        runFlow({
          data: { test: node.id, agent_id: flowId },
          onSuccess: () => {
            console.log('Flow executed successfully');
          },
        })
      ).unwrap();
      setOutput(response);
    } catch (error) {
      console.error('Test execution error:', error);
    }
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
              height: '84vh',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f8fafc',
            },
          }}
        >
          <ModalHeader {...headerProps} />

          {/* Modal Center 2-Column Body */}
          <Box className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Main Area (8 Cols) */}
            <Box className="lg:col-span-8 border-r border-slate-200/80 bg-white flex flex-col h-full overflow-hidden">
              <Box className="px-6 pt-3 border-b border-slate-100 flex items-center justify-between">
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => setActiveTab(val)}
                  sx={{
                    minHeight: '38px',
                    '& .MuiTab-root': {
                      fontSize: '12.5px',
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: '38px',
                      color: '#64748b',
                      '&.Mui-selected': { color: '#4f46e5' },
                    },
                    '& .MuiTabs-indicator': { backgroundColor: '#4f46e5', height: 2 },
                  }}
                >
                  <Tab
                    icon={<InputIcon size={14} />}
                    iconPosition="start"
                    label={`Inputs (${localInputParams?.length || 0})`}
                  />
                  <Tab
                    icon={<OutputIcon size={14} />}
                    iconPosition="start"
                    label={`Outputs (${localOutputParams?.length || 0})`}
                  />
                  <Tab
                    icon={<BookOpen size={14} />}
                    iconPosition="start"
                    label="Docs & Examples"
                  />
                </Tabs>
              </Box>

              <Box className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Tab 0: Input Parameters */}
                {activeTab === 0 && (
                  <Box>
                    <Box className="mb-4">
                      <Typography className="!text-[13.5px] !font-bold !text-slate-800">
                        Input Parameters
                      </Typography>
                      <Typography className="!text-[11.5px] !text-slate-400">
                        Configure variable values and connectors for this node.
                      </Typography>
                    </Box>

                    {localInputParams?.length > 0 ? (
                      <Stack spacing={2.5}>
                        {localInputParams.map((param, index) => (
                          <Box
                            key={index}
                            className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
                          >
                            {getParameterComponent(param, nodeColor, (params) => handleInputChange(params), localInputParams, 'inputParameters')}
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Box className="py-14 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <Sliders size={24} className="mx-auto text-slate-300 mb-1.5" />
                        <Typography className="!text-xs !font-semibold !text-slate-600">
                          No Input Parameters
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Tab 1: Output Parameters */}
                {activeTab === 1 && (
                  <Box>
                    <Box className="mb-4">
                      <Typography className="!text-[13.5px] !font-bold !text-slate-800">
                        Output Parameters
                      </Typography>
                      <Typography className="!text-[11.5px] !text-slate-400">
                        Edit output variable names to map values into downstream nodes.
                      </Typography>
                    </Box>

                    {localOutputParams?.length > 0 ? (
                      <Stack spacing={2.5}>
                        {localOutputParams.map((param, index) => (
                          <OutputParameterComponents
                            key={index}
                            param={param}
                            index={index}
                            color={nodeColor}
                            onUpdate={(updated) => handleOutputParamUpdate(index, updated)}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Box className="py-14 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <OutputIcon size={24} className="mx-auto text-slate-300 mb-1.5" />
                        <Typography className="!text-xs !font-semibold !text-slate-600">
                          No Output Parameters Configured
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Tab 2: Documentation & Interactive Examples */}
                {activeTab === 2 && (
                  <Box className="space-y-5">
                    {/* Summary & When to Use */}
                    <Box className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles size={15} className="text-indigo-600" />
                        <Typography className="!text-[13px] !font-bold !text-slate-800">
                          {toDisplayString(nodeDocs?.title, "Node Documentation")}
                        </Typography>
                      </div>
                      <Typography className="!text-[12.5px] !text-slate-600 !leading-relaxed mb-3">
                        {toDisplayString(nodeDocs?.summary) || toDisplayString(description)}
                      </Typography>
                      {nodeDocs?.whenToUse && (
                        <div className="text-[12px] text-indigo-900/80 bg-white/80 p-2.5 rounded-lg border border-indigo-100/60">
                          <strong className="text-indigo-950 font-semibold">When to use: </strong>
                          {toDisplayString(nodeDocs.whenToUse)}
                        </div>
                      )}
                    </Box>

                    {/* Field Reference Guide */}
                    {nodeDocs?.parameters?.length > 0 && (
                      <Box>
                        <Typography className="!text-[12.5px] !font-bold !text-slate-800 mb-2">
                          Input Fields Reference
                        </Typography>
                        <div className="space-y-2">
                          {nodeDocs.parameters.map((p, pIdx) => (
                            <div key={pIdx} className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-slate-800">{toDisplayString(p.name)}</span>
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                                  {toDisplayString(p.type, "text")} {p.required ? "• required" : "• optional"}
                                </span>
                              </div>
                              <p className="text-slate-500 text-[11.5px]">{toDisplayString(p.description)}</p>
                              {toDisplayString(p.example) && (
                                <div className="mt-1 font-mono text-[11px] text-slate-600 bg-white px-2 py-1 rounded border border-slate-200/60 whitespace-pre-wrap break-words max-h-32 overflow-auto">
                                  <span className="text-slate-400">Example: </span>
                                  {toDisplayString(p.example)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </Box>
                    )}

                    {/* Example Pipeline Workflow */}
                    {nodeDocs?.exampleWorkflow && (
                      <Box>
                        <Typography className="!text-[12.5px] !font-bold !text-slate-800 mb-1.5">
                          Recommended Flow Pipeline
                        </Typography>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-1.5 overflow-x-auto">
                          {toDisplayString(nodeDocs.exampleWorkflow)}
                        </div>
                      </Box>
                    )}

                    {/* Copyable Sample Payload */}
                    {nodeDocs?.exampleConfig && (
                      <Box>
                        <div className="flex items-center justify-between mb-2">
                          <Typography className="!text-[12.5px] !font-bold !text-slate-800">
                            Sample Payload
                          </Typography>
                          <button
                            onClick={handleCopyExample}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md shadow-2xs transition-colors"
                          >
                            {copiedExample ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            <span>{copiedExample ? "Copied!" : "Copy Payload"}</span>
                          </button>
                        </div>
                        <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-auto max-h-48">
                          <code>{JSON.stringify(nodeDocs.exampleConfig, null, 2)}</code>
                        </pre>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Bottom Footer Actions */}
              <Box className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <Typography className="!text-[11.5px] !text-slate-400">
                  {isDirty ? 'Unsaved changes' : 'All changes saved'}
                </Typography>
                <Box className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={!isDirty || disabled || loading}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs"
                  >
                    Save Changes
                  </button>
                </Box>
              </Box>
            </Box>

            {/* Right Inspector Panel (4 Cols) */}
            <Box className="lg:col-span-4 bg-slate-50 flex flex-col h-full overflow-y-auto p-5 space-y-4">
              <Box className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <Typography className="!text-[12.5px] !font-bold !text-slate-800 mb-3 flex items-center gap-2">
                  <InfoIcon size={14} className="text-indigo-600" />
                  Node Information
                </Typography>
                <DescriptionSection description={description} />
                <TagsSection tags={tags} />
                <Box className="mt-3 pt-2.5 border-t border-slate-100">
                  {basicInfo.map((item) => (
                    <InfoItem key={item.label} {...item} />
                  ))}
                </Box>
              </Box>

              {/* Quick Test Execution Widget */}
              <Box className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <Typography className="!text-[12.5px] !font-bold !text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-indigo-600" />
                    Test Execution
                  </span>
                </Typography>
                <Typography className="!text-[11.5px] !text-slate-500 mb-3.5">
                  Execute this node in isolation to preview output variables.
                </Typography>

                <button
                  onClick={handleTestClick}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                >
                  <PlayIcon size={13} className="fill-slate-700 text-slate-700" /> Run Node Test
                </button>
              </Box>
            </Box>
          </Box>
        </Dialog>
      ) : (
        /* ─── DOCKED RIGHT SLIDE-OVER DRAWER VIEW ─── */
        <Drawer
          anchor="right"
          open={open}
          onClose={onClose}
          PaperProps={{
            sx: {
              width: 560,
              maxWidth: '100%',
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          <ModalHeader {...headerProps} />

          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }} className="space-y-4">
            {sections.displayInputParameters && (
              <CustomAccordion
                title="Input Parameters"
                icon={<InputIcon size={16} />}
                emptyStateMessage="No input parameters available."
              >
                <Stack spacing={2}>
                  {localInputParams.map((param, index) => (
                    <Box key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      {getParameterComponent(param, nodeColor, (params) => handleInputChange(params), localInputParams, 'inputParameters')}
                    </Box>
                  ))}
                </Stack>
              </CustomAccordion>
            )}

            {sections.displayOutputParameters && (
              <CustomAccordion
                title="Output Parameters"
                icon={<OutputIcon size={16} />}
                emptyStateMessage="No output parameters configured."
              >
                <Stack spacing={2}>
                  {localOutputParams.map((param, index) => (
                    <OutputParameterComponents
                      key={index}
                      param={param}
                      index={index}
                      color={nodeColor}
                      onUpdate={(updated) => handleOutputParamUpdate(index, updated)}
                    />
                  ))}
                </Stack>
              </CustomAccordion>
            )}

            <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

            {sections.displayBasicInformation && (
              <Box className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <DescriptionSection description={description} />
                <TagsSection tags={tags} />
                <Box className="mt-2 pt-2 border-t border-slate-200">
                  {basicInfo.map((item) => (
                    <InfoItem key={item.label} {...item} />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Drawer>
      )}

      <JsonOutputDrawer
        open={outputDrawerOpen}
        onClose={() => setOutputDrawerOpen(false)}
        outputData={output}
        title={`${node?.data?.name || 'Node'} Execution Output`}
        status={isFlowRunning ? 'pending' : 'success'}
      />
    </>
  );
};

export default NodeDetailsModal;
