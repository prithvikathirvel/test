"use client";

import React from "react";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, InputBase } from "@mui/material";
import { Search, ChevronDown, Database, Workflow, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";

export default function ComponentsSidebar({ minimizeSideBar, handleMinimizeSideBar }) {
  const tools = useSelector((state) => state.studio.tools.data);
  const agents = useSelector((state) => state.studio.agents.data);
  const models = useSelector((state) => state.studio.models.data);
  
  const nodeTypes = [
    {
      title: "Agents",
      icon: <Database size={18} />,
      nodes: mapToNodes(agents, "agent")
    },
    {
      title: "Tools",
      icon: <Workflow size={18} />,
      nodes: mapToNodes(tools, "tool")
    },
    {
      title: "AI Models",
      icon: <Bot size={18} />,
      nodes: mapToNodes(models, "model")
    }
  ];
  
  function mapToNodes(items, prefix) {
    return items.map((item, index) => ({
     ...item,
     key: `${prefix}-${index}`,
     id: `${prefix}-${index}`
    }));
  }
  
  const onDragStart = (event, nodeType, node) => {
    event.dataTransfer.setData("application/node-spec", JSON.stringify(node));
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Box className="p-3">
      <Box className="flex flex-row-reverse mb-5">
        {minimizeSideBar ? 
          <ChevronLeft size={18} onClick={handleMinimizeSideBar} /> : 
          <ChevronRight size={18} onClick={handleMinimizeSideBar} />
        }
      </Box>
      
      <SearchBox />

      {nodeTypes.map((section, index) => (
        <ComponentSection 
          key={section.title}
          section={section}
          isFirstSection={index === 0}
          onDragStart={onDragStart}
        />
      ))}
    </Box>
  );
}

function SearchBox() {
  return (
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
  );
}

function ComponentSection({ section, isFirstSection, onDragStart }) {
  return (
    <Accordion 
      defaultExpanded={isFirstSection}
      disableGutters
      elevation={0}
      sx={{
        border: 'none',
        '&:before': { display: 'none' },
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
            onDragStart={(event) => onDragStart(event, node.type, node)}
            className="flex items-center gap-2 p-2 mb-2 rounded-md cursor-move hover:bg-gray-50 border border-gray-200"
          >
            <Typography sx={{ fontSize: '13px' }}>
              {node.name}
            </Typography>
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}
