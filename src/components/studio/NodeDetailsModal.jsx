import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Drawer,
  Divider,
  Stack,
  Chip,
  Tooltip,
  TextField,
} from '@mui/material';
import {
  X as CloseIcon,
  Settings as SettingsIcon,
  User as PersonIcon,
  Globe as PublicIcon,
  Code as CodeIcon,
  TextCursorInput as InputIcon,
  ChevronsLeftRightEllipsis as OutputIcon,
  Info as InfoIcon,
  Trash2 as DeleteIcon,
  Edit as EditIcon,
  Play as PlayIcon,
  Save as SaveIcon,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { getNodeColor } from '@/utils/commonFunction';
import { getParameterComponent } from './InputParameterComponents';
import CustomAccordion from '@/components/Common/CustomAccordion';
import OutputParameterComponents from './OutputParameterComponents';
import JsonOutputDrawer from './JsonOutputDrawer';
import { updateNode, runFlow } from '@/redux/slices/studioSlice';

const InfoItem = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0 text-xs">
    <div className="flex items-center gap-2 text-zinc-500">
      <span className="text-zinc-400">{icon}</span>
      <span>{label}</span>
    </div>
    <span className="font-semibold text-zinc-900">{value ?? 'N/A'}</span>
  </div>
);

const ModalHeader = ({
  title,
  type,
  onClose,
  onDelete,
  onUpdateName,
  handleSaveChanges,
  isDirty,
  disabled,
  loading,
  handleTestClick
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(title || 'Untitled Node');

  useEffect(() => {
    setEditedName(title || 'Untitled Node');
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
    <div className="flex items-center justify-between p-5 border-b border-zinc-200 bg-white sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
        <div className="h-9 w-9 rounded-xl bg-[#0d47a1] flex items-center justify-center text-white shrink-0 shadow-sm">
          <Activity size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <TextField
                value={editedName}
                onChange={handleNameChange}
                onKeyDown={handleKeyPress}
                size="small"
                autoFocus
                sx={{ '& .MuiInputBase-root': { fontSize: '13px', height: '32px' } }}
              />
            ) : (
              <h2 className="text-base font-bold text-zinc-900 truncate">
                {editedName}
              </h2>
            )}
            <button
              onClick={handleEditClick}
              className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
              title="Edit Node Title"
            >
              <EditIcon size={14} />
            </button>
          </div>
          <span className="text-[11px] font-mono font-semibold text-[#0d47a1] uppercase">
            {type || 'Node'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleTestClick}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-lg bg-[#0d47a1] hover:bg-[#0a3880] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          <PlayIcon size={13} />
          <span>Test</span>
        </button>

        <button
          onClick={handleSaveChanges}
          disabled={!isDirty || disabled || loading}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm ${
            isDirty
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
          }`}
        >
          <SaveIcon size={13} />
          <span>Save</span>
        </button>

        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete Node"
        >
          <DeleteIcon size={16} />
        </button>

        <div className="h-4 w-px bg-zinc-200 mx-1" />

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          title="Close Inspector"
        >
          <CloseIcon size={18} />
        </button>
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
  flow
}) => {
  const dispatch = useDispatch();
  const [localInputParams, setLocalInputParams] = useState([]);
  const [localOutputParams, setLocalOutputParams] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [outputDrawerOpen, setOutputDrawerOpen] = useState(false);
  const [output, setOutput] = useState(null);
  const isFlowRunning = useSelector(state => state.studio.isFlowRunning);

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

    try {
      await dispatch(
        runFlow({
          data: { test: node.id, agent_id: flowId },
          onSuccess: () => {
            console.log('Flow executed successfully');
          },
        })
      )
        .unwrap()
        .then((response) => {
          setOutput(response);
        });
    } catch (error) {
      console.error("Test execution error:", error);
    }
  };

  const handleSaveChanges = () => {
    if (node && isDirty) {
      dispatch(updateNode({
        flow: flow,
        nodeId: node.id,
        updatedNode: localInputParams,
        parameter: 'inputParameters',
      }));

      dispatch(updateNode({
        flow: flow,
        nodeId: node.id,
        updatedNode: localOutputParams,
        parameter: 'outputParameters',
      }));

      setIsDirty(false);
    }
  };

  const handleUpdateName = (newName) => {
    if (node && node.id) {
      dispatch(updateNode({
        flow: flow,
        nodeId: node.id,
        updatedNode: newName,
        parameter: 'displayName',
      }));
    }
  };

  const handleDelete = () => {
    if (onDelete && node) {
      onDelete(node);
      onClose();
    }
  };

  const { displayBasicInformation, displayInputParameters, displayOutputParameters } = sections;

  if (!node) return null;

  const { type, data } = node;
  const {
    description,
    version,
    isPublic,
    createdBy,
    status,
    tags,
  } = data;

  const nodeColor = getNodeColor(type);

  const basicInfo = [
    { label: 'Created By', value: createdBy, icon: <PersonIcon size={16} /> },
    { label: 'Version', value: version, icon: <SettingsIcon size={16} /> },
    { label: 'Public', value: isPublic ? 'Yes' : 'No', icon: <PublicIcon size={16} /> },
    { label: 'Status', value: status ? 'Active' : 'Inactive', icon: <CodeIcon size={16} /> },
  ];

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 560,
            maxWidth: '100%',
            backgroundColor: '#fafafa',
          },
        }}
      >
        <ModalHeader
          title={node?.data?.displayName || node?.data?.name || node?.name}
          type={node?.data?.type || node?.type}
          onClose={onClose}
          onDelete={handleDelete}
          onUpdateName={handleUpdateName}
          handleSaveChanges={handleSaveChanges}
          isDirty={isDirty}
          disabled={disabled}
          loading={loading}
          handleTestClick={handleTestClick}
        />

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Input Parameters Section */}
          {displayInputParameters && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <InputIcon size={16} className="text-[#0d47a1]" />
                  <h3 className="text-sm font-bold text-zinc-900">Input Parameters</h3>
                </div>
                <span className="text-xs font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                  {localInputParams?.length || 0} configured
                </span>
              </div>

              {localInputParams?.length > 0 ? (
                <div className="space-y-4">
                  {localInputParams.map((param, index) => (
                    <div key={index}>
                      {getParameterComponent(
                        param,
                        '#0d47a1',
                        (params) => handleParameterChange(params, 'inputParameters'),
                        localInputParams,
                        'inputParameters'
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-zinc-400">
                  No input parameters required for this node.
                </div>
              )}
            </div>
          )}

          {/* Output Parameters Section */}
          {displayOutputParameters && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <OutputIcon size={16} className="text-[#0d47a1]" />
                  <h3 className="text-sm font-bold text-zinc-900">Output Parameters</h3>
                </div>
                <span className="text-xs font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                  {localOutputParams?.length || 0} fields
                </span>
              </div>

              {localOutputParams?.length > 0 ? (
                <div className="space-y-4">
                  {localOutputParams.map((param, index) => (
                    <div key={index}>
                      <OutputParameterComponents param={param} color="#0d47a1" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-zinc-400">
                  No output parameters mapped.
                </div>
              )}
            </div>
          )}

          {/* Basic Information Panel */}
          {displayBasicInformation && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
                <InfoIcon size={16} className="text-[#0d47a1]" />
                <h3 className="text-sm font-bold text-zinc-900">Node Information</h3>
              </div>

              {description && (
                <p className="text-xs text-zinc-600 mb-4 bg-zinc-50 p-3 rounded-lg border border-zinc-200/80 leading-relaxed">
                  {description}
                </p>
              )}

              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-[#0d47a1] border border-blue-200/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="divide-y divide-zinc-100">
                {basicInfo.map((item) => (
                  <InfoItem key={item.label} {...item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Drawer>

      <JsonOutputDrawer
        open={outputDrawerOpen}
        onClose={() => setOutputDrawerOpen(false)}
        outputData={output}
        title={`${node?.data?.displayName || node?.data?.name || 'Node'} Execution Output`}
        status={isFlowRunning ? 'pending' : 'success'}
      />
    </>
  );
};

export default NodeDetailsModal;
