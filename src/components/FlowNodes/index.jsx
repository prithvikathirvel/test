"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { Handle, Position } from "reactflow";
import { Bot, Workflow, Database, Circle, CloudUpload } from "lucide-react";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { TextCursorInput } from "lucide-react";

const getNodeIcon = (type, tools, agents, models, inputs, outputs, agentflows) => {
  const item = [...tools, ...agents, ...models, ...inputs, ...outputs, ...agentflows].find((item) => item.type === type);

  if (!item) return <Workflow size={20} />;

  switch (item.type?.toLowerCase()) {
    case "tool":
      return <Workflow size={20} />;
    case "agent":
      return <Bot size={20} />;
    case "model":
      return <Database size={20} />;
    case "input":
      return <TextCursorInput size={20} />;
    case "output":
      return <CloudUpload size={20} />;
    case "agentflow":
      return <Circle size={20} />;
    default:
      return <Circle size={20} />;
  }
};

const getNodeColor = (type, tools, agents, models, inputs, outputs, agentflows) => {
  const item = [...tools, ...agents, ...models, ...inputs, ...outputs, ...agentflows].find((item) => item.type === type);

  if (!item) return "#ddd";

  switch (item.type?.toLowerCase()) {
    case "tool":
      return "#6c5ce7";
    case "agent":
      return "#00b894";
    case "model":
      return "#0984e3";
    case "input":
      return "#0284e3";
    case "output":
      return "#0284e3";
    case "agentflow":
      return "#FF7F50";
    default:
      return "#FF7F50";
  }
};

function CustomNode({ data, type }) {
  const tools = useSelector((state) => state.studio.tools);
  const agents = useSelector((state) => state.studio.agents);
  const models = useSelector((state) => state.studio.models);
  const inputs = useSelector((state) => state.studio.inputs);
  const outputs = useSelector((state) => state.studio.outputs);
  const agentflows = useSelector((state) => state.studio.flows);

  const color = getNodeColor(type, tools, agents, models, inputs, outputs, agentflows);
  const icon = getNodeIcon(type, tools, agents, models, inputs, outputs, agentflows);

  const nodeType = type?.toLowerCase() || data?.type?.toLowerCase();
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
      {nodeType !== "input" && (
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
      )}
      <Box className="flex items-center gap-2">
        <Box sx={{ color }}>{icon}</Box>
        <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
          {data.displayName || data.name}
        </Typography>
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
      {nodeType !== "output" && (
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
      )}
    </Box>
  );
}



export const useNodeTypes = () => {
  const tools = useSelector((state) => state.studio.tools);
  const agents = useSelector((state) => state.studio.agents);
  const models = useSelector((state) => state.studio.models);
  const inputs = useSelector((state) => state.studio.inputs);
  const outputs = useSelector((state) => state.studio.outputs);
  const flows = useSelector((state) => state.studio.flows);
  
  return useMemo(() => {
    const nodeTypes = {};
    
    // Register all regular node types
    [...tools, ...agents, ...models, ...inputs, ...outputs].forEach(item => {   
      nodeTypes[item.type] = CustomNode;
    });

    // Register flows with proper type
    if (Array.isArray(flows)) {
      flows.forEach(flow => {
        if (flow.type) {
          nodeTypes[flow.type] = CustomNode;
        }
      });
    }
    
    return nodeTypes;
  }, [tools, agents, models, inputs, outputs, flows]);
};
