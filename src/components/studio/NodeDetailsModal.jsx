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
  Plus,
} from 'lucide-react';
import { getNodeColor } from '@/utils/commonFunction';
import { getParameterComponent } from './InputParameterComponents';
import CustomAccordion from '@/components/Common/CustomAccordion';
import OutputParameterComponents from './OutputParameterComponents';
import JsonOutputDrawer from './JsonOutputDrawer';
import { updateNode, runFlow } from '@/redux/slices/studioSlice';
import CustomButton from '@/components/Common/CustomButton';

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

          <Tooltip title={isDirty ? "Save Parameter Changes" : "No changes to save"}>
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
  // Set big screen centered modal as the default
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [localInputParams, setLocalInputParams] = useState([]);
  const [localOutputParams, setLocalOutputParams] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [outputDrawerOpen, setOutputDrawerOpen] = useState(false);
  const [output, setOutput] = useState(null);
  const isFlowRunning = useSelector((state) => state.studio.isFlowRunning);

  useEffect(() => {
    if (node?.data) {
      setLocalInputParams(node.data.inputParameters || []);
      setLocalOutputParams(node.data.outputParameters || []);
      setIsDirty(false);
    }
  }, [node]);

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

  const handleOutputParamDelete = (index) => {
    const updated = localOutputParams.filter((_, i) => i !== index);
    setLocalOutputParams(updated);
    setIsDirty(true);
  };

  const handleAddOutputParam = () => {
    const newParam = {
      key: `output_${localOutputParams.length + 1}`,
      name: `output_${localOutputParams.length + 1}`,
      type: 'text',
      value: '',
    };
    setLocalOutputParams([...localOutputParams, newParam]);
    setIsDirty(true);
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
            {/* Left Main Parameter Studio Area (8 Cols) */}
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
                </Tabs>
              </Box>

              <Box className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeTab === 0 && (
                  <Box>
                    <Box className="flex items-center justify-between mb-4">
                      <div>
                        <Typography className="!text-[13.5px] !font-bold !text-slate-800">
                          Input Parameters
                        </Typography>
                        <Typography className="!text-[11.5px] !text-slate-400">
                          Configure variable values and connectors for this node.
                        </Typography>
                      </div>
                    </Box>

                    {localInputParams?.length > 0 ? (
                      <Stack spacing={2.5}>
                        {localInputParams.map((param, index) => (
                          <Box
                            key={index}
                            className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
                          >
                            <Box className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                                {param.key || `Parameter ${index + 1}`}
                              </span>
                              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {param.type || 'text'}
                              </span>
                            </Box>
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

                {activeTab === 1 && (
                  <Box>
                    <Box className="flex items-center justify-between mb-4">
                      <div>
                        <Typography className="!text-[13.5px] !font-bold !text-slate-800">
                          Output Parameters
                        </Typography>
                        <Typography className="!text-[11.5px] !text-slate-400">
                          Edit output variable names exposed to subsequent nodes.
                        </Typography>
                      </div>

                      <button
                        onClick={handleAddOutputParam}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors"
                      >
                        <Plus size={13} /> Add Output Variable
                      </button>
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
                            onDelete={(idx) => handleOutputParamDelete(idx)}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Box className="py-14 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <OutputIcon size={24} className="mx-auto text-slate-300 mb-1.5" />
                        <Typography className="!text-xs !font-semibold !text-slate-600">
                          No Output Parameters Configured
                        </Typography>
                        <button
                          onClick={handleAddOutputParam}
                          className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-2xs"
                        >
                          <Plus size={13} /> Add Output Variable
                        </button>
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
                      onDelete={(idx) => handleOutputParamDelete(idx)}
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
