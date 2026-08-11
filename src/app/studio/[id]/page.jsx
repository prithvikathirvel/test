"use client";
import { Box, Typography, Button, ButtonGroup, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import { useNodeTypes } from "@/components/FlowNodes";
import ComponentsSidebar from "@/components/studio/ComponentsSidebar";
import JsonSpecView from "@/components/studio/JsonSpecView";
import { Save, Rocket, Code, Workflow, Eye, Play, ChevronRight, List, Mic, MicOff, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleViewMode } from "@/redux/slices/flowSlice";
import SideDrawer from "@/components/Common/SideDrawer";
import { fetchTools, fetchAgents, fetchModels, getFlowById, updateFlow, setNodes, setEdges, deleteNode, updateNodeConnections, updateNode, runFlow, updateSpecification, getAllFlows, fetchMcpTools } from "@/redux/slices/studioSlice";
import NodeDetailsModal from "@/components/studio/NodeDetailsModal";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams } from 'next/navigation';
import StudioChatBot from "@/components/studio/StudioChatBot";
import { getLastOutputParameter } from "@/utils/commonFunction";
import FlowOutputModal from "@/components/studio/FlowOutputModal";
import InputFieldConfiguration from "@/components/InputFieldConfiguration";
import CustomButton from "@/components/Common/CustomButton";
import VoiceConfigModal from "@/components/studio/VoiceConfigModal";
import StudioHeader from "@/components/studio/StudioHeader";
const drawerWidth = 280;

const Studio = () => {

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mainGridSize, setMainGridSize] = useState(9.5);
    const [prevGridSize, setPrevGridSize] = useState(9.5);
    const dispatch = useDispatch();
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
    const [output, setOutput] = useState(null);
    const params = useParams();
    const flowId = params.id;
    const flow = useSelector(state => state.studio.flow);
    const loading = useSelector(state => state.studio.studioLoader);
    const specification = useSelector(state => state.studio.specification);
    const studioUpdateFlowLoader = useSelector(state => state.studio.studioUpdateFlowLoader);
    const flowOutput = useSelector(state => state.studio.flowOutput);
    const isFlowRunning = useSelector(state => state.studio.isFlowRunning);
    const nodeTypes = useNodeTypes();

    const nodesRef = useRef(nodes);
    nodesRef.current = nodes;
    const flowRef = useRef(flow);
    flowRef.current = flow;

    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [voiceConfig, setVoiceConfig] = useState({
        tts_provider: "piper",
        stt_provider: "whisper",
        mode: "voice_in_voice_out"
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
        
        // Sync voice settings from flow if present
        if (flow?.voice_enabled !== undefined) setVoiceEnabled(flow.voice_enabled);
        if (flow?.voice_config) setVoiceConfig(flow.voice_config);

        console.log("Processing flow data");
        const adjacencyList = {};
        flow.graphSpec.edges.forEach(edge => {
            if (!adjacencyList[edge.from]) adjacencyList[edge.from] = [];
            adjacencyList[edge.from].push(edge.to);
        });

        const nodeMap = {};
        flow.graphSpec.nodes.forEach(node => {
            nodeMap[node.node_id] = node;
        });

        const incomingEdges = {};
        flow.graphSpec.edges.forEach(edge => {
            incomingEdges[edge.to] = (incomingEdges[edge.to] || 0) + 1;
        });

        const rootNodes = flow.graphSpec.nodes
            .filter(node => !incomingEdges[node.node_id])
            .map(node => node.node_id);

        const horizontalSpacing = 300;
        const baseVerticalSpacing = 280;
        const baseNodeHeight = 75;

        // Function to calculate dynamic node height based on type and content
        const calculateNodeHeight = (node) => {
            const nodeType = node.type?.toLowerCase();
            let height = baseNodeHeight;

            // Question nodes have additional content
            if (nodeType === 'question') {
                // Base height + question content + options
                height = 140; // Header + question text (increased from 120)
                const optionsParam = node.inputParameters?.find(param => param.key === 'options');
                const optionsCount = optionsParam?.value ? Object.keys(optionsParam.value).length : 0;
                height += Math.max(optionsCount * 45, 70); // Each option adds ~45px, minimum 70px for options section
            }
            // Decision/Condition nodes have additional content
            else if (nodeType === 'decision' || nodeType === 'conditions' || nodeType === 'condition') {
                height = 140; // Header + condition content (increased from 120)
                const conditionParam = node.inputParameters?.find(param => param.type === 'condition');
                const conditionsCount = conditionParam?.value ? conditionParam.value.length : 0;
                height += Math.max(conditionsCount * 50, 70); // Each condition adds ~50px, minimum 70px for conditions section
            }
            // Iterator nodes are slightly taller due to multiple handles
            else if (nodeType === 'iterator') {
                height = 110; // Increased from 95
            }
            // Tool nodes
            else if (nodeType === 'tool') {
                height = 100; // Increased from base 75
            }
            // Agent nodes
            else if (nodeType === 'agent') {
                height = 105; // Increased from base 75
            }
            // Model nodes
            else if (nodeType === 'model') {
                height = 95; // Increased from base 75
            }
            // Input nodes
            else if (nodeType === 'inputs' || nodeType === 'input') {
                height = 90; // Increased from base 75
            }
            // Output nodes
            else if (nodeType === 'output') {
                height = 90; // Increased from base 75
            }
            // AgentFlow nodes
            else if (nodeType === 'agentflow') {
                height = 100; // Increased from base 75
            }
            // All other nodes get increased base height
            else {
                height = 85; // Increased from base 75
            }

            return height;
        };

        // Function to calculate dynamic vertical spacing between nodes
        const calculateVerticalSpacing = (node1, node2) => {
            const height1 = calculateNodeHeight(node1);
            const height2 = calculateNodeHeight(node2);
            const maxHeight = Math.max(height1, height2);

            // Ensure minimum spacing based on the taller node
            return Math.max(baseVerticalSpacing, maxHeight + 120); // 120px buffer between nodes (increased from 80px)
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
                    y: verticalPosition
                };

                if (children.length > 0) {
                    const nextLevel = level + 1;
                    if (!levelSpaceUsed[nextLevel]) levelSpaceUsed[nextLevel] = 0;

                    // Calculate dynamic spacing for each child
                    let childrenSpacing = [];
                    children.forEach((childId) => {
                        const childNode = nodeMap[childId];
                        const spacing = calculateVerticalSpacing(currentNode, childNode);
                        childrenSpacing.push(spacing);
                    });

                    // Use the maximum spacing needed
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
                const rootSpacing = Math.max(baseVerticalSpacing * 2, rootNodeHeight + 160); // Extra spacing for root nodes (increased from 120)
                const rootY = index * rootSpacing;
                processNode(rootId, 0, rootY);
                levelSpaceUsed[0] = rootY + rootSpacing;
            });


            flow.graphSpec.nodes.forEach(node => {
                if (!processedNodes.has(node.node_id)) {
                    const disconnectedLevel = Object.keys(levelSpaceUsed).length;
                    if (!levelSpaceUsed[disconnectedLevel]) levelSpaceUsed[disconnectedLevel] = 0;

                    const verticalPos = levelSpaceUsed[disconnectedLevel];
                    positions[node.node_id] = {
                        x: disconnectedLevel * horizontalSpacing,
                        y: verticalPos
                    };

                    const nodeHeight = calculateNodeHeight(node);
                    const nodeSpacing = Math.max(baseVerticalSpacing, nodeHeight + 120); // Increased from 80px to 120px
                    levelSpaceUsed[disconnectedLevel] += nodeSpacing;
                    processedNodes.add(node.node_id);

                    const children = adjacencyList[node.node_id] || [];
                    if (children.length > 0) {
                        // Calculate dynamic spacing for disconnected node children
                        let childrenSpacing = [];
                        children.forEach((childId) => {
                            const childNode = nodeMap[childId];
                            const spacing = calculateVerticalSpacing(node, childNode);
                            childrenSpacing.push(spacing);
                        });

                        const maxSpacing = Math.max(...childrenSpacing, baseVerticalSpacing);
                        children.forEach((childId, index) => {
                            const childY = verticalPos - (children.length - 1) * maxSpacing / 2 + index * maxSpacing;
                            processNode(childId, disconnectedLevel + 1, childY);
                        });
                    }
                }
            });

            return positions;
        };

        const positions = calculatePositions();

        const nodesWithPositions = flow.graphSpec.nodes.map(node => {
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

            if (node.type === 'decision' || node.data?.type === 'decision') {
                nodeData.conditionMetPath = node.conditionMetPath || null;
                nodeData.conditionNotMetPath = node.conditionNotMetPath || null;
                nodeData.data.conditionMetPath = node.conditionMetPath || null;
                nodeData.data.conditionNotMetPath = node.conditionNotMetPath || null;
            }

            if (node.type === 'question' || node.data?.type === 'question') {
                nodeData.interrupt = node.interrupt || false;
                nodeData.data.interrupt = node.interrupt || false;
            }

            return nodeData;
        });

        setNodesState(nodesWithPositions);

        const edgeSet = new Set();
        const uniqueEdges = flow.graphSpec.edges
            .filter(edge => edge.from && edge.to)
            .map((edge) => {
                let handleType = edge.condition;
                if (edge.condition === 'conditionMet') {
                    handleType = 'true';
                } else if (edge.condition === 'conditionNotMet') {
                    handleType = 'false';
                }

                const edgeId = `${edge.from}-${edge.to}-${handleType || ''}`;
                if (edgeSet.has(edgeId)) return null;
                edgeSet.add(edgeId);

                return {
                    id: edgeId,
                    source: edge.from,
                    target: edge.to,
                    sourceHandle: handleType,
                    // animated: true,
                    style: {
                        stroke: handleType === 'true' ? '#4CAF50' :
                            handleType === 'false' ? '#F44336' : '#555'
                    },
                };
            })
            .filter(Boolean);

        setEdgesState(uniqueEdges);

        if (renderFlow) {
            setRenderFlow(false);
        }
    }, [flow?.graphSpec, renderFlow]);


    useEffect(() => {
        if (renderFlow) {
            console.log("Refreshing flow data due to renderFlow change");
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
                type: 'bezier',
                style: { stroke: params.sourceHandle === 'true' ? '#4CAF50' : params.sourceHandle === 'false' ? '#F44336' : '#555' },
            };

            setEdgesState((eds) => addEdge(edge, eds));

            dispatch(updateNodeConnections({
                source: params.source,
                target: params.target,
                sourceHandle: params.sourceHandle
            }));
        },
        [dispatch, setEdgesState]
    );

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData("application/reactflow");

            try {
                const spec = JSON.parse(event.dataTransfer.getData("application/node-spec"));
                console.log(spec, 'speckyy')
                if (!spec) {
                    console.error("No node spec found in drop data");
                    return;
                }

                const type = event.dataTransfer.getData("application/reactflow");

                if (type === "agentflow") {
                    const flowInputs = spec?.inputs || [];
                    console.log('flow 1', flowInputs);

                    if (flowInputs.length > 0) {
                        const updatedConfig = {
                            ...flowRef.current,
                            inputs: [...(flowRef.current?.inputs || []), ...flowInputs]
                        };
                        console.log(updatedConfig, 'flow 2')


                        dispatch(updateSpecification(updatedConfig));
                    }
                }

                const newNodeId = `${spec?.name}_node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                const position = {
                    x: event.clientX - drawerWidth,
                    y: event.clientY - 100,
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
                        outputParameters: spec.type === 'agentflow' ? [{ key: "output", value: "", type: "text" }] : spec.outputParameters || [],
                        next: [],
                        // inputs: spec.inputs || [],
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
    }

    const handleOpenExecutionOutput = () => {
        setOutputModalOpen(true);
    }

    const syncTimeoutRef = useRef(null);
    const prevNodesLenRef = useRef(0);
    const prevEdgesLenRef = useRef(0);

    useEffect(() => {
        const nodesLen = nodes.length;
        const structuralChange = nodesLen !== prevNodesLenRef.current;
        prevNodesLenRef.current = nodesLen;

        if (structuralChange) {
            // Immediate sync for add/remove node
            dispatch(setNodes({ nodes: nodes, flow: flow }));
        } else {
            // Debounced sync for position-only changes (drag)
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
            // Immediate sync for add/remove edge
            dispatch(setEdges({ edges: edges, flow: flow }));
        } else {
            // Debounced sync for non-structural changes
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

    const handleToggleViewMode = useCallback(() => {
        setToggleViewMode(prev => !prev);
    }, []);

    const handleOpenOutputModal = (flow) => {
        setOutputModalOpen(true);
        const lastParam = getLastOutputParameter(flow);
        console.log(lastParam, 'lastparamss')
        setFormattedOututParam(lastParam?.value);
    };

    const handleRunFlow = useCallback(() => {
        dispatch(runFlow({ data: { agent_id: flow?.id }, onSuccess: () => handleOpenOutputModal(flow) }))
    }, [flow, dispatch]);

    const handleDeployFlow = useCallback(() => {
        dispatch(updateSpecification());
    }, [dispatch]);

    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node);
        setModalOpen(true);
    }, []);

    const handleNodeDelete = useCallback((nodeId) => {
        setNodesState((nodes) => nodes.filter(node => node.id !== nodeId));
        setEdgesState((edges) => edges.filter(edge =>
            edge.source !== nodeId && edge.target !== nodeId
        ));
    }, [setNodesState, setEdgesState]);

    const handleDeleteNode = useCallback((node) => {
        if (node && node.id) {
            dispatch(deleteNode({ flow: flow, nodeId: node.id }));
            handleNodeDelete(node.id);
            setModalOpen(false);
            setSelectedNode(null);
        }
    }, [dispatch, handleNodeDelete]);

    const handleSaveFlow = useCallback(() => {
        setSaveFlow(false);
        // console.log('save flow');
        // console.log('Flow ID:', flowId);
        // console.log('specification', specification);
        // console.log('flow before saving', flow);
        dispatch(updateFlow({ id: flowId, updatedData: specification, onSuccess: (value) => console.log("Saved Successfully") }));
    }, [dispatch, flowId, specification, flow]);

    const handleUpdateNodeParameters = useCallback((nodeId, updatedParameters, parameter) => {
        console.log(nodeId, 'NodeIdddd')
        console.log(updatedParameters, 'updateddd')
        console.log(parameter, 'parameterrr')
        dispatch(updateNode({ flow: flow, nodeId: nodeId, updatedNode: updatedParameters, parameter: parameter }));

    }, [dispatch]);

    const handleInputConfigSave = (configurations) => {
        console.log('Input configurations:', configurations);
        toast.success('Input configurations saved successfully');
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

    const reactFlowProps = useMemo(() => ({
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
        style: { backgroundColor: "#F7F9FB" },
        defaultEdgeOptions: {
            // type: "bezier",
            // animated: true,
            style: { stroke: 'var(--primary-color)', strokeWidth: 2 }
        }
    }), [
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        nodeTypes,
        onDrop,
        onDragOver,
        onNodeClick
    ]);


    return (
        <>
            <div className="h-full w-full overflow-hidden flex flex-col bg-[#f8fafc]">
                <StudioChatBot 
                    className='!z-100' 
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

                {/* Unified Enterprise Studio Top Header */}
                <StudioHeader
                    flow={flow}
                    flowId={flowId}
                    toggleViewMode={toggleViewMode}
                    onToggleViewMode={handleToggleViewMode}
                    voiceEnabled={voiceEnabled}
                    onVoiceToggle={handleVoiceToggle}
                    onVoiceSettingsClick={() => setIsVoiceModalOpen(true)}
                    onConfigureInputsClick={() => setInputConfigOpen(true)}
                    onRunFlow={handleRunFlow}
                    isFlowRunning={isFlowRunning}
                    onSaveFlow={handleSaveFlow}
                    isSavingFlow={studioUpdateFlowLoader}
                    onDeployFlow={handleDeployFlow}
                />

                {/* Studio Main Workspace (Sidebar + Canvas) */}
                <Box className="flex-1 flex overflow-hidden relative">
                    {sidebarOpen ? (
                        <Box className="w-[280px] h-full shrink-0 transition-all duration-200 ease-in-out border-r border-slate-200/80">
                            <ComponentsSidebar
                                minimizeSideBar={!sidebarOpen}
                                handleMinimizeSideBar={handleMinimizeSideBar}
                            />
                        </Box>
                    ) : (
                        <Box className="absolute top-3 left-3 z-20">
                            <Tooltip title="Expand Components Panel">
                                <button
                                    onClick={handleMinimizeSideBar}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <List size={14} /> Components
                                </button>
                            </Tooltip>
                        </Box>
                    )}

                    <Box className="flex-1 h-full overflow-hidden relative bg-[#f8fafc]">
                        {!toggleViewMode ? (
                            <div className="h-full w-full">
                                <ReactFlow {...reactFlowProps}>
                                    <Background color="#cbd5e1" gap={16} size={1} />
                                    <Controls className="!bg-white !border !border-slate-200 !rounded-lg !shadow-xs" />
                                </ReactFlow>
                            </div>
                        ) : (
                            <div className="h-full overflow-auto p-4">
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
                                displayInputParameters: !!selectedNode?.data?.inputParameters?.length > 0,
                                displayOutputParameters: !!selectedNode?.data?.outputParameters?.length > 0,
                            }}
                            flow={flow}
                            onOpenExecutionOutput={handleOpenExecutionOutput}
                        />
                    </Box>
                </Box>
            </div>
        </>
    );
};

export default function StudioPage() {
    return (
        <Studio />
    );
}