import React from 'react';
import {
  Typography,
  Box,
  Drawer,
  Divider,
  Stack,
  Paper,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  ChevronDown,
  Info,
  InfoIcon,
} from 'lucide-react';
import { convertToTitleCase, getNodeColor } from '@/utils/commonFunction';
import { getParameterComponent } from './ParameterComponents';

/**
 * Renders parameters (input/output) in a consistent format.
 */
const ParameterRenderer = ({ parameters, title, icon, color }) => (

  <Accordion defaultExpanded className="!shadow-none border border-gray-300 !rounded-[8px]">

    <AccordionSummary expandIcon={<ChevronDown />}>
      {/* <Box className="flex items-center gap-2">
        <Info />
        <Typography className="font-semibold">Basic Information</Typography>
      </Box> */}

      <Stack direction="row" alignItems="center" spacing={1}>
          {icon}
          <Typography variant="subtitle1" fontWeight="bold">
            {title}
          </Typography>
        </Stack>
    </AccordionSummary>
    <AccordionDetails>
      <Box sx={{ mb: 3 }}>
        {(!parameters || parameters.length === 0) ? (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No {title.toLowerCase()} parameters available
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {parameters.map((param, index) => (

              <Box>
                {getParameterComponent(param, color)}
              </Box>
              // <Paper
              //   key={index}
              //   variant="outlined"
              //   sx={{
              //     p: 2,
              //     bgcolor: 'red',
              //     borderRadius: 2,
              //     transition: 'all 0.2s ease-in-out',
              //     '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.05)', bgcolor: 'grey.100' },
              //   }}
              // >

              // </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </AccordionDetails>
  </Accordion>
);

/**
 * Renders the Basic Information section with dynamic data.
 */
const BasicInfo = ({ info }) => (
  <Paper
    variant="outlined"
    elevation={0}
    sx={{
      p: 2,
      mb: 3,
      borderRadius: 2,
      borderColor: 'grey.300',
      backgroundColor: '#f5f5f7',
    }}
  >
    {info.map(({ label, value, icon }) => (
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
    ))}
  </Paper>
);

/**
 * Main NodeDetailsModal Component.
 */
const NodeDetailsModal = ({ node, open, onClose }) => {
  if (!node) return null;

  const { type, data } = node;
  const { name, description, version, isPublic, createdBy, status, specifications, inputParameters, outputParameters } = data;

  const nodeColor = getNodeColor(type);

  const basicInfo = [
    { label: 'Created By', value: createdBy, icon: <PersonIcon /> },
    { label: 'Version', value: version, icon: <SettingsIcon /> },
    { label: 'Public', value: isPublic ? 'Yes' : 'No', icon: <PublicIcon /> },
    { label: 'Status', value: status, icon: <CodeIcon /> },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      PaperProps={{
        sx: { width: '450px', position: 'absolute', borderTopLeftRadius: 20 },
      }}
    >
      <Box className="p-3 text-black flex items-center justify-between">
        <BotIcon color={nodeColor} size={25} />
        <Box className="flex gap-4 justify-between min-w-80 items-center">
          <Typography className="font-bold">{name || 'Undefined Node'}</Typography>
          <Chip label={convertToTitleCase(type)} size="medium" className="font-bold text-[0.7rem] bg-[#f5f5f7]" sx={{ color: nodeColor }} />
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'black', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' } }}>
          <CloseIcon />
        </IconButton>
      </Box>

    

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>

        <Accordion defaultExpanded className="!shadow-none border border-gray-300">
          <AccordionSummary expandIcon={<ChevronDown />}>
          <Stack direction="row" alignItems="center" spacing={1}>
          <InfoIcon/>
          <Typography variant="subtitle1" fontWeight="bold">
            Basic Information
          </Typography>
        </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <DescriptionIcon className="text-gray-500" size={20} />
                <Typography variant="subtitle1">Description</Typography>
              </Stack>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f7' }}>
                <Typography variant="body2">{description || 'No description available'}</Typography>
              </Paper>
            </Box>
            <BasicInfo info={basicInfo} />
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2 }} />

        <ParameterRenderer parameters={inputParameters} title="Input Parameters" icon={<InputIcon />} color={nodeColor} />
        <Divider sx={{ my: 2 }} />
        <ParameterRenderer parameters={outputParameters} title="Output Parameters" icon={<OutputIcon />} color={nodeColor} />
      </Box>
    </Drawer>
  );
};

export default NodeDetailsModal;
