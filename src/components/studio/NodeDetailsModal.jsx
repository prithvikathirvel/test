import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Drawer,
  Dialog,
  Divider,
  Stack,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
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
  Bot as BotIcon,
  Tags as TagsIcon,
  Info as InfoIcon,
  Trash2 as DeleteIcon,
  Edit as EditIcon,
  Play as PlayIcon,
  Save as SaveIcon,
  Maximize2,
  Minimize2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { convertToTitleCase, getNodeColor } from '@/utils/commonFunction';
import { getParameterComponent } from './InputParameterComponents';
import DashedBox from '@/components/Common/DashedBox';
import CustomAccordion from '@/components/Common/CustomAccordion';
import OutputParameterComponents from './OutputParameterComponents';
import JsonOutputDrawer from './JsonOutputDrawer';
import { updateNode, runFlow } from '@/redux/slices/studioSlice';
import CustomButton from '@/components/Common/CustomButton';

const InfoItem = ({ label, value, icon }) => (
  <Box key={label} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#64748b' }}>
      {icon}
      <Typography variant="body2" className="!text-[13px] !text-slate-600">
        {label}
      </Typography>
    </Stack>
    <Typography variant="body2" className="!text-[13px] !font-medium !text-slate-900">
      {value ?? 'N/A'}
    </Typography>
  </Box>
);

const DescriptionSection = ({ description }) => (
  <Box className="mb-4">
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <DescriptionIcon className="text-slate-400" size={16} />
      <Typography className="!text-[13px] !font-semibold !text-slate-700">Description</Typography>
    </Stack>
    <Box className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
      <Typography className="!text-[13px] !text-slate-600 !leading-relaxed">
        {description || 'No description available for this component.'}
      </Typography>
    </Box>
  </Box>
);

const TagsSection = ({ tags, color }) => (
  <Box className="mb-4">
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <TagsIcon className="text-slate-400" size={16} />
      <Typography className="!text-[13px] !font-semibold !text-slate-700">Tags & Capabilities</Typography>
    </Stack>
    <Box className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-wrap gap-1.5">
      {tags && tags.length > 0 ? (
        tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs"
          >
            {tag}
          </span>
        ))
      ) : (
        <Typography className="!text-[12px] !text-slate-400">No tags configured</Typography>
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
    <Box className="flex justify-between items-center px-6 py-4 border-b border-slate-200/80 bg-slate-50/70">
      <Box className="flex items-center gap-3 min-w-0">
        <span
          className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
          style={{ backgroundColor: color || '#2563eb' }}
        />
        {isEditing ? (
          <TextField
            value={editedName}
            onChange={handleNameChange}
            onKeyPress={handleKeyPress}
            size="small"
            autoFocus
            className="min-w-[220px] bg-white"
            sx={{ '& input': { fontSize: '14px', py: '6px' } }}
          />
        ) : (
          <Box className="min-w-0">
            <Typography className="!font-bold !text-[15px] !text-slate-900 !tracking-tight !truncate">
              {editedName || 'Undefined Node'}
            </Typography>
            <Typography className="!text-[11px] !text-slate-500 font-medium uppercase tracking-wider">
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
          <EditIcon size={14} />
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

        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
          <Tooltip title="Test Node Execution">
            <IconButton
              onClick={handleTestClick}
              disabled={loading}
              size="small"
              className="!p-1.5 !text-emerald-700 hover:!bg-emerald-50 !rounded-md"
            >
              <PlayIcon size={15} className="fill-emerald-600 text-emerald-600" />
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
                    ? '!text-blue-600 !bg-blue-50 hover:!bg-blue-100'
                    : '!text-slate-400 hover:!bg-slate-50'
                }`}
              >
                <SaveIcon size={15} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Delete Node">
            <IconButton
              onClick={onDelete}
              size="small"
              className="!p-1.5 !text-slate-400 hover:!text-red-600 hover:!bg-red-50 !rounded-md"
            >
              <DeleteIcon size={15} />
            </IconButton>
          </Tooltip>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          <Tooltip title={isExpanded ? "Collapse to Side Panel" : "Expand to Centered Modal"}>
            <IconButton
              onClick={toggleExpand}
              size="small"
              className="!p-1.5 !text-slate-600 hover:!text-blue-600 hover:!bg-blue-50 !rounded-md"
            >
              {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Close">
            <IconButton
              onClick={onClose}
              size="small"
              className="!p-1.5 !text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !rounded-md"
            >
              <CloseIcon size={15} />
            </IconButton>
          </Tooltip>
        </div>
      </Box>
    </Box>
  );
};

const InputParameterRenderer = ({ parameters, title, icon, color, loading, disabled, onUpdate, parameter }) => (
  <CustomAccordion
    title={title}
    icon={icon}
    emptyStateMessage={`No ${title.toLowerCase()} parameters available for this node.`}
    loading={loading}
    loadingText={`Loading parameters...`}
    disabled={disabled}
  >
    {parameters?.length > 0 && (
      <Stack spacing={2.5}>
        {parameters.map((param, index) => (
          <Box key={index} className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
            {getParameterComponent(param, color, onUpdate, parameters, parameter)}
          </Box>
        ))}
      </Stack>
    )}
  </CustomAccordion>
);

const OutputParameterRenderer = ({ parameters, title, icon, color, loading, disabled }) => (
  <CustomAccordion
    title={title}
    icon={icon}
    emptyStateMessage={`No ${title.toLowerCase()} parameters configured.`}
    tooltip={disabled ? undefined : `${title} - ${parameters?.length || 0} outputs`}
    loading={loading}
    loadingText={`Loading outputs...`}
    disabled={disabled}
  >
    {parameters?.length > 0 && (
      <Stack spacing={2}>
        {parameters.map((param, index) => (
          <Box key={index} className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
            <OutputParameterComponents param={param} color={color} />
          </Box>
        ))}
      </Stack>
    )}
  </CustomAccordion>
);

const BasicInformationSection = ({ description, items, tags, loading, disabled, color }) => (
  <CustomAccordion
    title="Node Metadata & Specs"
    icon={<InfoIcon size={18} />}
    emptyStateMessage="No basic information available"
    tooltip={disabled ? undefined : (tags?.length > 0 ? `${tags.length} tags` : undefined)}
    loading={loading}
    loadingText="Loading information..."
    disabled={disabled}
  >
    <DescriptionSection description={description} />
    <TagsSection tags={tags} color={color} />
    <Box className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
      {items.map((item) => (
        <InfoItem key={item.label} {...item} />
      ))}
    </Box>
  </CustomAccordion>
);

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [localInputParams, setLocalInputParams] = useState([]);
  const [localOutputParams, setLocalOutputParams] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [outputDrawerOpen, setOutputDrawerOpen] = useState(false);
  const [executionOutput, setExecutionOutput] = useState(null);
  const [output, setOutput] = useState(null);
  const [executionStatus, setExecutionStatus] = useState('success');
  const isFlowRunning = useSelector((state) => state.studio.isFlowRunning);

  useEffect(() => {
    if (node?.data) {
      setLocalInputParams(node.data.inputParameters || []);
      setLocalOutputParams(node.data.outputParameters || []);
      setIsDirty(false);
    }
  }, [node]);

  const handleParameterChange = (updatedParams, paramType) => {
    if (paramType === 'inputParameters') {
      setLocalInputParams(updatedParams);
    } else if (paramType === 'outputParameters') {
      setLocalOutputParams(updatedParams);
    }
    setIsDirty(true);
  };

  const handleTestClick = async () => {
    if (!node?.id) return;
    setOutputDrawerOpen(true);
    setExecutionStatus('pending');
    setExecutionOutput({ status: 'executing', message: 'Test execution started...' });

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
    { label: 'Created By', value: createdBy || 'System', icon: <PersonIcon size={16} /> },
    { label: 'Version', value: version || '1.0.0', icon: <SettingsIcon size={16} /> },
    { label: 'Visibility', value: isPublic ? 'Public Tool' : 'Private Node', icon: <PublicIcon size={16} /> },
    { label: 'Status', value: status ? 'Active' : 'Draft', icon: <CodeIcon size={16} /> },
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
      {/* ─── EXPANDED CENTERED MODAL VIEW ─── */}
      {isExpanded ? (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              height: '88vh',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
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
              <Box className="px-6 pt-4 border-b border-slate-100 flex items-center justify-between">
                <Tabs
                  value={activeTab}
                  onChange={(e, val) => setActiveTab(val)}
                  sx={{
                    minHeight: '42px',
                    '& .MuiTab-root': {
                      fontSize: '13px',
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: '42px',
                      color: '#64748b',
                      '&.Mui-selected': { color: '#2563eb' },
                    },
                    '& .MuiTabs-indicator': { backgroundColor: '#2563eb', height: 2 },
                  }}
                >
                  <Tab
                    icon={<InputIcon size={15} />}
                    iconPosition="start"
                    label={`Inputs (${localInputParams?.length || 0})`}
                  />
                  <Tab
                    icon={<OutputIcon size={15} />}
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
                        <Typography className="!text-[14px] !font-bold !text-slate-900">
                          Input Parameters
                        </Typography>
                        <Typography className="!text-[12px] !text-slate-500">
                          Configure dynamic values, variables, and connectors for this node.
                        </Typography>
                      </div>
                    </Box>

                    {localInputParams?.length > 0 ? (
                      <Stack spacing={3}>
                        {localInputParams.map((param, index) => (
                          <Box
                            key={index}
                            className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
                          >
                            <Box className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                {param.key || `Parameter ${index + 1}`}
                              </span>
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                {param.type || 'text'}
                              </span>
                            </Box>
                            {getParameterComponent(param, nodeColor, (params) => handleParameterChange(params, 'inputParameters'), localInputParams, 'inputParameters')}
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Box className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <Sliders size={28} className="mx-auto text-slate-300 mb-2" />
                        <Typography className="!text-sm !font-semibold !text-slate-600">
                          No Input Parameters
                        </Typography>
                        <Typography className="!text-xs !text-slate-400 mt-1">
                          This node does not require incoming arguments.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Box className="flex items-center justify-between mb-4">
                      <div>
                        <Typography className="!text-[14px] !font-bold !text-slate-900">
                          Output Parameters
                        </Typography>
                        <Typography className="!text-[12px] !text-slate-500">
                          Variables produced by this node and exposed to subsequent workflow steps.
                        </Typography>
                      </div>
                    </Box>

                    {localOutputParams?.length > 0 ? (
                      <Stack spacing={3}>
                        {localOutputParams.map((param, index) => (
                          <Box
                            key={index}
                            className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 shadow-2xs"
                          >
                            <OutputParameterComponents param={param} color={nodeColor} />
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Box className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
                        <OutputIcon size={28} className="mx-auto text-slate-300 mb-2" />
                        <Typography className="!text-sm !font-semibold !text-slate-600">
                          No Output Parameters
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>

              {/* Bottom Footer Actions */}
              <Box className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <Typography className="!text-[12px] !text-slate-500">
                  {isDirty ? 'Unsaved parameter changes pending' : 'All parameters up to date'}
                </Typography>
                <Box className="flex items-center gap-2">
                  <CustomButton variant="outlined" onClick={onClose} size="small">
                    Close
                  </CustomButton>
                  <CustomButton
                    variant="contained"
                    onClick={handleSaveChanges}
                    disabled={!isDirty || disabled || loading}
                    size="small"
                  >
                    Save Node
                  </CustomButton>
                </Box>
              </Box>
            </Box>

            {/* Right Inspector & Live Testing Panel (4 Cols) */}
            <Box className="lg:col-span-4 bg-slate-50 flex flex-col h-full overflow-y-auto p-6 space-y-5">
              <Box className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <Typography className="!text-[13px] !font-bold !text-slate-900 mb-3 flex items-center gap-2">
                  <InfoIcon size={16} className="text-blue-600" />
                  Node Information
                </Typography>
                <DescriptionSection description={description} />
                <TagsSection tags={tags} color={nodeColor} />
                <Box className="mt-3 pt-3 border-t border-slate-100">
                  {basicInfo.map((item) => (
                    <InfoItem key={item.label} {...item} />
                  ))}
                </Box>
              </Box>

              {/* Quick Test Execution Widget */}
              <Box className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <Typography className="!text-[13px] !font-bold !text-slate-900 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-600" />
                    Test Execution
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Isolated Run</span>
                </Typography>
                <Typography className="!text-[12px] !text-slate-500 mb-4">
                  Run this node in isolation with current parameter values to inspect schema output.
                </Typography>

                <CustomButton
                  variant="outlined"
                  onClick={handleTestClick}
                  disabled={loading}
                  startIcon={<PlayIcon size={14} className="text-emerald-600" />}
                  fullWidth
                  className="!border-slate-200 hover:!border-emerald-300 hover:!bg-emerald-50/40"
                >
                  Execute Node Test
                </CustomButton>
              </Box>
            </Box>
          </Box>
        </Dialog>
      ) : (
        /* ─── DEFAULT RIGHT SLIDE-OVER DRAWER VIEW ─── */
        <Drawer
          anchor="right"
          open={open}
          onClose={onClose}
          PaperProps={{
            sx: {
              width: 580,
              maxWidth: '100%',
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <ModalHeader {...headerProps} />

          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }} className="space-y-4">
            {sections.displayInputParameters && (
              <InputParameterRenderer
                parameters={localInputParams}
                title="Input Parameters"
                icon={<InputIcon size={18} />}
                color={nodeColor}
                loading={loading}
                disabled={disabled}
                onUpdate={(params) => handleParameterChange(params, 'inputParameters')}
                parameter={'inputParameters'}
              />
            )}

            {sections.displayOutputParameters && (
              <OutputParameterRenderer
                parameters={localOutputParams}
                title="Output Parameters"
                icon={<OutputIcon size={18} />}
                color={nodeColor}
                loading={loading}
                disabled={disabled}
                onUpdate={(params) => handleParameterChange(params, 'outputParameters')}
                parameter={'outputParameters'}
              />
            )}

            <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />

            {sections.displayBasicInformation && (
              <BasicInformationSection
                description={description}
                items={basicInfo}
                tags={tags}
                loading={loading}
                disabled={disabled}
                color={nodeColor}
              />
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
