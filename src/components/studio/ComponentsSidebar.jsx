"use client";

import React, { useEffect } from "react";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, InputBase } from "@mui/material";
import { Search, ChevronDown, Database, Workflow, Bot } from "lucide-react";
import { useSelector } from "react-redux";

export default function ComponentsSidebar() {
  const tools = useSelector((state) => state.studio.tools.data);
  const agents = useSelector((state) => state.studio.agents.data);
  const models = useSelector((state) => state.studio.models.data);

  const nodeTypes = [
    {
      title: "Agents",
      icon: <Database size={18} />,
      nodes: agents.map((agent, index) => ({ 
        type: agent.name, 
        label: agent.name,
        key: `agent-${index}`
      }))
    },
    {
      title: "Tools",
      icon: <Workflow size={18} />,
      nodes: tools.map((tool, index) => ({ 
        type: tool.name, 
        label: tool.name,
        key: `tool-${index}`
      }))
    },
    {
      title: "AI Models",
      icon: <Bot size={18} />,
      nodes: models.map((model, index) => ({ 
        type: model.name, 
        label: model.name,
        key: `model-${index}`
      }))
    }
  ]
  
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  return (
    <Box className="p-3">
      <Box 
        className="flex items-center gap-2 mb-4 px-3 py-1.5 border border-gray-200 rounded-md"
        sx={{ 
          '&:focus-within': {
            borderColor: '#6c5ce7',
            boxShadow: '0 0 0 2px rgba(108, 92, 231, 0.1)'
          }
        }}
      >
        <Search size={18} className="text-gray-400" />
        <InputBase 
          placeholder="Search Components"
          className="flex-1"
          sx={{
            fontSize: '14px',
            '& input::placeholder': {
              color: '#9ca3af',
              opacity: 1
            }
          }}
        />
      </Box>

      {nodeTypes.map((section, index) => (
        <Accordion 
          key={section.title}
          defaultExpanded={index === 0}
          disableGutters
          elevation={0}
          sx={{
            border: 'none',
            '&:before': {
              display: 'none',
            },
            '& .MuiAccordionSummary-root': {
              minHeight: '48px',
              px: 1,
            }
          }}
        >
          <AccordionSummary 
            expandIcon={<ChevronDown size={18} />}
            sx={{
              '& .MuiAccordionSummary-content': {
                gap: 1.5
              }
            }}
          >
            {section.icon}
            <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
              {section.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {section.nodes.map((node, nodeIndex) => (
              <Box
                key={node.key || nodeIndex}
                draggable
                onDragStart={(event) => onDragStart(event, node.type)}
                className="flex items-center gap-2 p-2 mb-2 rounded-md cursor-move hover:bg-gray-50 border border-gray-200"
              >
                <Typography sx={{ fontSize: '13px' }}>
                  {node.label}
                </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}
