"use client";

import { Box, Typography, IconButton, Select, MenuItem, TextField, Button } from "@mui/material";
import { Handle, Position } from "reactflow";
import { Bot, Workflow, Database, Circle, CloudUpload, Link as LinkIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { useMemo, useState } from "react";
import { TextCursorInput } from "lucide-react";

const getNodeIcon = (type, tools, agents, models, inputs) => {
  const item = [...tools, ...agents, ...models, ...inputs].find((item) => item.type === type);

  if (!item) return <Workflow size={20} />;

  switch (item.type?.toLowerCase()) {
    case "tool":
      return <Workflow size={20} />;
    case "agent":
      return <Bot size={20} />;
    case "model":
      return <Database size={20} />;
    case "input":
      return <TextCursorInput size={20} />;
    default:
      return <Workflow size={20} />; 
  }
};

const getNodeColor = (type, tools, agents, models, inputs) => {
  const item = [...tools, ...agents, ...models, ...inputs].find((item) => item.type === type);

  if (!item) return "#ddd";

  switch (item.type?.toLowerCase()) {
    case "tool":
      return "#6c5ce7";
    case "agent":
      return "#00b894";
    case "model":
      return "#0984e3";
    case "input":
      return "#0284e3";
    default:
      return "#6c5ce7";
  }
};

function CustomNode({ data, type }) {
  const tools = useSelector((state) => state.studio.tools.data);
  const agents = useSelector((state) => state.studio.agents.data);
  const models = useSelector((state) => state.studio.models.data);
  const inputs = useSelector((state) => state.studio.inputs.data);

  const color = getNodeColor(type, tools, agents, models, inputs);
  const icon = getNodeIcon(type, tools, agents, models, inputs);

  return (
    <Box
      sx={{
        padding: "12px 16px",
        borderRadius: "8px",
        backgroundColor: "#fff",
        minWidth: "180px",
        border: "2px solid",
        borderColor: color,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        position: "relative",
        "&:hover": {
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: color,
          width: 8,
          height: 8,
          left: -4,
        }}
      />
      <Box className="flex items-center gap-2">
        <Box sx={{ color }}>{icon}</Box>
        <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{data.name}</Typography>
        <IconButton
          size="small"
          sx={{
            ml: "auto",
            width: 20,
            height: 20,
            backgroundColor: `${color}20`,
            color,
            "&:hover": {
              backgroundColor: `${color}30`,
            },
          }}
        >
          <Circle size={12} />
        </IconButton>
      </Box>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: color,
          width: 8,
          height: 8,
          right: -4,
        }}
      />
    </Box>
  );
}

const InputCustomNode = ({ data, ...props }) => {
  const [inputType, setInputType] = useState('local');
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState(null);

  const handleInputTypeChange = (event) => {
    setInputType(event.target.value);
    setInputValue('');
    setFile(null);
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setInputValue(uploadedFile.name);
  };

  const handleUrlChange = (event) => {
    setInputValue(event.target.value);
  };

  const renderInputComponent = () => {
    switch (inputType) {
      case 'local':
        return (
          <Box sx={{ width: '100%', textAlign: 'center',height:'150px' }}>
            <Button 
              component="label" 
              variant="contained" 
              startIcon={<CloudUpload size={16} />}
              sx={{ 
                backgroundColor: '#6c5ce7', 
                '&:hover': { backgroundColor: '#5a4bd1' },
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.85rem',
                py: 0.8
              }}
            >
              Upload File
              <input 
                type="file" 
                hidden 
                onChange={handleFileUpload} 
              />
            </Button>
          </Box>
        );
      case 'drive':
        return (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              startIcon={<LinkIcon size={16} />}
              sx={{ 
                borderColor: '#6c5ce7', 
                color: '#6c5ce7',
                '&:hover': { 
                  backgroundColor: 'rgba(108, 92, 231, 0.1)' 
                },
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.85rem',
                py: 0.8
              }}
            >
              Connect Google Drive
            </Button>
          </Box>
        );
      case 'customUrl':
        return (
          <TextField 
            fullWidth 
            size="small"
            variant="outlined" 
            placeholder="Enter URL" 
            value={inputValue}
            onChange={handleUrlChange}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&.Mui-focused fieldset': {
                  borderColor: '#6c5ce7',
                },
              },
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box 
      sx={{
        width: 280,
        height: 'auto',
        border: '1px solid #6c5ce7',
        borderRadius: '12px',
        p: 2,
        position: 'relative',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(108, 92, 231, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ 
          background: '#6c5ce7', 
          width: 10, 
          height: 10,
          right: -5
        }}
      />
      
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 1
      }}>
        <Typography 
          sx={{ 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            color: '#6c5ce7',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}
        >
          <TextCursorInput size={18} />
          Input Source
        </Typography>
        
        <Select
          value={inputType}
          onChange={handleInputTypeChange}
          variant="standard"
          sx={{ 
            fontSize: '0.85rem',
            '&:before': { borderBottom: '1px solid #6c5ce7' },
            '&:hover:not(.Mui-disabled):before': { borderBottom: '1px solid #6c5ce7' },
            '& .MuiSelect-select': { 
              paddingBottom: 0,
              color: '#6c5ce7',
              fontWeight: 500
            }
          }}
        >
          <MenuItem value="local" sx={{ fontSize: '0.85rem' }}>Local File</MenuItem>
          <MenuItem value="drive" sx={{ fontSize: '0.85rem' }}>Google Drive</MenuItem>
          <MenuItem value="customUrl" sx={{ fontSize: '0.85rem' }}>Custom URL</MenuItem>
        </Select>
      </Box>
      
      <Box sx={{ 
        borderTop: '1px solid #e0e0e0',
        pt: 2,
        width: '100%'
      }}>
        {renderInputComponent()}
      </Box>
      
      {inputValue && (
        <Box sx={{ 
          mt: 1, 
          width: '100%', 
          textAlign: 'center',
          color: '#666',
          fontSize: '0.75rem',
          backgroundColor: 'rgba(108, 92, 231, 0.08)',
          borderRadius: '6px',
          p: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {inputValue}
        </Box>
      )}
    </Box>
  );
};

export const useNodeTypes = () => {
  const tools = useSelector((state) => state.studio.tools.data);
  const agents = useSelector((state) => state.studio.agents.data);
  const models = useSelector((state) => state.studio.models.data);
  const inputs = useSelector((state) => state.studio.inputs.data);

  return useMemo(() => {
    return [...tools, ...agents, ...models, ...inputs].reduce((acc, item) => {
      if (item.type?.toLowerCase() === 'input') {
        acc[item.type] = InputCustomNode;
      } else {
        acc[item.type] = CustomNode;
      }
      return acc;
    }, {});
  }, [tools, agents, models, inputs]);
};
