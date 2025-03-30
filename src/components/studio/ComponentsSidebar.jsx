"use client";

import React, { useState, useCallback } from "react";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Search, ChevronDown, Database, Workflow, Bot, ChevronLeft, ChevronRight,  } from "lucide-react";
import { useSelector } from "react-redux";
import InputBox from '@/components/Common/InputBox';
import { FileInput,CloudUpload } from "lucide-react";

export default function ComponentsSidebar({ minimizeSideBar, handleMinimizeSideBar }) {
  const tools = useSelector((state) => state.studio.tools);
  const agents = useSelector((state) => state.studio.agents);
  const models = useSelector((state) => state.studio.models);
  const inputNodes = useSelector((state) => state.studio.inputs);
  const outputNodes = useSelector((state) => state.studio.outputs);  
  
  const nodeTypes = [
    {
      title:"Inputs", 
      icon: <FileInput size={18} />,
      nodes: mapToNodes(inputNodes, "input")
    },
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
    },
    {
      title : "Outputs",
      icon: <CloudUpload size={18} />,
      nodes: mapToNodes(outputNodes, "output")
    }
  ];
  
  function mapToNodes(items, prefix) {
    return items.map((item, index) => ({
     ...item,
     key: `${prefix}-${index}`,
     id: item.id,
     //id: `${prefix}-${index}`
    }));
  }
  
  const onDragStart = useCallback((event, nodeType, node) => {
    event.dataTransfer.setData("application/node-spec", JSON.stringify(node));
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Box className="p-3">
      <Box className="flex flex-row-reverse mb-5">
        {minimizeSideBar ? 
          <ChevronLeft size={18} onClick={handleMinimizeSideBar} /> : 
          <ChevronRight size={18} onClick={handleMinimizeSideBar} />
        }
      </Box>
      
      <InputBox 
        placeholder="Search Components" 
        className="mb-4"
        label="Components"
        isShowLabel={true}
        onChange={(e) => setSearchQuery(e)}
      />

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
            sx={{
              //borderLeft: `10px solid ${color}`,
              '&:hover': {
                backgroundColor: 'gray.50',
                border: '1px solid gray.200'
              }
            }}
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
