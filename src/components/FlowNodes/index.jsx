"use client"

import { Box, Typography, IconButton } from "@mui/material"
import { Handle, Position } from "reactflow"
import { Bot, Workflow, Database, Circle } from "lucide-react"

const getNodeIcon = (type) => {
  switch (type) {
    case "Gemini":
    case "ChatGpt":
    case "Claude":
      return <Bot size={20} />
    case "filter":
    case "map":
    case "aggregate":
      return <Workflow size={20} />
    case "csvInput":
    case "jsonInput":
    case "apiInput":
      return <Database size={20} />
    default:
      return <Workflow size={20} />
  }
}

const getNodeColor = (type) => {
  if (["Gemini", "ChatGpt", "Claude"].includes(type)) {
    return "#6c5ce7"
  }
  if (["filter", "map", "aggregate"].includes(type)) {
    return "#00b894"
  }
  if (["csvInput", "jsonInput", "apiInput"].includes(type)) {
    return "#0984e3"
  }
  return "#6c5ce7" // Default color for custom tools
}

function CustomNode({ data, type }) {
  const color = getNodeColor(type)
  const icon = getNodeIcon(type)

  return (
    <Box
      sx={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        minWidth: '180px',
        border: '2px solid',
        borderColor: color,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        position: 'relative',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ 
          background: color,
          width: 8,
          height: 8,
          left: -4
        }} 
      />
      <Box className="flex items-center gap-2">
        <Box sx={{ color }}>{icon}</Box>
        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{data.label}</Typography>
        <IconButton 
          size="small" 
          sx={{ 
            ml: 'auto',
            width: 20,
            height: 20,
            backgroundColor: `${color}20`,
            color,
            '&:hover': {
              backgroundColor: `${color}30`,
            }
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
          right: -4
        }} 
      />
    </Box>
  )
}

// Register all node types including dynamic tools
export const nodeTypes = {
  csvInput: CustomNode,
  jsonInput: CustomNode,
  apiInput: CustomNode,
  filter: CustomNode,
  map: CustomNode,
  aggregate: CustomNode,
  Gemini: CustomNode,
  ChatGpt: CustomNode,
  Claude: CustomNode
}
