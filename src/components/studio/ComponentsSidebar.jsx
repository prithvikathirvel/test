"use client"

import { useState, useCallback } from "react"
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import {
  ChevronDown,
  Database,
  Workflow,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileInput,
  CloudUpload,
  Layers,
} from "lucide-react"
import { useSelector } from "react-redux"
import InputBox from "@/components/Common/InputBox"
import { sortByField } from "@/utils/commonFunction"

export default function ComponentsSidebar({ minimizeSideBar, handleMinimizeSideBar }) {
  const tools = useSelector((state) => state.studio.tools)
  const agents = useSelector((state) => state.studio.agents)
  const models = useSelector((state) => state.studio.models)
  const inputNodes = useSelector((state) => state.studio.inputs)
  const outputNodes = useSelector((state) => state.studio.outputs)
  const prebuiltFlows1 = useSelector((state) => state.studio.prebuiltFlows)
  const prebuiltFlows = sortByField(prebuiltFlows1, "updatedAt", "desc")

  const nodeTypes = [
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
      title: "Agent Flows",
      icon: <Layers size={18} />,
      nodes:
        prebuiltFlows?.map((flow) => ({
          ...flow,
          displayName: flow.name,
          key: `flow-${flow.id}`,
          id: flow.id,
          type: "agentflow",
        })) || [],
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
    return (
      items?.map((item, index) => ({
        ...item,
        displayName: item.name,
        key: `${prefix}-${index}`,
        id: item.id,
      })) || []
    )
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
      className="flex flex-col h-full bg-white"
      sx={{
        borderRight: "1px solid",
        borderColor: "divider",
        minWidth: 0,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Box
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b shadow-sm"
        sx={{ borderColor: "divider" }}
      >
        <Typography
          variant="subtitle1"
          className="font-semibold text-gray-800 truncate"
          sx={{ fontWeight: 600, fontSize: "0.95rem" }}
        >
          Components
        </Typography>
        <Box
          onClick={handleMinimizeSideBar}
          className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer hover:bg-white hover:shadow-md transition-all duration-200 text-gray-600 hover:text-gray-800"
        >
          {minimizeSideBar ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Box>
      </Box>

      <Box className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
        <InputBox
          placeholder="Search components..."
          className="w-full"
          label="Search"
          isShowLabel={false}
          onChange={(e) => setSearchQuery(e)}
        />
      </Box>

      <Box
        className="flex-1"
        sx={{
          maxHeight: "calc(100vh - 130px)",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f5f9",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: "3px",
            "&:hover": {
              backgroundColor: "#94a3b8",
            },
          },
        }}
      >
        <div className="p-2 space-y-2">
          {filteredNodeTypes.map((section, index) => (
            <ComponentSection
              key={section.title}
              section={section}
              isFirstSection={index === 0}
              onDragStart={onDragStart}
            />
          ))}
        </div>
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
      className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-0"
      sx={{
        backgroundColor: "white",
        borderRadius: "8px !important",
        "&:before": { display: "none" },
        "&.Mui-expanded": {
          backgroundColor: "#fafafa",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        },
        "& .MuiAccordionSummary-root": {
          borderRadius: "8px 8px 0 0",
        },
        "& .MuiAccordionDetails-root": {
          borderRadius: "0 0 8px 8px",
        },
      }}
    >
      <AccordionSummary
        expandIcon={
          <div className={`transform transition-transform duration-200 text-gray-500 ${expanded ? "rotate-180" : ""}`}>
            <ChevronDown size={16} />
          </div>
        }
        className=" hover:bg-gray-50 transition-colors duration-200"
        sx={{
          px: 2,
          py: 0,
          minHeight: "50px !important",
          "& .MuiAccordionSummary-content": {
            margin: 0,
            alignItems: "center",
          },
          "& .MuiAccordionSummary-content.Mui-expanded": {
            margin: 0,
          },
        }}
      >
        <Box className="flex items-center justify-between w-full min-w-0">
          <Box className="flex items-center gap-3 min-w-0 flex-1">
            <Box
              className="flex-shrink-0 p-1.5 rounded-md"
              sx={{
                color: getNodeColor(section.title),
                backgroundColor: getNodeBgColor(section.title),
              }}
            >
              {section.icon}
            </Box>
            <Typography className="font-medium text-gray-800 truncate" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
              {section.title}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium flex-shrink-0"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 500,
              minWidth: "24px",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            {section.nodes.length}
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails className="bg-gray-50/30" >
        <Box className="space-y-2">
          {section.nodes.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">No components available</div>
          ) : (
            section.nodes.map((node, nodeIndex) => (
              <Box
                key={node.key || nodeIndex}
                draggable
                onDragStart={(event) => onDragStart(event, node.type, node)}
                className="group flex items-center gap-3 p-3 rounded-lg cursor-move bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md transition-all duration-200"
                sx={{
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getNodeColor(section.title) }}
                />
                <Typography
                  className="font-medium text-gray-800 group-hover:text-gray-900 truncate flex-1 min-w-0"
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                >
                  {node.name}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

// Helper function to get color based on node type
function getNodeColor(nodeType) {
  switch (nodeType) {
    case "Inputs":
      return "#10b981"
    case "Agents":
      return "#10b981"
    case "Agent Flows":
      return "#06b6d4"
    case "Tools":
      return "#800080"
    case "AI Models":
      return "#8b5cf6"
    case "Outputs":
      return "#ef4444"
    default:
      return "#6b7280"
  }
}

// Helper function to get background color based on node type
function getNodeBgColor(nodeType) {
  switch (nodeType) {
    case "Inputs":
      return "#ecfdf5"
    case "Agents":
      return "#eff6ff"
    case "Agent Flows":
      return "#ecfeff"
    case "Tools":
      return "#fffbeb"
    case "AI Models":
      return "#f3e8ff"
    case "Outputs":
      return "#fef2f2"
    default:
      return "#f9fafb"
  }
}
