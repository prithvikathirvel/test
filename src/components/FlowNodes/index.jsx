"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { Handle, Position } from "reactflow";
import { Bot, Workflow, Database, Circle } from "lucide-react";
import { useSelector } from "react-redux";
import { useMemo } from "react";


const getNodeIcon = (type, tools, agents, models) => {
  const item = [...tools, ...agents, ...models].find((item) => item.name === type);

  if (!item) return <Workflow size={20} />;

  switch (item.type) {
    case "Tool":
      return <Bot size={20} />;
    case "Agent":
      return <Workflow size={20} />;
    case "Model":
      return <Database size={20} />;
    default:
      return <Workflow size={20} />;
  }
};

// Get node color based on type
const getNodeColor = (type, tools, agents, models) => {
  const item = [...tools, ...agents, ...models].find((item) => item.name === type);

  if (!item) return "#6c5ce7";

  switch (item.type) {
    case "Tool":
      return "#6c5ce7";
    case "Agent":
      return "#00b894";
    case "Model":
      return "#0984e3";
    default:
      return "#6c5ce7";
  }
};

function CustomNode({ data, type }) {
  const tools = useSelector((state) => state.studio.tools.data);
  const agents = useSelector((state) => state.studio.agents.data);
  const models = useSelector((state) => state.studio.models.data);

  const color = getNodeColor(type, tools, agents, models);
  const icon = getNodeIcon(type, tools, agents, models);

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
        <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>{data.label}</Typography>
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

// Get dynamic node types
export const useNodeTypes = () => {
  const tools = useSelector((state) => state.studio.tools.data);
  const agents = useSelector((state) => state.studio.agents.data);
  const models = useSelector((state) => state.studio.models.data);

  return useMemo(() => {
    return [...tools, ...agents, ...models].reduce((acc, item) => {
      acc[item.name] = CustomNode;
      return acc;
    }, {});
  }, [tools, agents, models]);
};
