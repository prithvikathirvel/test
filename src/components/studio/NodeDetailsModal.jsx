import React from 'react';
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
  Button 
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
} from 'lucide-react';
import { convertToTitleCase } from '@/utils/commonFunction';
import { getNodeColor } from '@/utils/commonFunction';
import { getParameterComponent } from './InputParameterComponents';
import DashedBox from '@/components/Common/DashedBox';
import CustomAccordion from '@/components/Common/CustomAccordion';
import OutputParameterComponents from './OutputParameterComponents';

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
          <Chip key={index} label={tag} size="medium" className="!font-semibold !text-[12px] !font-sans !mr-4" sx={{border: '1px solid ' + color, backgroundColor: 'transparent'}} />
        ))
      )}
    </DashedBox>
  </Box>
);

const ModalHeader = ({ title, type, color, onClose, onDelete }) => (
  <Box className="p-3 text-black flex items-center justify-between">
    <BotIcon color={color} size={25} />
    <Box className="flex gap-4 justify-between min-w-70 items-center">
      <Typography className="font-bold">{title || 'Undefined Node'}</Typography>
      <Chip 
        label={convertToTitleCase(type)} 
        size="medium" 
        className="font-bold text-[0.7rem]" 
        sx={{ color: '#f5f5f7', ml: 2 ,backgroundColor: color}} 
      />
    </Box>
    <Box className="flex items-center gap-1">
      <Tooltip title="Edit Node">
        <IconButton 
          aria-label="Edit Node"
        >
          <EditIcon size={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Node">
        <IconButton 
          onClick={onDelete} 
          color="error"
          aria-label="Delete Node"
        >
          <DeleteIcon size={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Close">
        <IconButton 
          onClick={onClose} 
          aria-label="Close"
          sx={{ color: 'black' }}
        >
          <CloseIcon size={18} />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);

const InputParameterRenderer = ({ parameters, title, icon, color, loading, disabled, onUpdate,parameter }) => (
  <CustomAccordion 
    title={title} 
    icon={icon}
    emptyStateMessage={`No ${title.toLowerCase()} parameters available`}
   // badgeCount={parameters?.length}
   // badgeColor="primary"
   // tooltip={disabled ? undefined : `${title} - ${parameters?.length || 0} parameters`}
    loading={loading}
    loadingText={`Loading...`}
    disabled={disabled}
    // headerActions={
    //   parameters?.length > 0 && (
    //     <Tooltip title={`Add new ${title.toLowerCase()}`} arrow>
    //       <IconButton 
    //         size="small" 
    //         className="!w-6 !h-6 !bg-gray-50 hover:!bg-gray-100"
    //         onClick={() => {}}
    //         aria-label={`Add new ${title.toLowerCase()}`}
    //         disabled={disabled}
    //       >
    //         <Plus size={14} />
    //       </IconButton>
    //     </Tooltip>
    //   )
    // }
  >
    {parameters?.length > 0 && (
      <Stack spacing={2}>
        {parameters.map((param, index) => (
          <Box key={index}>
            {getParameterComponent(param, color, onUpdate,parameters,parameter)}
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
   // badgeCount={parameters?.length}
   // badgeColor="primary"
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
    icon={<InfoIcon size={20}/>}
    emptyStateMessage="No basic information available"
    tooltip={disabled ? undefined : (tags?.length > 0 ? `${tags.length} tags` : undefined)}
    loading={loading}
    loadingText="Loading basic information..."
    disabled={disabled}
    
    // headerActions={
    //   <Tooltip title="Edit basic information" arrow>
    //     <IconButton 
    //       size="small" 
    //       className="!w-6 !h-6 !bg-gray-50 hover:!bg-gray-100"
    //       onClick={() => {}}
    //       aria-label="Edit basic information"
    //       disabled={disabled}
    //     >
    //       <Edit size={14} />
    //     </IconButton>
    //   </Tooltip>
    // }
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
    displayOutputParameters: true
  }
}) => {
  const dispatch = useDispatch();

  const handleSaveNodeDetails = (updateParams,parameter) => {
    if (node) {
      // Call the onUpdateParameters function to save changes
      console.log('Saving parameters:',node.id, updateParams,parameter);
      onUpdateParameters(node.id, updateParams,parameter);
    }
  };

  const { 
    displayBasicInformation,
    displayInputParameters,
    displayOutputParameters, 
  } = sections;
  
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
    tags
  } = data;

  const nodeColor = getNodeColor(type);
  
  const basicInfo = [
    { label: 'Created By', value: createdBy, icon: <PersonIcon size={20} /> },
    { label: 'Version', value: version, icon: <SettingsIcon size={20} /> },
    { label: 'Public', value: isPublic ? 'Yes' : 'No', icon: <PublicIcon size={20} /> },
    { label: 'Status', value: status ? 'Active' : 'Inactive', icon: <CodeIcon size={20} /> },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      PaperProps={{
        sx: { width: '450px', position: 'absolute' },
      }}
    >
      <ModalHeader 
        title={name}
        icon={<BotIcon />}
        type={type}
        color={nodeColor}
        onClose={onClose}
        onDelete={() => onDelete(node)}
      />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {displayInputParameters && (
         <>
          <InputParameterRenderer 
            parameters={inputParameters} 
            title="Input Parameters" 
            icon={<InputIcon size={20} />} 
          color={nodeColor} 
          loading={loading}
          disabled={disabled}
          onUpdate={handleSaveNodeDetails}
          parameter={'inputParameters'}
        />
        <Divider sx={{ my: 2 }} />
        </>
        )}
        {displayOutputParameters && (
        <InputParameterRenderer 
        parameters={outputParameters} 
        title="Output Parameters" 
        icon={<OutputIcon size={20} />} 
        color={nodeColor} 
        loading={loading}
        disabled={disabled}
        onUpdate={handleSaveNodeDetails}
        parameter={'outputParameters'}
     />
        )}

    <Divider sx={{ my: 2 }} />

      {displayBasicInformation && (
         <>
          <BasicInformationSection 
            description={description}
            items={basicInfo}
            tags={tags}
            loading={loading}
            disabled={disabled}
            color={nodeColor}
          />
          <Divider sx={{ my: 2 }} />
          </>
        )}

      <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSaveNodeDetails}
          disabled={disabled}
        >
          Save
        </Button>
      </Box>
    </Drawer>
  );
};

export default NodeDetailsModal;
