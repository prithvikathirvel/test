"use client";

import { Box, Typography, Select, MenuItem, TextField, Button, Divider, FormControl, InputLabel, Radio, RadioGroup, FormControlLabel, Chip } from "@mui/material";
import { Handle, Position } from "reactflow";
import { Bot, Workflow, Database, Circle, CloudUpload, Link as LinkIcon, TextCursorInput, FileOutput, Settings, Code } from "lucide-react";
import { useSelector } from "react-redux";
import { useMemo, useState } from "react";

// Base GenericNode component that all node types extend
const GenericNode = ({ data, children }) => {
  // Extract props from data or use defaults
  const { 
    type = 'Node', 
    name = 'Unnamed Node', 
    description = '',
    icon, 
    color,
    showHeader = true,
    showContent = false,
    showFooter = false,
    headerContent,
    footerContent,
    width = 250
  } = data;
  
  // Get node color based on type
  const getNodeColor = () => {
    if (color) return color;
    
    switch (type) {
      case 'Tool':
        return '#00b894';
      case 'Agent':
        return '#6c5ce7';
      case 'Model':
        return '#0984e3';
      case 'Input':
        return '#0284e3';
      case 'Output':
        return '#e17055';
      default:
        return '#6c5ce7';
    }
  };

  // Get node icon based on type
  const getNodeIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'Tool':
        return <Database size={18} />;
      case 'Agent':
        return <Bot size={18} />;
      case 'Model':
        return <Workflow size={18} />;
      case 'Input':
        return <TextCursorInput size={18} />;
      case 'Output':
        return <FileOutput size={18} />;
      default:
        return <Circle size={18} />;
    }
  };

  const nodeColor = getNodeColor();
  const nodeIcon = getNodeIcon();

  return (
    <Box
      sx={{
        width,
        border: `1px solid ${nodeColor}`,
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Left and Right handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: nodeColor, width: 8, height: 8, left: -4 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: nodeColor, width: 8, height: 8, right: -4 }}
      />
      
      {/* Header Section */}
      {showHeader && (
        <Box
          sx={{
            backgroundColor: nodeColor,
            color: 'white',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {nodeIcon}
            <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
              {name}
            </Typography>
          </Box>
          
          <Typography sx={{ fontSize: '12px', fontWeight: 400, opacity: 0.8 }}>
            {type}
          </Typography>
        </Box>
      )}
      
      {/* Custom Header Content */}
      {headerContent && (
        <Box sx={{ p: 1.5, backgroundColor: `${nodeColor}10` }}>
          {headerContent}
        </Box>
      )}
      
      {/* Main Content Section */}
      {showContent && (
        <Box sx={{ p: 1.5 }}>
          {description && (
            <Typography sx={{ fontSize: '12px', color: '#666', mb: 1 }}>
              {description}
            </Typography>
          )}
          
          {/* Main content (passed as children) */}
          {children}
        </Box>
      )}
      
      {/* Footer Section */}
      {showFooter && footerContent && (
        <>
          <Divider sx={{ mx: 1 }} />
          <Box sx={{ p: 1.5, backgroundColor: '#f8f9fa' }}>
            {footerContent}
          </Box>
        </>
      )}
    </Box>
  );
};

// Agent Node Component
const AgentNode = ({ data }) => {
  const [agentType, setAgentType] = useState(data.agentType || 'prebuilt');
  const [selectedModel, setSelectedModel] = useState(data.selectedModel || '');
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [showTools, setShowTools] = useState(data.showTools !== false);
  const [showConfig, setShowConfig] = useState(data.showConfig !== false);
  
  const models = useSelector((state) => state.studio.models.data || []);
  
  // Handle agent type change
  const handleAgentTypeChange = (event) => {
    setAgentType(event.target.value);
  };
  
  // Handle model selection change
  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };
  
  // Handle prompt change
  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };
  
  // Configuration section content
  const configSection = (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>Agent Type:</Typography>
        <RadioGroup
          row
          value={agentType}
          onChange={handleAgentTypeChange}
          sx={{ '& .MuiFormControlLabel-label': { fontSize: '12px' } }}
        >
          <FormControlLabel value="prebuilt" control={<Radio size="small" sx={{ '& .MuiSvgIcon-root': { fontSize: 16 } }} />} label="Prebuilt" />
          <FormControlLabel value="custom" control={<Radio size="small" sx={{ '& .MuiSvgIcon-root': { fontSize: 16 } }} />} label="Custom" />
        </RadioGroup>
      </Box>
      
      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
        <InputLabel id="model-select-label" sx={{ fontSize: '12px' }}>Model</InputLabel>
        <Select
          labelId="model-select-label"
          value={selectedModel}
          onChange={handleModelChange}
          label="Model"
          sx={{ fontSize: '12px' }}
        >
          {models.map((model) => (
            <MenuItem key={model.id} value={model.name} sx={{ fontSize: '12px' }}>
              {model.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {agentType === 'custom' && (
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Enter agent prompt..."
          value={prompt}
          onChange={handlePromptChange}
          size="small"
          sx={{ 
            '& .MuiInputBase-input': { fontSize: '12px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
            }
          }}
        />
      )}
    </Box>
  );
  
  // Tools section content
  const toolsSection = (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>Tools:</Typography>
        <Button 
          variant="outlined" 
          size="small"
          startIcon={<Settings size={14} />}
          sx={{ 
            fontSize: '10px', 
            py: 0.5, 
            borderRadius: '4px',
            textTransform: 'none'
          }}
        >
          Configure
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {agentType === 'prebuilt' ? (
          // Prebuilt agent has fixed tools
          ['Search', 'Calculator', 'Weather'].map((tool) => (
            <Chip 
              key={tool} 
              label={tool} 
              size="small" 
              sx={{ 
                fontSize: '10px', 
                height: '22px',
                backgroundColor: '#00b89420',
                color: '#00b894',
                '& .MuiChip-label': { px: 1 }
              }} 
            />
          ))
        ) : (
          // Custom agent has a drop area for tools
          <Box
            sx={{
              width: '100%',
              p: 1,
              border: '1px dashed #ccc',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '11px',
              color: '#999',
            }}
          >
            Drop tools here
          </Box>
        )}
      </Box>
    </Box>
  );
  
  return (
    <GenericNode 
      data={{ 
        ...data, 
        type: 'Agent',
        showContent: true,
        showFooter: showTools || showConfig
      }}
    >
      {/* Configuration Section */}
      {showConfig && configSection}
      
      {/* Tools Section */}
      {showTools && (
        <>
          {showConfig && <Divider sx={{ my: 1 }} />}
          {toolsSection}
        </>
      )}
    </GenericNode>
  );
};

// Tool Node Component
const ToolNode = ({ data }) => {
  return (
    <GenericNode 
      data={{ 
        ...data, 
        type: 'Tool',
        showContent: true,
        showFooter: false
      }}
    >
      {/* Tool content can be added here if needed */}
      {data.showCode && (
        <Box sx={{ 
          mt: 1, 
          p: 1, 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'monospace'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Code size={14} />
            <Typography sx={{ fontSize: '11px', fontWeight: 500 }}>Code</Typography>
          </Box>
          <Box sx={{ color: '#666' }}>
            {data.code || 'function example() { ... }'}
          </Box>
        </Box>
      )}
    </GenericNode>
  );
};

// Input Node Component
const InputNode = ({ data }) => {
  const [inputType, setInputType] = useState(data.inputType || 'text');
  const [inputValue, setInputValue] = useState(data.inputValue || '');
  const [file, setFile] = useState(null);
  const [showConfig, setShowConfig] = useState(data.showConfig !== false);

  // Handle input type change
  const handleInputTypeChange = (event) => {
    setInputType(event.target.value);
    setInputValue('');
    setFile(null);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setInputValue(uploadedFile.name);
  };

  // Handle text/url input change
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // Render different input components based on type
  const renderInputComponent = () => {
    switch (inputType) {
      case 'file':
        return (
          <Box sx={{ width: '100%', textAlign: 'center', py: 1 }}>
            <Button 
              component="label" 
              variant="contained" 
              startIcon={<CloudUpload size={16} />}
              sx={{ 
                backgroundColor: '#0284e3', 
                '&:hover': { backgroundColor: '#0277d1' },
                borderRadius: '6px',
                textTransform: 'none',
                fontSize: '0.85rem',
                py: 0.5
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
      case 'url':
        return (
          <TextField 
            fullWidth 
            size="small"
            variant="outlined" 
            placeholder="Enter URL" 
            value={inputValue}
            onChange={handleInputChange}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                '&.Mui-focused fieldset': {
                  borderColor: '#0284e3',
                },
              },
            }}
          />
        );
      case 'text':
      default:
        return (
          <TextField 
            fullWidth 
            multiline
            rows={3}
            size="small"
            variant="outlined" 
            placeholder="Enter text input" 
            value={inputValue}
            onChange={handleInputChange}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                '&.Mui-focused fieldset': {
                  borderColor: '#0284e3',
                },
              },
            }}
          />
        );
    }
  };

  // Configuration section
  const configSection = (
    <Box sx={{ mb: showConfig ? 1 : 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>Input Type:</Typography>
        <Select
          value={inputType}
          onChange={handleInputTypeChange}
          variant="standard"
          sx={{ 
            fontSize: '12px',
            '& .MuiSelect-select': { 
              paddingBottom: 0,
              color: '#0284e3',
              fontWeight: 500
            }
          }}
        >
          <MenuItem value="text" sx={{ fontSize: '12px' }}>Text</MenuItem>
          <MenuItem value="file" sx={{ fontSize: '12px' }}>File</MenuItem>
          <MenuItem value="url" sx={{ fontSize: '12px' }}>URL</MenuItem>
        </Select>
      </Box>
    </Box>
  );

  return (
    <GenericNode 
      data={{ 
        ...data, 
        type: 'Input',
        showContent: true,
        showFooter: false
      }}
    >
      {/* Configuration Section */}
      {showConfig && configSection}
      
      {/* Divider if both sections are shown */}
      {showConfig && <Divider sx={{ my: 1 }} />}
      
      {/* Input Component */}
      {renderInputComponent()}
      
      {/* Display selected file/input */}
      {inputValue && (
        <Box sx={{ 
          mt: 1, 
          width: '100%', 
          textAlign: 'center',
          color: '#666',
          fontSize: '11px',
          backgroundColor: 'rgba(2, 132, 227, 0.08)',
          borderRadius: '4px',
          p: 0.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {inputType === 'file' ? `File: ${inputValue}` : `Input: ${inputValue.substring(0, 30)}${inputValue.length > 30 ? '...' : ''}`}
        </Box>
      )}
    </GenericNode>
  );
};

// Output Node Component
const OutputNode = ({ data }) => {
  const [showPreview, setShowPreview] = useState(data.showPreview !== false);
  
  // Sample output data
  const outputData = data.outputData || { type: 'text', content: 'No output data available' };
  
  // Render output preview based on type
  const renderOutputPreview = () => {
    switch (outputData.type) {
      case 'image':
        return (
          <Box sx={{ 
            width: '100%', 
            height: '100px', 
            backgroundColor: '#f0f0f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: '4px',
            color: '#666',
            fontSize: '12px'
          }}>
            [Image Preview]
          </Box>
        );
      case 'json':
        return (
          <Box sx={{ 
            p: 1, 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#666',
            maxHeight: '100px',
            overflow: 'auto'
          }}>
            {JSON.stringify(outputData.content, null, 2)}
          </Box>
        );
      case 'text':
      default:
        return (
          <Box sx={{ 
            p: 1, 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666',
            maxHeight: '100px',
            overflow: 'auto'
          }}>
            {outputData.content}
          </Box>
        );
    }
  };
  
  return (
    <GenericNode 
      data={{ 
        ...data, 
        type: 'Output',
        showContent: true,
        showFooter: false
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>Output Type:</Typography>
        <Chip 
          label={outputData.type || 'text'} 
          size="small" 
          sx={{ 
            fontSize: '10px', 
            height: '20px',
            backgroundColor: '#e1705520',
            color: '#e17055',
            '& .MuiChip-label': { px: 1 }
          }} 
        />
      </Box>
      
      {/* Output Preview */}
      {showPreview && renderOutputPreview()}
    </GenericNode>
  );
};

// Model Node Component
const ModelNode = ({ data }) => {
  return (
    <GenericNode 
      data={{ 
        ...data, 
        type: 'Model',
        showContent: true,
        showFooter: false
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>Model:</Typography>
        <Typography sx={{ fontSize: '12px', color: '#0984e3', fontWeight: 500 }}>
          {data.modelName || 'Default Model'}
        </Typography>
      </Box>
      
      {data.parameters && (
        <Box sx={{ 
          p: 1, 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '11px',
          color: '#666'
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 500, mb: 0.5 }}>Parameters:</Typography>
          {Object.entries(data.parameters).map(([key, value]) => (
            <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <Typography sx={{ fontSize: '10px', color: '#666' }}>{key}:</Typography>
              <Typography sx={{ fontSize: '10px', color: '#0984e3', fontWeight: 500 }}>{value}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </GenericNode>
  );
};

// Export the useNodeTypes hook
export const useNodeTypes = () => {
  const tools = useSelector((state) => state.studio.tools.data || []);
  const agents = useSelector((state) => state.studio.agents.data || []);
  const models = useSelector((state) => state.studio.models.data || []);
  const inputs = useSelector((state) => state.studio.inputs.data || []);
  const outputs = useSelector((state) => state.studio.outputs?.data || []);

  return useMemo(() => {
    const nodeTypes = {};
    
    // Map tools to ToolNode
    tools.forEach(item => {
      nodeTypes[item.name] = ToolNode;
    });
    
    // Map agents to AgentNode
    agents.forEach(item => {
      nodeTypes[item.name] = AgentNode;
    });
    
    // Map models to ModelNode
    models.forEach(item => {
      nodeTypes[item.name] = ModelNode;
    });
    
    // Map inputs to InputNode
    inputs.forEach(item => {
      nodeTypes[item.name] = InputNode;
    });
    
    // Map outputs to OutputNode
    outputs.forEach(item => {
      nodeTypes[item.name] = OutputNode;
    });
    
    return nodeTypes;
  }, [tools, agents, models, inputs, outputs]);
};
