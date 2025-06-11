
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Paper,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  X as CloseIcon,
  Copy as CopyIcon,
  Download as DownloadIcon,
  CheckCircle as SuccessIcon,
  AlertCircle as ErrorIcon,
  Clock as PendingIcon,
  Maximize2 as ExpandIcon,
  Minimize2 as CollapseIcon,
} from 'lucide-react';
import { useSelector } from 'react-redux';

const JsonOutputDrawer = ({ 
  open, 
  onClose, 
  outputData, 
  title = "Execution Output",
  status = "success"
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const flowOutput = useSelector((state) => state.studio.flowOutput);
  const isFlowRunning = useSelector((state) => state.studio.isFlowRunning);

  const formatDataForDisplay = (data) => {
    if (data === null) return 'null';
    if (data === undefined) return 'undefined';
    if (typeof data === 'string') return data;
    if (typeof data === 'number' || typeof data === 'boolean') return String(data);
    if (typeof data === 'object') return JSON.stringify(data, null, 2);
    return String(data);
  };

  const formatDataForDownload = (data) => {
    if (data === null) return 'null';
    if (data === undefined) return 'undefined';
    if (typeof data === 'string') return data;
    if (typeof data === 'number' || typeof data === 'boolean') return String(data);
    if (typeof data === 'object') return JSON.stringify(data, null, 2);
    return String(data);
  };

  const getDataType = (data) => {
    if (data === null) return 'null';
    if (data === undefined) return 'undefined';
    if (Array.isArray(data)) return 'array';
    return typeof data;
  };

  const getFileExtension = (data) => {
    const type = getDataType(data);
    if (type === 'object' || type === 'array') return 'json';
    if (type === 'string') return 'txt';
    return 'txt';
  };

  const handleCopy = async () => {
    try {
      const dataString = formatDataForDisplay(outputData);
      await navigator.clipboard.writeText(dataString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const dataString = formatDataForDownload(outputData);
    const fileExtension = getFileExtension(outputData);
    const mimeType = fileExtension === 'json' ? 'application/json' : 'text/plain';
    
    const blob = new Blob([dataString], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-output.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <SuccessIcon size={20} className="text-green-500" />;
      case 'error':
        return <ErrorIcon size={20} className="text-red-500" />;
      case 'pending':
        return <PendingIcon size={20} className="text-yellow-500" />;
      default:
        return <SuccessIcon size={20} className="text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  const formatWithSyntaxHighlighting = (data, depth = 0) => {
    const indent = '  '.repeat(depth);
    
    if (data === null) return <span style={{ color: '#9ca3af' }}>null</span>;
    if (data === undefined) return <span style={{ color: '#9ca3af' }}>undefined</span>;
    if (typeof data === 'boolean') return <span style={{ color: '#3b82f6' }}>{data.toString()}</span>;
    if (typeof data === 'number') return <span style={{ color: '#8b5cf6' }}>{data}</span>;
    if (typeof data === 'string') {
      // For simple strings, don't add quotes unless it's part of an object
      if (depth === 0) return <span style={{ color: '#10b981' }}>{data}</span>;
      return <span style={{ color: '#10b981' }}>"{data}"</span>;
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) return <span>[]</span>;
      return (
        <span>
          [<br />
          {data.map((item, index) => (
            <span key={index}>
              {indent}  {formatWithSyntaxHighlighting(item, depth + 1)}
              {index < data.length - 1 ? ',' : ''}<br />
            </span>
          ))}
          {indent}]
        </span>
      );
    }
    
    if (typeof data === 'object') {
      const entries = Object.entries(data);
      if (entries.length === 0) return <span>{'{}'}</span>;
      
      return (
        <span>
          {'{'}<br />
          {entries.map(([key, value], index) => (
            <span key={key}>
              {indent}  <span style={{ color: '#ef4444' }}>"{key}"</span>: {formatWithSyntaxHighlighting(value, depth + 1)}
              {index < entries.length - 1 ? ',' : ''}<br />
            </span>
          ))}
          {indent}{'}'}
        </span>
      );
    }
    
    return <span style={{ color: '#e2e8f0' }}>{String(data)}</span>;
  };

  const getDataSize = (data) => {
    const dataString = formatDataForDisplay(data);
    return dataString.length;
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 600,
          maxWidth: '100vw',
          backgroundColor: '#f8fafc',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            {getStatusIcon()}
            <Typography  sx={{  color: '#1e293b' }}>
              {title}
            </Typography>
            {/* <Chip
              label={getDataType(outputData)}
              size="small"
              sx={{
                backgroundColor: '#e2e8f0',
                color: '#64748b',
                fontWeight: 500,
                fontSize: '0.75rem',
                textTransform: 'capitalize'
              }}
            /> */}
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title={copied ? "Copied!" : "Copy Data"}>
              <IconButton
                onClick={handleCopy}
                size="small"
                sx={{ color: copied ? '#10b981' : '#64748b' }}
              >
                <CopyIcon size={18} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Download Data">
              <IconButton
                onClick={handleDownload}
                size="small"
                sx={{ color: '#64748b' }}
              >
                <DownloadIcon size={18} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Close">
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ color: '#64748b' }}
              >
                <CloseIcon size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Metadata */}
      <Box sx={{ p: 2, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              TYPE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
              {getDataType(outputData)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              SIZE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {getDataSize(outputData)} chars
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              STATUS
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize', color: getStatusColor() }}>
              {status}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {expanded && (
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
            <Paper
              sx={{
                p: 3,
                backgroundColor: '#1e293b',
                borderRadius: 2,
                border: '1px solid #334155',
                minHeight: 200,
              }}
            >
              <pre
                style={{
                  margin: 0,
                  fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#e2e8f0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {isFlowRunning ? (
                  <div>Loading...</div>
                ) : (
                  formatWithSyntaxHighlighting(flowOutput?.['bot_response'])
                )}
              </pre>
            </Paper>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default JsonOutputDrawer;
