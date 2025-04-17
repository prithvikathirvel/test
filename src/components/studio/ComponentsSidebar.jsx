"use client"

import { useState, useCallback } from "react"
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import {
  Search,
  ChevronDown,
  Database,
  Workflow,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileInput,
  CloudUpload,
  Layers
} from "lucide-react"
import { useSelector } from "react-redux"
import InputBox from "@/components/Common/InputBox"

export default function ComponentsSidebar({ minimizeSideBar, handleMinimizeSideBar }) {
  const tools = useSelector((state) => state.studio.tools)
  const agents = useSelector((state) => state.studio.agents)
  const models = useSelector((state) => state.studio.models)
  const inputNodes = useSelector((state) => state.studio.inputs)
  const outputNodes = useSelector((state) => state.studio.outputs)
  const prebuiltFlows = useSelector((state) => state.studio.prebuiltFlows)

  const nodeTypes = [
    {
      title: "Prebuilt Flows",
      icon: <Layers size={18} />,
      nodes: prebuiltFlows?.map((flow) => ({
        ...flow,
        displayName: flow.name,
        key: `flow-${flow.id}`,
        id: flow.id,
        type: "flow"
      })) || [],
    },
    {
      title: "Inputs",
      icon: <FileInput size={18} />,
      nodes: mapToNodes(inputNodes, "input"),
    },
    {
      title: "Agents",
      icon: <Database size={18} />,
      nodes: mapToNodes(agents, "agent"),
    },
    {
      title: "Tools",
      icon: <Workflow size={18} />,
      nodes: mapToNodes(tools, "tool"),
    },
    {
      title: "AI Models",
      icon: <Bot size={18} />,
      nodes: mapToNodes(models, "model"),
    },
    {
      title: "Outputs",
      icon: <CloudUpload size={18} />,
      nodes: mapToNodes(outputNodes, "output"),
    },
  ]

  function mapToNodes(items, prefix) {
    return items?.map((item, index) => ({
      ...item,
      displayName: item.name,
      key: `${prefix}-${index}`,
      id: item.id,
    })) || []
  }

  const onDragStart = useCallback((event, nodeType, node) => {
    event.dataTransfer.setData("application/node-spec", JSON.stringify(node))
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }, [])

  const [searchQuery, setSearchQuery] = useState("")

  const filteredNodeTypes = searchQuery.trim()
    ? nodeTypes
        .map((section) => ({
          ...section,
          nodes: section.nodes.filter((node) => node.name.toLowerCase().includes(searchQuery.toLowerCase())),
        }))
        .filter((section) => section.nodes.length > 0)
    : nodeTypes

  return (
    <Box
      className="flex flex-col h-full"
      sx={{
        borderRight: "1px solid",
        borderColor: "divider",
        // bgcolor: "red",
      }}
    >
      <Box className="flex items-center justify-between p-3 border-b" sx={{ borderColor: "divider" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
          Components
        </Typography>
        <Box
          onClick={handleMinimizeSideBar}
          className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-gray-100"
        >
          {minimizeSideBar ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Box>
      </Box>

      <Box className="p-3">
        <InputBox
          placeholder="Search components..."
          className="mb-4"
          label="Search"
          isShowLabel={false}
          // startIcon={<Search size={16} />}
          onChange={(e) => setSearchQuery(e)}
        />
      </Box>

      <Box sx={{ 
          maxHeight: 'calc(100vh - 130px)',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
            height: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#d1d5db',
            borderRadius: '4px',
          }
        }}>
        {filteredNodeTypes.map((section, index) => (
          <ComponentSection
            key={section.title}
            section={section}
            isFirstSection={index === 0}
            onDragStart={onDragStart}
          />
        ))}
      </Box>
    </Box>
  )
}

function ComponentSection({ section, isFirstSection, onDragStart }) {
  const [expanded, setExpanded] = useState(isFirstSection)

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      disableGutters
      elevation={0}
      sx={{
        // bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:before": { display: "none" },
        "&.Mui-expanded": {
          bgcolor: "grey.50",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={16} />}
        sx={{
          px: 2,
          py: 1.5,
          "& .MuiAccordionSummary-content": {
            margin: 0,
            alignItems: "center",
          },
        }}
      >
        <Box className="flex items-center gap-2 w-full justify-between">
          <Box className="flex items-center gap-2">
            <Box sx={{ color: getNodeColor(section.title) }}>{section.icon}</Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{section.title}</Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              bgcolor: "grey.200",
              color: "text.secondary",
              px: 1,
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 500,
              minWidth: "22px",
              textAlign: "center",
            }}
          >
            {section.nodes.length}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
        <Box className="grid gap-1.5">
          {section.nodes.map((node, nodeIndex) => (
            <Box
              key={node.key || nodeIndex}
              draggable
              onDragStart={(event) => onDragStart(event, node.type, node)}
              className="flex items-center gap-2 p-2 rounded-md cursor-move"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "grey.100",
                  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "text.primary",
                }}
              >
                {node.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

// Helper function to get color based on node type
function getNodeColor(nodeType) {
  switch (nodeType) {
    case "Inputs":
      return "#4caf50"
    case "Agents":
      return "#2196f3"
    case "Tools":
      return "#ff9800"
    case "AI Models":
      return "#9c27b0"
    case "Outputs":
      return "#f44336"
    case "Prebuilt Flows":
      return "#03A9F4"
    default:
      return "#757575"
  }
}
