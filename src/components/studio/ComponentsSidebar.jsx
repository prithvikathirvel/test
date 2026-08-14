"use client";

import { memo, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  Bot,
  Cpu,
  Workflow,
  FileInput,
  CloudUpload,
  Layers,
  Folder,
  GripVertical,
  X,
  BookOpenText,
  Server,
  Code2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { sortByField, getNodeColor } from "@/utils/commonFunction";

export default function ComponentsSidebar({ minimizeSideBar, handleMinimizeSideBar }) {
  const tools = useSelector((state) => state.studio.tools || []);
  const agents = useSelector((state) => state.studio.agents || []);
  const models = useSelector((state) => state.studio.models || []);
  const inputNodes = useSelector((state) => state.studio.inputs || []);
  const outputNodes = useSelector((state) => state.studio.outputs || []);
  const prebuiltFlows1 = useSelector((state) => state.studio.prebuiltFlows || []);
  // `sortByField` returns a new array; memoizing it keeps the `nodeTypes` memo
  // below from being invalidated on every single render of the sidebar.
  const prebuiltFlows = useMemo(
    () => sortByField(prebuiltFlows1, "updatedAt", "desc"),
    [prebuiltFlows1]
  );
  const mcpServers = useSelector((state) => state.studio.mcpTools || {});

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const mapToNodes = (items, prefix) => {
    return (
      items?.map((item, index) => ({
        ...item,
        displayName: item.displayName || item.name,
        name: item.displayName || item.name,
        key: `${prefix}-${index}`,
        id: item.id,
      })) || []
    );
  };

  const nodeTypes = useMemo(() => {
    return [
      {
        id: "inputs",
        title: "Inputs",
        subtitle: "User prompts & webhooks",
        icon: <FileInput size={17} className="text-cyan-600" />,
        badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200/60",
        accentColor: "#0891b2",
        nodes: mapToNodes(inputNodes, "input"),
      },
      {
        id: "outputs",
        title: "Outputs",
        subtitle: "Chat responses & payloads",
        icon: <CloudUpload size={17} className="text-orange-600" />,
        badgeColor: "bg-orange-50 text-orange-700 border-orange-200/60",
        accentColor: "#ea580c",
        nodes: mapToNodes(outputNodes, "output"),
      },
      {
        id: "tools",
        title: "Tools",
        subtitle: "API callers & system utilities",
        icon: <Workflow size={17} className="text-violet-600" />,
        badgeColor: "bg-violet-50 text-violet-700 border-violet-200/60",
        accentColor: "#7c3aed",
        nodes: mapToNodes(tools, "tool"),
      },
      {
        id: "agents",
        title: "Agents",
        subtitle: "Multi-agent personas & workers",
        icon: <Bot size={17} className="text-emerald-600" />,
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        accentColor: "#059669",
        nodes: mapToNodes(agents, "agent"),
      },
      {
        id: "models",
        title: "Models",
        subtitle: "OpenAI, Anthropic & Gemini",
        icon: <Cpu size={17} className="text-blue-600" />,
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200/60",
        accentColor: "#2563eb",
        nodes: mapToNodes(models, "model"),
      },
      {
        id: "agentflows",
        title: "Nested Agents",
        subtitle: "Reusable sub-workflows",
        icon: <Layers size={17} className="text-indigo-600" />,
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
        accentColor: "#4f46e5",
        nodes:
          prebuiltFlows?.map((flow) => ({
            ...flow,
            displayName: flow.name,
            name: flow.name,
            key: `flow-${flow.id}`,
            id: flow.id,
            type: "agentflow",
          })) || [],
      },
      {
        id: "mcp",
        title: "MCP Servers",
        subtitle: "Model Context Protocol",
        icon: <Server size={17} className="text-slate-600" />,
        badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
        accentColor: "#475569",
        nodes: Object.keys(mcpServers || {}).map((serverName) => ({
          title: serverName,
          icon: <Folder size={15} className="text-slate-500" />,
          isGroup: true,
          nodes: (mcpServers[serverName] || []).map((tool, index) => ({
            ...tool,
            name: tool.displayName || tool.name,
            displayName: tool.displayName || tool.name,
            key: `${serverName}-${index}`,
            id: tool.id,
          })),
        })),
      },
    ];
  }, [agents, models, tools, prebuiltFlows, inputNodes, outputNodes, mcpServers]);

  const onDragStart = useCallback((event, nodeType, node) => {
    event.dataTransfer.setData("application/node-spec", JSON.stringify(node));
    event.dataTransfer.setData("application/reactflow", nodeType || node.type || "tool");
    event.dataTransfer.effectAllowed = "move";
  }, []);

  // Filter nodes based on search and category
  const filteredNodeTypes = useMemo(() => {
    return nodeTypes
      .filter((section) => activeCategory === "all" || section.id === activeCategory)
      .map((section) => {
        if (!searchQuery.trim()) return section;

        // Check for MCP nested structure
        if (section.id === "mcp") {
          const filteredMcp = section.nodes
            .map((server) => ({
              ...server,
              nodes: server.nodes.filter((n) =>
                (n.name || "").toLowerCase().includes(searchQuery.toLowerCase())
              ),
            }))
            .filter((server) => server.nodes.length > 0);
          return { ...section, nodes: filteredMcp };
        }

        const filteredNodes = section.nodes.filter((n) =>
          (n.name || n.displayName || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...section, nodes: filteredNodes };
      })
      .filter((section) => section.nodes.length > 0);
  }, [nodeTypes, searchQuery, activeCategory]);

  return (
    <Box className="flex flex-col h-full bg-white border-r border-slate-200/80 select-none">
      {/* Panel Top Header */}
      <Box className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpenText size={14} />
          </div>
          <div>
            <Typography className="!text-[13px] !font-bold !text-slate-900 !leading-tight">
              Node Library
            </Typography>
            <Typography className="!text-[10px] !text-slate-400 font-medium">
              Drag components to canvas
            </Typography>
          </div>
        </div>

        <Tooltip title={minimizeSideBar ? "Expand components panel" : "Collapse panel"}>
          <IconButton
            onClick={handleMinimizeSideBar}
            size="small"
            className="!text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !p-1.5 !rounded-lg"
          >
            {minimizeSideBar ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Search Bar */}
      <Box className="p-3 border-b border-slate-100 bg-white">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search nodes, tools, models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </Box>

      {/* Component Sections List */}
      <Box className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredNodeTypes.length > 0 ? (
          filteredNodeTypes.map((section, index) => (
            <ComponentSection
              key={section.title}
              section={section}
              isFirstSection={index === 0 || searchQuery.length > 0}
              onDragStart={onDragStart}
            />
          ))
        ) : (
          <div className="text-center py-10 px-4">
            <Typography className="!text-xs !text-slate-400 font-medium">
              No matching components found
            </Typography>
          </div>
        )}
      </Box>
    </Box>
  );
}

const ComponentSection = memo(function ComponentSection({ section, isFirstSection, onDragStart }) {
  const [expanded, setExpanded] = useState(isFirstSection);

  const totalCount = useMemo(() => {
    if (section.id === "mcp") {
      return section.nodes.reduce((acc, curr) => acc + (curr.nodes?.length || 0), 0);
    }
    return section.nodes.length;
  }, [section]);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExp) => setExpanded(isExp)}
      elevation={0}
      disableGutters
      className="!bg-white !rounded-xl !border !border-slate-200/80 !shadow-2xs overflow-hidden before:!hidden mb-2"
    >
      <AccordionSummary
        expandIcon={<ChevronDown size={15} className="text-slate-400" />}
        className="!min-h-[44px] !px-3 hover:!bg-slate-50/70 transition-colors"
        sx={{ '& .MuiAccordionSummary-content': { my: 1, alignItems: 'center' } }}
      >
        <Box className="flex items-center justify-between w-full min-w-0 pr-2">
          <Box className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0">{section.icon}</div>
            <Typography className="!text-[12px] !font-bold !text-slate-800 !truncate">
              {section.title}
            </Typography>
          </Box>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${
              section.badgeColor || "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {totalCount}
          </span>
        </Box>
      </AccordionSummary>

      <AccordionDetails className="!p-2 !pt-0 !bg-slate-50/40">
        <Box className="space-y-1.5">
          {section.nodes.length === 0 ? (
            <div className="text-center py-3 text-[11px] text-slate-400">No nodes in this category</div>
          ) : section.nodes[0]?.isGroup ? (
            section.nodes.map((subSection) => (
              <Box key={subSection.title} className="mb-2">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <Folder size={13} />
                  <span>{subSection.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({subSection.nodes.length})</span>
                </div>
                <div className="space-y-1 pl-1">
                  {subSection.nodes.map((node, nodeIdx) => (
                    <NodeTile
                      key={node.key || nodeIdx}
                      node={node}
                      accentColor={section.accentColor}
                      onDragStart={onDragStart}
                    />
                  ))}
                </div>
              </Box>
            ))
          ) : (
            section.nodes.map((node, nodeIndex) => (
              <NodeTile
                key={node.key || nodeIndex}
                node={node}
                accentColor={section.accentColor}
                onDragStart={onDragStart}
              />
            ))
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
});

const NodeTile = memo(function NodeTile({ node, accentColor, onDragStart }) {
  return (
    <Box
      draggable
      onDragStart={(e) => onDragStart(e, node.type, node)}
      className="group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing bg-white border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-xs transition-all duration-150"
    >
      <Box className="flex items-center gap-2 min-w-0 flex-1">
        <GripVertical size={13} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: accentColor || '#2563eb' }}
        />
        <Typography className="!text-[12px] !font-medium !text-slate-800 group-hover:!text-blue-900 !truncate">
          {node.displayName || node.name || "Untitled Node"}
        </Typography>
      </Box>

      {node.inputParameters?.length > 0 && (
        <span className="text-[10px] text-slate-400 font-mono shrink-0 px-1 py-0.2 rounded bg-slate-50 border border-slate-100">
          {node.inputParameters.length}p
        </span>
      )}
    </Box>
  );
});
