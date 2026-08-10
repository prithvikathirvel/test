"use client";

import { Box, Typography, Button, ButtonGroup, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import { useNodeTypes } from "@/components/FlowNodes";
import ComponentsSidebar from "@/components/studio/ComponentsSidebar";
import JsonSpecView from "@/components/studio/JsonSpecView";
import {
  Save,
  Rocket,
  Code,
  Workflow,
  Play,
  List,
  Mic,
  MicOff,
  Settings,
  ArrowLeft,
  Sliders
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import SideDrawer from "@/components/Common/SideDrawer";
import {
  fetchTools,
  fetchAgents,
  fetchModels,
  getFlowById,
  updateFlow,
  setNodes,
  setEdges,
  deleteNode,
  updateNodeConnections,
  updateNode,
  runFlow,
  updateSpecification,
  getAllFlows,
  fetchMcpTools,
} from "@/redux/slices/studioSlice";
import NodeDetailsModal from "@/components/studio/NodeDetailsModal";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import StudioChatBot from "@/components/studio/StudioChatBot";
import { getLastOutputParameter } from "@/utils/commonFunction";
import InputFieldConfiguration from "@/components/InputFieldConfiguration";
import VoiceConfigModal from "@/components/studio/VoiceConfigModal";

const drawerWidth = 280;

const Studio = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mainGridSize, setMainGridSize] = useState(9.5);
  const [prevGridSize, setPrevGridSize] = useState(9.5);
  const dispatch = useDispatch();
  const router = useRouter();
  const [nodes, setNodesState, onNodesChange] = useNodesState([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [outputModalOpen, setOutputModalOpen] = useState(false);
  const [inputConfigOpen, setInputConfigOpen] = useState(false);
  const [saveFlow, setSaveFlow] = useState(false);
  const [formattedOututParam, setFormattedOututParam] = useState(null);
  const [toggleViewMode, setToggleViewMode] = useState(false);
  const [renderFlow, setRenderFlow] = useState(false);
  const params = useParams();
  const flowId = params.id;
  const flow = useSelector((state) => state.studio.flow);
  const specification = useSelector((state) => state.studio.specification);
  const studioUpdateFlowLoader = useSelector((state) => state.studio.studioUpdateFlowLoader);
  const isFlowRunning = useSelector((state) => state.studio.isFlowRunning);
  const nodeTypes = useNodeTypes();

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const flowRef = useRef(flow);
  flowRef.current = flow;

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceConfig, setVoiceConfig] = useState({
    tts_provider: "piper",
    stt_provider: "whisper",
    mode: "voice_in_voice_out",
  });
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await dispatch(getFlowById({ id: flowId })).unwrap();
        dispatch(fetchTools());
        dispatch(fetchModels());
        dispatch(fetchAgents());
        dispatch(getAllFlows());
        dispatch(fetchMcpTools());
      } catch (error) {
        console.error("Error fetching initial flow data:", error);
      }
    };
    fetchInitialData();
  }, [flowId, dispatch]);

  useEffect(() => {
    if (!flow?.graphSpec?.nodes || !flow?.graphSpec?.edges) return;

    if (flow?.voice_enabled !== undefined) setVoiceEnabled(flow.voice_enabled);
    if (flow?.voice_config) setVoiceConfig(flow.voice_config);

    const adjacencyList = {};
    flow.graphSpec.edges.forEach((edge) => {
      if (!adjacencyList[edge.from]) adjacencyList[edge.from] = [];
      adjacencyList[edge.from].push(edge.to);
    });

    const nodeMap = {};
    flow.graphSpec.nodes.forEach((node) => {
      nodeMap[node.node_id] = node;
    });

    const incomingEdges = {};
    flow.graphSpec.edges.forEach((edge) => {
      incomingEdges[edge.to] = (incomingEdges[edge.to] || 0) + 1;
    });

    const rootNodes = flow.graphSpec.nodes
      .filter((node) => !incomingEdges[node.node_id])
      .map((node) => node.node_id);

    const horizontalSpacing = 300;
    const baseVerticalSpacing = 280;
    const baseNodeHeight = 75;

    const calculateNodeHeight = (node) => {
      const nodeType = node.type?.toLowerCase();
      let height = baseNodeHeight;

      if (nodeType === "question") {
        height = 140;
        const optionsParam = node.inputParameters?.find((param) => param.key === "options");
        const optionsCount = optionsParam?.value ? Object.keys(optionsParam.value).length : 0;
        height += Math.max(optionsCount * 45, 70);
      } else if (nodeType === "decision" || nodeType === "conditions" || nodeType === "condition") {
        height = 140;
        const conditionParam = node.inputParameters?.find((param) => param.type === "condition");
        const conditionsCount = conditionParam?.value ? conditionParam.value.length : 0;
        height += Math.max(conditionsCount * 50, 70);
      } else if (nodeType === "iterator") {
        height = 110;
      } else if (nodeType === "tool") {
        height = 100;
      } else if (nodeType === "agent") {
        height = 105;
      } else if (nodeType === "model") {
        height = 95;
      } else if (nodeType === "inputs" || nodeType === "input") {
        height = 90;
      } else if (nodeType === "output") {
        height = 90;
      } else if (nodeType === "agentflow") {
        height = 100;
      } else {
        height = 85;
      }

      return height;
    };

    const calculateVerticalSpacing = (node1, node2) => {
      const height1 = calculateNodeHeight(node1);
      const height2 = calculateNodeHeight(node2);
      const maxHeight = Math.max(height1, height2);
      return Math.max(baseVerticalSpacing, maxHeight + 120);
    };

    const calculatePositions = () => {
      const positions = {};
      const processedNodes = new Set();
      const levelSpaceUsed = {};

      const processNode = (nodeId, level = 0, verticalPosition = 0) => {
        if (processedNodes.has(nodeId)) return;
        processedNodes.add(nodeId);

        if (!levelSpaceUsed[level]) levelSpaceUsed[level] = 0;

        const currentNode = nodeMap[nodeId];
        const children = adjacencyList[nodeId] || [];

        positions[nodeId] = {
          x: level * horizontalSpacing,
          y: verticalPosition,
        };

        if (children.length > 0) {
          const nextLevel = level + 1;
          if (!levelSpaceUsed[nextLevel]) levelSpaceUsed[nextLevel] = 0;

          let childrenSpacing = [];
          children.forEach((childId) => {
            const childNode = nodeMap[childId];
            const spacing = calculateVerticalSpacing(currentNode, childNode);
            childrenSpacing.push(spacing);
          });

          const maxSpacing = Math.max(...childrenSpacing, baseVerticalSpacing);
          const totalStackHeight = (children.length - 1) * maxSpacing;
          const startY = verticalPosition - totalStackHeight / 2;

          children.forEach((childId, index) => {
            const childY = startY + index * maxSpacing;
            processNode(childId, nextLevel, childY);
          });
        }
      };

      rootNodes.forEach((rootId, index) => {
        const rootNode = nodeMap[rootId];
        const rootNodeHeight = calculateNodeHeight(rootNode);
        const rootSpacing = Math.max(baseVerticalSpacing * 2, rootNodeHeight + 160);
        const rootY = index * rootSpacing;
        processNode(rootId, 0, rootY);
        levelSpaceUsed[0] = rootY + rootSpacing;
      });

      flow.graphSpec.nodes.forEach((node) => {
        if (!processedNodes.has(node.node_id)) {
          const disconnectedLevel = Object.keys(levelSpaceUsed).length;
          if (!levelSpaceUsed[disconnectedLevel]) levelSpaceUsed[disconnectedLevel] = 0;

          const verticalPos = levelSpaceUsed[disconnectedLevel];
          positions[node.node_id] = {
            x: disconnectedLevel * horizontalSpacing,
            y: verticalPos,
          };

          const nodeHeight = calculateNodeHeight(node);
          const nodeSpacing = Math.max(baseVerticalSpacing, nodeHeight + 120);
          levelSpaceUsed[disconnectedLevel] += nodeSpacing;
          processedNodes.add(node.node_id);

          const children = adjacencyList[node.node_id] || [];
          if (children.length > 0) {
            let childrenSpacing = [];
            children.forEach((childId) => {
              const childNode = nodeMap[childId];
              const spacing = calculateVerticalSpacing(node, childNode);
              childrenSpacing.push(spacing);
            });

            const maxSpacing = Math.max(...childrenSpacing, baseVerticalSpacing);
            children.forEach((childId, index) => {
              const childY = verticalPos - ((children.length - 1) * maxSpacing) / 2 + index * maxSpacing;
              processNode(childId, disconnectedLevel + 1, childY);
            });
          }
        }
      });

      return positions;
    };

    const positions = calculatePositions();

    const nodesWithPositions = flow.graphSpec.nodes.map((node) => {
      const calculatedPosition = positions[node.node_id] || { x: 0, y: 0 };
      const nodeData = {
        ...node,
        id: node.node_id,
        key: node.node_id,
        data: {
          label: node.name || "Unnamed Node",
          name: node.name || "Unnamed Node",
          type: node.type || "default",
          displayName: node.displayName || node.name,
          description: node.description || "",
          inputParameters: node.inputParameters || [],
          outputParameters: node.outputParameters || [],
          next: node.next || [],
        },
        position: {
          x: node.position?.x ?? calculatedPosition.x,
          y: node.position?.y ?? calculatedPosition.y,
        },
      };

      if (node.type === "decision" || node.data?.type === "decision") {
        nodeData.conditionMetPath = node.conditionMetPath || null;
        nodeData.conditionNotMetPath = node.conditionNotMetPath || null;
        nodeData.data.conditionMetPath = node.conditionMetPath || null;
        nodeData.data.conditionNotMetPath = node.conditionNotMetPath || null;
      }

      if (node.type === "question" || node.data?.type === "question") {
        nodeData.interrupt = node.interrupt || false;
        nodeData.data.interrupt = node.interrupt || false;
      }

      return nodeData;
    });

    setNodesState(nodesWithPositions);

    const edgeSet = new Set();
    const uniqueEdges = flow.graphSpec.edges
      .filter((edge) => edge.from && edge.to)
      .map((edge) => {
        let handleType = edge.condition;
        if (edge.condition === "conditionMet") {
          handleType = "true";
        } else if (edge.condition === "conditionNotMet") {
          handleType = "false";
        }

        const edgeId = `${edge.from}-${edge.to}-${handleType || ""}`;
        if (edgeSet.has(edgeId)) return null;
        edgeSet.add(edgeId);

        return {
          id: edgeId,
          source: edge.from,
          target: edge.to,
          sourceHandle: handleType,
          style: {
            stroke:
              handleType === "true"
                ? "#16a34a"
                : handleType === "false"
                ? "#dc2626"
                : "#71717a",
            strokeWidth: 1.5,
          },
        };
      })
      .filter(Boolean);

    setEdgesState(uniqueEdges);

    if (renderFlow) {
      setRenderFlow(false);
    }
  }, [flow?.graphSpec, renderFlow, setNodesState, setEdgesState]);

  useEffect(() => {
    if (renderFlow) {
      dispatch(getFlowById({ id: flowId }));
    }
  }, [renderFlow, flowId, dispatch]);

  const handleMinimizeSideBar = useCallback(() => {
    if (sidebarOpen) {
      setPrevGridSize(mainGridSize);
      setSidebarOpen(false);
      setMainGridSize(12);
    } else {
      setSidebarOpen(true);
      setMainGridSize(prevGridSize);
    }
  }, [sidebarOpen, mainGridSize, prevGridSize]);

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: "bezier",
        style: {
          stroke:
            params.sourceHandle === "true"
              ? "#16a34a"
              : params.sourceHandle === "false"
              ? "#dc2626"
              : "#71717a",
          strokeWidth: 1.5,
        },
      };

      setEdgesState((eds) => addEdge(edge, eds));

      dispatch(
        updateNodeConnections({
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle,
        })
      );
    },
    [dispatch, setEdgesState]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");

      try {
        const spec = JSON.parse(event.dataTransfer.getData("application/node-spec"));
        if (!spec) return;

        if (type === "agentflow") {
          const flowInputs = spec?.inputs || [];
          if (flowInputs.length > 0) {
            const updatedConfig = {
              ...flowRef.current,
              inputs: [...(flowRef.current?.inputs || []), ...flowInputs],
            };
            dispatch(updateSpecification(updatedConfig));
          }
        }

        const newNodeId = `${spec?.name}_node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const position = {
          x: event.clientX - drawerWidth,
          y: event.clientY - 140,
        };

        const newNode = {
          id: spec.type === "agentflow" ? spec.id : newNodeId,
          name: spec.name,
          key: newNodeId,
          type: spec.type,
          description: spec.description,
          interrupt: spec.interrupt || false,
          next: [],
          position,
          data: {
            label: spec.name,
            name: spec.name,
            type: spec.type,
            description: spec.description,
            inputParameters: spec.inputParameters || [],
            outputParameters:
              spec.type === "agentflow" ? [{ key: "output", value: "", type: "text" }] : spec.outputParameters || [],
            next: [],
          },
        };

        setNodesState((nds) => [...nds, newNode]);
        dispatch(setNodes({ nodes: [...nodesRef.current, newNode], flow: flowRef.current }));
      } catch (error) {
        console.error("Error handling node drop:", error);
      }
    },
    [dispatch, setNodesState]
  );

  const handleRenderFlow = () => {
    setRenderFlow(!renderFlow);
  };

  const handleOpenExecutionOutput = () => {
    setOutputModalOpen(true);
  };

  const syncTimeoutRef = useRef(null);
  const prevNodesLenRef = useRef(0);
  const prevEdgesLenRef = useRef(0);

  useEffect(() => {
    const nodesLen = nodes.length;
    const structuralChange = nodesLen !== prevNodesLenRef.current;
    prevNodesLenRef.current = nodesLen;

    if (structuralChange) {
      dispatch(setNodes({ nodes: nodes, flow: flow }));
    } else {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        dispatch(setNodes({ nodes: nodes, flow: flow }));
      }, 300);
    }

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [nodes]);

  const edgeSyncTimeoutRef = useRef(null);

  useEffect(() => {
    const edgesLen = edges.length;
    const structuralChange = edgesLen !== prevEdgesLenRef.current;
    prevEdgesLenRef.current = edgesLen;

    if (structuralChange) {
      dispatch(setEdges({ edges: edges, flow: flow }));
    } else {
      if (edgeSyncTimeoutRef.current) clearTimeout(edgeSyncTimeoutRef.current);
      edgeSyncTimeoutRef.current = setTimeout(() => {
        dispatch(setEdges({ edges: edges, flow: flow }));
      }, 300);
    }

    return () => {
      if (edgeSyncTimeoutRef.current) clearTimeout(edgeSyncTimeoutRef.current);
    };
  }, [edges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleOpenOutputModal = (flow) => {
    setOutputModalOpen(true);
    const lastParam = getLastOutputParameter(flow);
    setFormattedOututParam(lastParam?.value);
  };

  const handleRunFlow = useCallback(() => {
    dispatch(runFlow({ data: { agent_id: flow?.id }, onSuccess: () => handleOpenOutputModal(flow) }));
  }, [flow, dispatch]);

  const handleDeployFlow = useCallback(() => {
    dispatch(updateSpecification());
    toast.success("Workflow deployed.");
  }, [dispatch]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setModalOpen(true);
  }, []);

  const handleNodeDelete = useCallback(
    (nodeId) => {
      setNodesState((nodes) => nodes.filter((node) => node.id !== nodeId));
      setEdgesState((edges) =>
        edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodesState, setEdgesState]
  );

  const handleDeleteNode = useCallback(
    (node) => {
      if (node && node.id) {
        dispatch(deleteNode({ flow: flow, nodeId: node.id }));
        handleNodeDelete(node.id);
        setModalOpen(false);
        setSelectedNode(null);
      }
    },
    [dispatch, handleNodeDelete, flow]
  );

  const handleSaveFlow = useCallback(() => {
    setSaveFlow(false);
    dispatch(
      updateFlow({
        id: flowId,
        updatedData: specification,
        onSuccess: () => {
          toast.success("Saved");
        },
      })
    );
  }, [dispatch, flowId, specification]);

  const handleUpdateNodeParameters = useCallback(
    (nodeId, updatedParameters, parameter) => {
      dispatch(updateNode({ flow: flow, nodeId: nodeId, updatedNode: updatedParameters, parameter: parameter }));
    },
    [dispatch, flow]
  );

  const handleInputConfigSave = (configurations) => {
    toast.success("Saved");
  };

  const handleVoiceToggle = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    dispatch(updateSpecification({ voice_enabled: newState, voice_config: voiceConfig }));
    if (newState) setIsVoiceModalOpen(true);
  };

  const handleVoiceConfigSave = (newConfig) => {
    setVoiceConfig(newConfig);
    dispatch(updateSpecification({ voice_enabled: voiceEnabled, voice_config: newConfig }));
  };

  const reactFlowProps = useMemo(
    () => ({
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      nodeTypes,
      onDrop,
      onDragOver,
      onNodeClick,
      fitView: true,
      style: { backgroundColor: "#fafafa" },
      defaultEdgeOptions: {
        style: { stroke: "#a1a1aa", strokeWidth: 1.5 },
      },
    }),
    [nodes, edges, onNodesChange, onEdgesChange, onConnect, nodeTypes, onDrop, onDragOver, onNodeClick]
  );

  return (
    <>
      <div className="flex flex-col h-full w-full overflow-hidden bg-[#fafafa]">
        {/* Minimal Header Toolbar */}
        <Box className="h-12 w-full bg-white border-b border-zinc-200 px-5 flex items-center justify-between shrink-0 z-30 select-none">
          <Box className="flex items-center gap-3">
            <button
              onClick={() => router.push("/studio")}
              className="p-1 rounded text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <ArrowLeft size={14} />
              <span>Workflows</span>
            </button>
            <div className="h-3 w-px bg-zinc-200" />
            <span className="text-xs font-semibold text-zinc-900 truncate max-w-xs">
              {flow?.name || flow?.agent_name || "Untitled workflow"}
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </Box>

          <Box className="flex items-center gap-2">
            <button
              onClick={() => setToggleViewMode(!toggleViewMode)}
              className="px-2.5 py-1 rounded border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              {toggleViewMode ? "Canvas" : "JSON"}
            </button>

            <Tooltip title={voiceEnabled ? "Voice enabled" : "Voice disabled"}>
              <button
                onClick={handleVoiceToggle}
                className={`p-1.5 rounded border text-xs font-medium transition-colors ${
                  voiceEnabled
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {voiceEnabled ? <Mic size={14} /> : <MicOff size={14} />}
              </button>
            </Tooltip>

            {voiceEnabled && (
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="p-1.5 rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                <Settings size={14} />
              </button>
            )}

            <button
              onClick={() => setInputConfigOpen(true)}
              className="px-2.5 py-1 rounded border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Sliders size={13} />
              <span>Inputs</span>
            </button>

            <button
              onClick={handleRunFlow}
              disabled={isFlowRunning}
              className="px-3 py-1 rounded border border-zinc-200 hover:bg-zinc-50 text-zinc-900 text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {isFlowRunning ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <Play size={13} />
              )}
              <span>Run</span>
            </button>

            <button
              onClick={handleSaveFlow}
              disabled={studioUpdateFlowLoader}
              className="px-3 py-1 rounded border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {studioUpdateFlowLoader ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <Save size={13} />
              )}
              <span>Save</span>
            </button>

            <button
              onClick={handleDeployFlow}
              className="px-3.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-all"
            >
              Deploy
            </button>
          </Box>
        </Box>

        {/* Embedded Assistant */}
        <StudioChatBot
          className="!z-100"
          opened={true}
          flow={flow}
          handleRenderFlow={handleRenderFlow}
          voiceEnabled={voiceEnabled}
          voiceConfig={voiceConfig}
        />
        <VoiceConfigModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          config={voiceConfig}
          onSave={handleVoiceConfigSave}
        />
        {inputConfigOpen && (
          <InputFieldConfiguration
            open={inputConfigOpen}
            onClose={() => setInputConfigOpen(false)}
            onSave={handleInputConfigSave}
          />
        )}

        {/* Main Canvas Area */}
        <Box className="flex-1 w-full overflow-hidden relative">
          <Grid container spacing={0} className="h-full w-full">
            {sidebarOpen && (
              <Grid
                size={2.5}
                className="h-full overflow-auto border-r border-zinc-200 bg-white transition-all duration-200"
              >
                <ComponentsSidebar
                  minimizeSideBar={!sidebarOpen}
                  handleMinimizeSideBar={handleMinimizeSideBar}
                />
              </Grid>
            )}
            <Grid size={sidebarOpen ? 9.5 : 12} className="h-full relative">
              {!toggleViewMode ? (
                <div className="h-full w-full">
                  <ReactFlow {...reactFlowProps}>
                    <Background color="#e4e4e7" gap={16} size={1} />
                    <Controls />
                  </ReactFlow>
                </div>
              ) : (
                <div className="h-full overflow-auto bg-white p-6">
                  <JsonSpecView />
                </div>
              )}
              <SideDrawer />
              <NodeDetailsModal
                flowId={flow?.id}
                open={modalOpen}
                onClose={() => {
                  setModalOpen(false);
                  setSelectedNode(null);
                }}
                node={selectedNode}
                onDelete={handleDeleteNode}
                onUpdateParameters={handleUpdateNodeParameters}
                sections={{
                  displayBasicInformation: true,
                  displayInputParameters: !!selectedNode?.data?.inputParameters.length > 0,
                  displayOutputParameters: !!selectedNode?.data?.outputParameters.length > 0,
                }}
                flow={flow}
                onOpenExecutionOutput={handleOpenExecutionOutput}
              />
            </Grid>
          </Grid>

          {!sidebarOpen && (
            <Box
              sx={{
                position: "absolute",
                left: 12,
                top: 12,
                zIndex: 40,
              }}
            >
              <button
                onClick={handleMinimizeSideBar}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-zinc-200 text-zinc-700 text-xs font-medium"
              >
                <List size={14} />
                <span>Components</span>
              </button>
            </Box>
          )}
        </Box>
      </div>
    </>
  );
};

export default function StudioPage() {
  return <Studio />;
}
