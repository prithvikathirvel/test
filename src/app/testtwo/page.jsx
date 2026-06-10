'use client';

import React, { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';
import { Bot } from 'lucide-react';

import ReActAgentNode from '@/components/ReactAgentNode';

// Register the custom node types
const nodeTypes = {
  react_agent: ReActAgentNode,
};

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Handles moving the node around the canvas
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Simulated: Adds a Tool to the specific Agent node's internal state
  const handleAddToolToAgent = (nodeId) => {
    const newTool = {
      name: "check_server_latency",
      node_type: "MCP Tool Caller",
      config: {
        server_id: "infrastructure",
        tool_name: "execute_bash",
        arguments: { command: "ping -c 4 {{target_ip}}" }
      }
    };

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              tools: [...(node.data.tools || []), newTool],
            },
          };
        }
        return node;
      })
    );
  };

  // Handles dropping a new Agent onto the canvas
  const onDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    // Calculate position based on the sidebar width (approx 256px)
    const position = { x: event.clientX - 300, y: event.clientY - 100 };

    const newNode = {
      id: `node_${Date.now()}`,
      type: type,
      position,
      data: {
        model: "gemini-2.5-pro",
        system_prompt: "You are a Level 3 Network NOC Engineer. Diagnose the user's issue...",
        tools: [],
        onAddTool: handleAddToolToAgent, // Pass the function to the custom node
      },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  // Required to allow the browser to accept dropped items
  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // Convert the visual React Flow nodes into the Backend JSON Schema
  const exportToBackend = () => {
    const backendSchema = {
      name: "NOC ReAct Flow",
      type: "flow",
      graphSpec: {
        nodes: nodes.map(n => ({
          node_id: n.id,
          name: "Autonomous ReAct Agent",
          type: "agent",
          inputParameters: [
            { key: "Model", value: n.data.model, type: "text" },
            { key: "system_prompt", value: n.data.system_prompt, type: "text" },
            { key: "tools", value: n.data.tools, type: "object" } // Automatically serializes array of tools to JSON!
          ],
          outputParameters: [{ key: "output", value: "react_final_answer", type: "string" }]
        })),
        edges: edges
      }
    };

    console.log("Sending to FastAPI:", JSON.stringify(backendSchema, null, 2));
    alert("Check browser console for the generated JSON Schema!");
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50">
      {/* LEFT SIDEBAR: Palette */}
      <div className="w-64 bg-white border-r border-slate-200 p-4 shadow-sm z-10 flex flex-col">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Node Palette</h2>

        {/* Draggable ReAct Node Button */}
        <div
          className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg cursor-grab hover:bg-indigo-100 transition-colors flex items-center font-medium text-sm shadow-sm"
          onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'react_agent')}
          draggable
        >
          <Bot size={16} className="mr-2" /> Autonomous Agent
        </div>

        <div className="mt-auto">
          <button onClick={exportToBackend} className="w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
            Export JSON to Backend
          </button>
        </div>
      </div>

      {/* REACT FLOW CANVAS */}
      <div className="flex-1 h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50"
        >
          <Background color="#cbd5e1" gap={16} size={2} />
          <Controls className="bg-white shadow-md border-slate-200" />
        </ReactFlow>
      </div>
    </div>
  );
}