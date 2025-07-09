"use client"
import React, { useMemo, useState } from "react";
import ReactFlow, { ReactFlowProvider, Background } from "reactflow";

import "reactflow/dist/style.css";

function transformWorkflowToElements(workflow) {
    // Space between nodes
    const nodeSpacingY = 120;
    const nodeStartX = 250;
    const nodeStartY = 50;
  
    // Transform stages into nodes, aligned vertically
    const nodes = workflow.stages.map((stage, idx) => ({
      id: stage.id,
      data: { label: stage.name },
      position: { x: nodeStartX, y: nodeStartY + idx * nodeSpacingY },
      style: { padding: 20, border: "1px solid black" },
      draggable: true,
      connectable: true,
      selectable: true,
      focusable: true,
    }));
  
    // Transform relationships into edges
    const edges = [];
  
    workflow.stages.forEach((stage) => {
      if (stage.nextPossibleActions) {
        stage.nextPossibleActions.forEach((action) => {
          edges.push({ id: `${stage.id}_${action.id}`, source: stage.id, target: action.id });
        });
      }
    });
  
    return { nodes, edges };
  }

function WorkflowGraph({ workflow }) {
  const { nodes, edges } = useMemo(
    () => transformWorkflowToElements(workflow),
    [workflow]
  );

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "500px" }}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#888" gap={16} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

export default function App() {
  // Your workflow data (that's your object)
  const workflow = {
    isActive: true,
    name: "Metadata Workflow - New Check",
    stages: [
      {
        actionType: "static",
        allowedRoles: ["TSSTechOps"],
        allowedUsers: [],
        id: "3LkjCx8lutI40sjVJjQX",
        isDecision: false,
        isEnd: false,
        isRequest: false,
        isStart: true,
        name: "Start",
        nextPossibleActions: [
          {
            id: "qUR3tLauAujAy1mZwZlT",
            stageName: "ChangeMetadata",
          },
        ],
        status: "started",
      },
      {
        actionType: "static",
        allowedRoles: ["TSSTechOps"],
        allowedUsers: [],
        id: "qUR3tLauAujAy1mZwZlT",
        inputSchema: {
          description: {
            required: false,
            type: "string",
          },
          tags: {
            items: "string",
            required: false,
            type: "array",
          },
          title: {
            required: false,
            type: "string",
          },
        },
        isDecision: false,
        isEnd: false,
        isRequest: true,
        isStart: false,
        name: "ChangeMetadata",
        nextPossibleActions: [
          {
            id: "lJeFg2DydsjSAIxqicfE",
            stageName: "ApproveChanges",
          },
          {
            id: "wcjrI83w5ezIlPa2NhwV",
            stageName: "RejectChanges",
          },
        ],
        status: "Review in Progress",
      },
      {
        actionType: "static",
        allowedRoles: ["SuperAdmin"],
        allowedUsers: [],
        id: "lJeFg2DydsjSAIxqicfE",
        inputSchema: {
          comments: {
            required: false,
            type: "string",
          },
        },
        isDecision: true,
        isEnd: false,
        isRequest: false,
        isStart: false,
        name: "ApproveChanges",
        nextPossibleActions: [
          {
            id: "LhaP64lqX8XpRb8Zw3ab",
            stageName: "CreateSummary",
          },
        ],
        status: "approved",
      },
      {
        actionType: "static",
        allowedRoles: ["SuperAdmin"],
        allowedUsers: [],
        id: "wcjrI83w5ezIlPa2NhwV",
        inputSchema: {
          comments: {
            required: false,
            type: "string",
          },
        },
        isDecision: true,
        isEnd: false,
        isRequest: false,
        isStart: false,
        name: "RejectChanges",
        nextPossibleActions: [
          {
            id: "JRCyEWp8avV8OXJ6uIwy",
            stageName: "End",
          },
        ],
        status: "rejected",
      },
      {
        actionType: "handler",
        handlerFunction: "createSummary",
        id: "LhaP64lqX8XpRb8Zw3ab",
        isEnd: false,
        isStart: false,
        name: "CreateSummary",
        nextPossibleActions: [
          {
            id: "JRCyEWp8avV8OXJ6uIwy",
            stageName: "End",
          },
        ],
        specification: {},
        status: "Update Metadata",
      },
      {
        actionType: "handler",
        handlerFunction: "endWorkflowHandler",
        id: "JRCyEWp8avV8OXJ6uIwy",
        isEnd: true,
        isStart: false,
        name: "End",
        specification: {},
        status: "completed",
      },
    ],
  };

  return <WorkflowGraph workflow={workflow} />;
}

