import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Typography,
  Box,
  Drawer,
  Divider,
  Stack,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
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
  Bot as BotIcon,
  Tags as TagsIcon,
  Info as InfoIcon,
  Trash2 as DeleteIcon,
  Edit as EditIcon,
  Play as PlayIcon,
  Save as SaveIcon,
} from 'lucide-react';
import { convertToTitleCase } from '@/utils/commonFunction';
import { getNodeColor } from '@/utils/commonFunction';
import { getParameterComponent } from './InputParameterComponents';
import DashedBox from '@/components/Common/DashedBox';
import CustomAccordion from '@/components/Common/CustomAccordion';
import OutputParameterComponents from './OutputParameterComponents';
import JsonOutputDrawer from './JsonOutputDrawer';
import { updateNode } from '@/redux/slices/studioSlice';
import { runFlow } from '@/redux/slices/studioSlice';
import { useSelector } from 'react-redux';

const InfoItem = ({ label, value, icon }) => (
  <Box key={label} className="flex justify-between">
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, p: 0.5, color: 'gray' }}>
      {icon}
      <Typography variant="body2" sx={{ fontSize: '15px' }}>
        {label}
      </Typography>
    </Stack>
    <Typography variant="body2" sx={{ fontSize: '15px' }}>
      {value ?? 'N/A'}
    </Typography>
  </Box>
);

const DescriptionSection = ({ description }) => (
  <Box className="!mb-5">
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <DescriptionIcon className="text-gray-500" size={20} />
      <Typography variant="subtitle2">Description</Typography>
    </Stack>
    <DashedBox sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="body2">{description || 'No description available'}</Typography>
    </DashedBox>
  </Box>
);

const TagsSection = ({ tags, color }) => (
  <Box className="!mb-5">
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <TagsIcon className="text-gray-500" size={20} />
      <Typography variant="subtitle2">Tags</Typography>
    </Stack>
    <DashedBox sx={{ p: 2, borderRadius: 2 }}>
      {tags && tags.length > 0 && (
        tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            size="medium"
            className="!font-semibold !text-[12px] !font-sans !mr-4"
            sx={{ border: '1px solid ' + color, backgroundColor: 'transparent' }}
          />
        ))
      )}
    </DashedBox>
  </Box>
);

const ModalHeader = ({ title, type, color, onClose, onDelete, onUpdateName,handleSaveChanges,isDirty,disabled,loading,handleTestClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(title || 'Undefined Node');

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
    <Box className="flex justify-between items-center p-4">
      <Box className="flex gap-4 justify-between min-w-65  items-center">
        {isEditing ? (
          <TextField
            value={editedName}
            onChange={handleNameChange}
            onKeyPress={handleKeyPress}
            size="small"
            autoFocus
            className="min-w-[200px]"
          />
        ) : (
          <Typography className="font-bold">{editedName || 'Undefined Node'}</Typography>
        )}
        {/* <Chip
          label={convertToTitleCase(type)}
          size="medium"
          className="font-bold text-[0.7rem]"
          sx={{ color: '#f5f5f7', ml: 2, backgroundColor: color }}
        /> */}
      </Box>
      <Box className="flex items-center !gap-1 !m-2">

      <Tooltip title={isEditing ? "Test" : "Test"}>
          <IconButton
            onClick={handleTestClick}
            color={isEditing ? "primary" : "default"}
            aria-label={isEditing ? "Test" : "Test"}
            disabled={loading}
          >
            <PlayIcon size={18} color={'green'}/>
          </IconButton>
        </Tooltip>
        
        <Tooltip title={isEditing ? "Save Changes" : "Save Changes"}>
          <IconButton
            onClick={handleSaveChanges}
            color={isEditing ? "primary" : "default"}
            aria-label={isEditing ? "Save Changes" : "Save Changes"}
            disabled={!isDirty || disabled || loading}
          >
            <SaveIcon size={18} color={'blue'}/>
          </IconButton>
        </Tooltip>

        <Tooltip title={isEditing ? "Save Name" : "Edit Name"}>
          <IconButton
            onClick={handleEditClick}
            color={isEditing ? "primary" : "default"}
            aria-label={isEditing ? "Save Name" : "Edit Name"}
          >
            <EditIcon size={18} color={'grey'}/>
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Node">
          <IconButton
            onClick={onDelete}
            color="error"
            aria-label="Delete Node"
          >
            <DeleteIcon size={18} color={'red'}/>
          </IconButton>
        </Tooltip>
        <Tooltip title="Close">
          <IconButton
            onClick={onClose}
            aria-label="Close"
            sx={{ color: 'black',marginRight: '10px' }}
          >
            <CloseIcon size={18} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

const InputParameterRenderer = ({ parameters, title, icon, color, loading, disabled, onUpdate, parameter }) => (
  <CustomAccordion
    title={title}
    icon={icon}
    emptyStateMessage={`No ${title.toLowerCase()} parameters available`}
    loading={loading}
    loadingText={`Loading...`}
    disabled={disabled}
  >
    {parameters?.length > 0 && (
      <Stack spacing={2}>
        {parameters.map((param, index) => (
          <Box key={index}>
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
    emptyStateMessage={`No ${title.toLowerCase()} parameters available`}
    tooltip={disabled ? undefined : `${title} - ${parameters?.length || 0} parameters`}
    loading={loading}
    loadingText={`Loading...`}
    disabled={disabled}
  >
    {parameters?.length > 0 && (
      <Stack spacing={2}>
        {parameters.map((param, index) => (
          <Box key={index}>
            <OutputParameterComponents param={param} color={color} />
          </Box>
        ))}
      </Stack>
    )}
  </CustomAccordion>
);

const BasicInformationSection = ({ description, items, tags, loading, disabled, color }) => (
  <CustomAccordion
    title="Basic Information"
    icon={<InfoIcon size={20} />}
    emptyStateMessage="No basic information available"
    tooltip={disabled ? undefined : (tags?.length > 0 ? `${tags.length} tags` : undefined)}
    loading={loading}
    loadingText="Loading basic information..."
    disabled={disabled}
  >
    <DescriptionSection description={description} />
    <TagsSection tags={tags} color={color} />
    <DashedBox
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {items.map((item) => (
        <InfoItem key={item.label} {...item} />
      ))}
    </DashedBox>
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
  onOpenExecutionOutput
}) => {
  const dispatch = useDispatch();
  const [localInputParams, setLocalInputParams] = useState([]);
  const [localOutputParams, setLocalOutputParams] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [outputDrawerOpen, setOutputDrawerOpen] = useState(false);
  const [executionOutput, setExecutionOutput] = useState(null);
  const [output, setOutput] = useState(null);
  const [executionStatus, setExecutionStatus] = useState('success');
  const flowOutput = useSelector(state => state.studio.flowOutput);
  const isFlowRunning = useSelector(state => state.studio.isFlowRunning);

  useEffect(() => {
    if (node?.data) {
      setLocalInputParams(node.data.inputParameters || []);
      setLocalOutputParams(node.data.outputParameters || []);
      setIsDirty(false);
    }
  }, [node]);

  const handleParameterChange = (updatedParams, paramType, isLocalChange = false) => {
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
      const resultAction = await dispatch(
        runFlow({
          data: { test: node.id, agent_id: flowId },
          onSuccess: () => {
            console.log('Flow executed successfully');
          },
        })
      )
        .unwrap()
        .then((response) => {
          console.log("Response from sssss:", response);
          setOutput(response);
        })
        .catch((error) => {
          throw error;
        })
        .finally(() => {
        });

      
    } catch (error) {
      
    } finally {
      
    }
  
    // const resultAction = await dispatch(runFlow({ data: { test: node.id, agent_id: flowId } }));

    // if (runFlow.fulfilled.match(resultAction)) {
    //   setExecutionStatus('success');
      
    //   console.log("Payload to set:", resultAction.payload);
    //   console.log("Payload type:", typeof resultAction.payload);
    //   console.log("Is payload null/undefined?", resultAction.payload == null);
      
    //   setOutput(resultAction.payload); 
    // } 
    
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
    name,
    description,
    version,
    isPublic,
    createdBy,
    status,
    inputParameters,
    outputParameters,
    tags,
  } = data;

  const nodeColor = getNodeColor(type);

  const basicInfo = [
    { label: 'Created By', value: createdBy, icon: <PersonIcon size={20} /> },
    { label: 'Version', value: version, icon: <SettingsIcon size={20} /> },
    { label: 'Public', value: isPublic ? 'Yes' : 'No', icon: <PublicIcon size={20} /> },
    { label: 'Status', value: status ? 'Active' : 'Inactive', icon: <CodeIcon size={20} /> },
  ];

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 480,
            maxWidth: '100%',
          },
        }}
      >
        <ModalHeader
          title={node?.data?.name || node?.name}
          type={node?.data?.type || node?.type}
          color={getNodeColor(node?.data?.type || node?.type)}
          onClose={onClose}
          onDelete={handleDelete}
          onUpdateName={handleUpdateName}
          handleSaveChanges={handleSaveChanges}
          isDirty={isDirty}
          disabled={disabled}
          loading={loading}
          handleTestClick={handleTestClick}
        />

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          {displayInputParameters && (
            <InputParameterRenderer
              parameters={localInputParams}
              title="Input Parameters"
              icon={<InputIcon size={20} />}
              color={nodeColor}
              loading={loading}
              disabled={disabled}
              onUpdate={(params, type) => handleParameterChange(params, 'inputParameters')}
              parameter={'inputParameters'}
            />
          )}

          {displayOutputParameters && (
            <InputParameterRenderer
              parameters={localOutputParams}
              title="Output Parameters"
              icon={<OutputIcon size={20} />}
              color={nodeColor}
              loading={loading}
              disabled={disabled}
              onUpdate={(params, type) => handleParameterChange(params, 'outputParameters')}
              parameter={'outputParameters'}
            />
          )}

          <Divider sx={{ my: 2 }} />

          {displayBasicInformation && (
            <BasicInformationSection
              description={description}
              items={basicInfo}
              tags={tags}
              loading={loading}
              disabled={disabled}
              color={nodeColor}
            />
          )}

          {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleTestClick}
              disabled={disabled || loading}
              startIcon={<PlayIcon size={16} />}
              sx={{
                borderColor: nodeColor,
                color: nodeColor,
                '&:hover': {
                  borderColor: nodeColor,
                  backgroundColor: `${nodeColor}10`
                }
              }}
            >
              Test & View Output
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
              disabled={!isDirty || disabled || loading}
              sx={{
                backgroundColor: nodeColor,
                '&:hover': {
                  backgroundColor: nodeColor,
                  opacity: 0.9
                }
              }}
            >
              Save Changes
            </Button>
          </Box> */}
        </Box>
      </Drawer>

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