"use client";
import { Handle, Position } from "reactflow";
import { Bot, Workflow, Database, Circle, CloudUpload, GitBranch, RotateCcw } from 'lucide-react';
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { TextCursorInput } from 'lucide-react';
import Tooltip from '@mui/material/Tooltip';

const getNodeIcon = (type, tools, agents, models, inputs, outputs, agentflows) => {
  const item = [...tools, ...agents, ...models, ...inputs, ...outputs, ...agentflows].find((item) => item.type === type);
  
  switch (type?.toLowerCase()) {
    case "decision": return <GitBranch size={25} />;
    case "iterator": return <RotateCcw size={25} />;
    case "input": return <TextCursorInput size={25} />;
    case "output": return <CloudUpload size={25} />;
  }
  
  if (!item) return <Workflow size={25} />;

  switch (item.type?.toLowerCase()) {
    case "tool": return <Workflow size={25} />;
    case "agent": return <Bot size={25} />;
    case "model": return <Database size={25} />;
    case "agentflow": return <Circle size={25} />;
    default: return <Circle size={25} />;
  }
};

const getNodeStyles = (type, tools, agents, models, inputs, outputs, agentflows) => {
  const item = [...tools, ...agents, ...models, ...inputs, ...outputs, ...agentflows].find((item) => item.type === type);
  if (!item && type !== "decision" && type !== "iterator") {
    return {
      gradient: "from-gray-400 to-gray-500",
      border: "border-gray-400",
      shadow: "shadow-gray-200",
      icon: "text-gray-600",
      handle: "#9CA3AF"
    };
  }
  
  switch (item?.type?.toLowerCase() || type?.toLowerCase()) {
    case "tool":
      return { gradient: "from-purple-500 to-purple-600", border: "border-purple-400", shadow: "shadow-purple-200", icon: "text-purple-600", handle: "#8B5CF6" };
    case "agent":
      return { gradient: "from-emerald-500 to-emerald-600", border: "border-emerald-400", shadow: "shadow-emerald-200", icon: "text-emerald-600", handle: "#10B981" };
    case "model":
      return { gradient: "from-blue-500 to-blue-600", border: "border-blue-400", shadow: "shadow-blue-200", icon: "text-blue-600", handle: "#3B82F6" };
    case "input":
      return { gradient: "from-cyan-500 to-cyan-600", border: "border-cyan-400", shadow: "shadow-cyan-200", icon: "text-cyan-600", handle: "#06B6D4" };
    case "output":
      return { gradient: "from-indigo-500 to-indigo-600", border: "border-indigo-400", shadow: "shadow-indigo-200", icon: "text-indigo-600", handle: "#6366F1" };
    case "agentflow":
      return { gradient: "from-orange-500 to-orange-600", border: "border-orange-400", shadow: "shadow-orange-200", icon: "text-orange-600", handle: "#F97316" };
    case "decision":
      return { gradient: "from-red-400 to-red-500", border: "border-red-400", shadow: "shadow-red-100", icon: "text-red-600", handle: "#EAB308" };
    case "iterator":
      return { gradient: "from-pink-500 to-pink-600", border: "border-pink-400", shadow: "shadow-pink-200", icon: "text-pink-600", handle: "#EC4899" };
    default:
      return { gradient: "from-gray-500 to-gray-600", border: "border-gray-400", shadow: "shadow-gray-200", icon: "text-gray-600", handle: "#6B7280" };
  }
};



function CustomNode({ data, type }) {
  const tools = useSelector((state) => state.studio.tools);
  const agents = useSelector((state) => state.studio.agents);
  const models = useSelector((state) => state.studio.models);
  const inputs = useSelector((state) => state.studio.inputs);
  const outputs = useSelector((state) => state.studio.outputs);
  const agentflows = useSelector((state) => state.studio.flows);
  
  const styles = getNodeStyles(type, tools, agents, models, inputs, outputs, agentflows);
  const icon = getNodeIcon(type, tools, agents, models, inputs, outputs, agentflows);
  const nodeType = type?.toLowerCase() || data?.type?.toLowerCase();

  return (
    <div className={`
      relative min-w-[200px] rounded-xl bg-white border-2 ${styles.border}
      shadow-lg ${styles.shadow} hover:shadow-xl transition-all duration-300
      backdrop-blur-sm bg-opacity-95
    `}>

      <div className={`
        bg-gradient-to-r ${styles.gradient} rounded-t-lg px-4 py-2
        flex items-center gap-3 relative
      `}>
        {nodeType === "iterator" ? (
          <div className="p-2">
            <div className="text-white animate-spin">{icon}</div>
          </div>
        ) : (
          <div className="p-2">
            <div className="text-white">{icon}</div>
          </div>
        )}
        <div className="relative z-10 flex-1">
          <h3 className="text-white font-semibold text-sm leading-tight truncate">
            {data.displayName || data.name}
          </h3>
        </div>
        <div className="relative z-10 w-3 h-3 bg-white rounded-full opacity-80 animate-pulse"></div>
      </div>

      {/* Node Body */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium capitalize">{nodeType}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Ready</span>
          </div>
        </div>
      </div>

      {/* --- HANDLES --- */}

      {/* Input Handle */}
      {nodeType !== "input" && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-4 h-4 border-2 border-white shadow-md"
          style={{ background: styles.handle, left: -8 }}
        />
      )}

      {/* Regular Output Handle */}
      {nodeType !== "output" && nodeType !== "decision" && nodeType !== "iterator" && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-4 h-4 border-2 border-white shadow-md"
          style={{ background: styles.handle, right: -8 }}
        />
      )}

      {/* Decision Node Handles with Tooltips */}
      {nodeType === "decision" && (
        <>
          <Tooltip title="True" placement="right" arrow>
            <Handle
              id="true"
              type="source"
              position={Position.Right}
              className="!w-4 !h-4 border-2 border-white shadow-md"
              style={{ background: "#10B981", right: -8, top: '33.33%' }}
            />
          </Tooltip>
          <Tooltip title="False" placement="right" arrow>
            <Handle
              id="false"
              type="source"
              position={Position.Right}
              className="!w-4 !h-4 border-2 border-white shadow-md"
              style={{ background: "#EF4444", right: -8, top: '66.67%' }}
            />
          </Tooltip>
        </>
      )}

      {/* Iterator Node Handles with Tooltips */}
      {nodeType === "iterator" && (
        <>
          <Tooltip title="Loop" placement="right" arrow>
            <Handle
              id="loop"
              type="source"
              position={Position.Right}
              className="!w-4 !h-4 border-2 border-white shadow-md"
              style={{ background: "#3B82F6", right: -8, top: '33.33%' }}
            />
          </Tooltip>
          <Tooltip title="Done" placement="right" arrow>
            <Handle
              id="complete"
              type="source"
              position={Position.Right}
              className="!w-4 !h-4 border-2 border-white shadow-md"
              style={{ background: "#6B7280", right: -8, top: '66.67%' }}
            />
          </Tooltip>
        </>
      )}
    </div>
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
    const nodeTypes = {
      decision: CustomNode,
      iterator: CustomNode,
    };
        
    [...tools, ...agents, ...models, ...inputs, ...outputs].forEach(item => {
      if (item && item.type) {
        nodeTypes[item.type] = CustomNode;
      }
    });
    
    if (Array.isArray(flows)) {
      flows.forEach(flow => {
        if (flow && flow.type) {
          nodeTypes[flow.type] = CustomNode;
        }
      });
    }
        
    return nodeTypes;
  }, [tools, agents, models, inputs, outputs, flows]);
};