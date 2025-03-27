"use client";
import { Box, Typography, Button, ButtonGroup, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useCallback, useState, useEffect } from "react";
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import { useNodeTypes } from "@/components/FlowNodes";
import ComponentsSidebar from "@/components/studio/ComponentsSidebar";
import JsonSpecView from "@/components/studio/JsonSpecView";
import { Save, Rocket, Code, List, Eye, Play } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setNodes, setEdges, toggleViewMode, updateSpecification, deleteNode, updateNodeConnections } from "@/redux/slices/flowSlice";
import SideDrawer from "@/components/Common/SideDrawer";
import { fetchTools, fetchAgents, fetchModels, fetchDeployedNodes } from "@/redux/slices/studioSlice";
import NodeDetailsModal from "@/components/studio/NodeDetailsModal";
import { getFlowById } from "@/redux/slices/flowSlice";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams } from 'next/navigation';

const drawerWidth = 280;

function Studio() {
    const dispatch = useDispatch();
    const viewMode = useSelector((state) => state.flow.viewMode);
    const [nodes, setNodesState, onNodesChange] = useNodesState([]);
    const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);
    const nodeTypes = useNodeTypes();
    const [selectedNode, setSelectedNode] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [flowOutput, setFlowOutput] = useState(null);
    const deployedFlows = useSelector(state => state.studio.agentFlows.data || []);
    const [outputModalOpen, setOutputModalOpen] = useState(false);
    const [isFlowRunning, setIsFlowRunning] = useState(false);
    const params = useParams();
    const flowId = params.id;
    const flow = useSelector(state => state.flow.data);
    const loading = useSelector(state => state.flow.loading);

    console.log(flowId, 'id')

    // const flow = getFlowById(deployedFlows, flowId);
    console.log(flow, 'flow')

    useEffect(() => {
        if (!loading && flow?.graphSpec?.nodes?.length > 0 && flow.graphSpec?.edges?.length > 0) {
            const nodeSpacing = { x: 300, y: 250 };
            const maxColumns = 4;

            const nodesWithPositions = flow.graphSpec.nodes.map((node, index) => {
                const column = index % maxColumns;
                const row = Math.floor(index / maxColumns);

                return {
                    ...node,
                    id: node.node_id,
                    key: node.node_id,
                    data: {
                        label: node.name || "Unnamed Node",
                        name: node.name || "Unnamed Node",
                        type: node.type || "default",
                        description: node.description || "",
                        inputParameters: node.inputParameters || [],
                        outputParameters: node.outputParameters || [],
                        next: node.next || [],
                    },
                    position: {
                        x: node.position?.x ?? column * nodeSpacing.x,
                        y: node.position?.y ?? row * nodeSpacing.y,
                    },
                };
            });

            setNodesState(nodesWithPositions);

            const edgeSet = new Set();
            const uniqueEdges = flow.graphSpec.edges
                .filter(edge => edge.from && edge.to)
                .map((edge) => {
                    const edgeId = `${edge.from}-${edge.to}`;
                    if (edgeSet.has(edgeId)) return null;
                    edgeSet.add(edgeId);
                    return {
                        id: edgeId,
                        source: edge.from,
                        target: edge.to,
                        animated: true,
                    };
                })
                .filter(Boolean);

            setEdgesState(uniqueEdges);

            console.log(nodesWithPositions, uniqueEdges, 'nodes and edges')
        }
    }, [flow]);


    //console.log(nodes, edges, 'nodes and edges')


    useEffect(() => {
        dispatch(fetchTools());
        dispatch(fetchModels());
        dispatch(fetchAgents());
        dispatch(fetchDeployedNodes());
        dispatch(getFlowById({ id: flowId }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(setNodes(nodes));
    }, [nodes, dispatch]);

    useEffect(() => {
        dispatch(setEdges(edges));
    }, [edges, dispatch]);


    const onConnect = useCallback(
        (params) => {
            const newEdges = addEdge(params, edges);
            setEdgesState(newEdges);

            dispatch(updateNodeConnections({
                source: params.source,
                target: params.target
            }));
        },
        [edges, setEdgesState]
    );

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData("application/reactflow");
            let spec = null;

            try {
                spec = JSON.parse(event.dataTransfer.getData("application/node-spec"));
            } catch (error) {
                console.error("Error parsing node spec:", error);
            }

            const position = {
                x: event.clientX - drawerWidth,
                y: event.clientY - 100,
            };

            const newNode = {
                id: spec.id,
                name: spec.name,
                key: spec.name,
                type: spec.type,
                description: spec.description,
                next: [],
                position,
                data: spec,
            };

            setNodesState((nds) => nds.concat(newNode));
            dispatch(updateSpecification());
        },
        [setNodesState, dispatch]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const handleToggleViewMode = () => {
        dispatch(toggleViewMode());
    };

    const FlowOutputModal = ({ open, onClose, output }) => {
        if (!output) return null;

        return (
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Flow Execution Output</DialogTitle>
                <DialogContent>
                    <Typography variant="h6">Flow Results:</Typography>
                    <pre>{JSON.stringify(output, null, 2)}</pre>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    };



    const handleRunFlow = async (flowId) => {
        setIsFlowRunning(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/execute-graph', {
                agent_id: flowId
            });

            if (response.status === 200) {
                setFlowOutput(response.data);
                toast.success('Flow executed successfully');
                setOutputModalOpen(true);
            }
        } catch (error) {
            console.error('Error executing flow:', error);
            toast.error(`Failed to execute flow: ${error.message}`);
            setFlowOutput(null);
        } finally {
            setIsFlowRunning(false);
        }
    };

    const handleDeployFlow = () => {
        console.log('Deploying flow with:', { nodes, edges });
        dispatch(updateSpecification());
    };

    const onNodeClick = (event, node) => {

        console.log('Node clicked:', node);
        setSelectedNode(node);
        setModalOpen(true);
    };

    const handleNodeDelete = useCallback((nodeId) => {
        setNodesState((nodes) => nodes.filter(node => node.id !== nodeId));
        setEdgesState((edges) => edges.filter(edge =>
            edge.source !== nodeId && edge.target !== nodeId
        ));
    }, [setNodesState, setEdgesState]);


    const handleDeleteNode = (node) => {
        if (node && node.id) {
            console.log(node.id, 'node id');
            dispatch(deleteNode(node.id));
            if (handleNodeDelete) {
                handleNodeDelete(node.id);
            }
            setModalOpen(false);
            setSelectedNode(null);
        }
    };

    const handleUpdateNodeParameters = useCallback((nodeId, updatedParameters) => {
        console.log('Updating node parameters:', { nodeId, updatedParameters });
        setNodesState((nodes) =>
            nodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            inputParameters: updatedParameters
                        }
                    };
                }
                return node;
            })
        );

        dispatch(updateSpecification());
    }, [setNodesState, dispatch]);

    return (
        <div className="h-full w-full overflow-hidden">
            <Box className="h-full w-full">
                <FlowOutputModal
                    open={outputModalOpen}
                    onClose={() => setOutputModalOpen(false)}
                    output={flowOutput}
                />
                <Grid container spacing={0} className="h-full">
                    <Grid size={2.5} className="h-full overflow-auto">
                        <ComponentsSidebar />
                    </Grid>
                    <Grid size={9.5} className="h-full relative overflow-hidden">

                        <Box className="p-2 absolute top-0 right-0 flex !justify-end z-10">
                            <Box className="!flex gap-2">
                                <ButtonGroup variant="outlined" size="small" sx={{ mr: 2 }}>
                                    <Tooltip title="Toggle View Mode">
                                        <Button onClick={handleToggleViewMode}>
                                            {viewMode === 'graph' ? <Code size={18} /> : <List size={18} />}
                                        </Button>
                                    </Tooltip>
                                </ButtonGroup>

                                {flowOutput && (
                                    <IconButton
                                        onClick={() => setOutputModalOpen(true)}
                                        color="primary"
                                        title="View Flow Output"
                                    >
                                        <Eye size={24} />
                                    </IconButton>
                                )}



                                <Button
                                    variant="contained"
                                    startIcon={isFlowRunning ? <CircularProgress size={16} /> : <Play size={16} />}
                                    onClick={() => handleRunFlow(flowId)}
                                    disabled={isFlowRunning}
                                    sx={{
                                        backgroundColor: '#6c5ce7',
                                        '&:hover': {
                                            backgroundColor: '#5f50e3'
                                        },
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        py: 0.75
                                    }}
                                >
                                    {isFlowRunning ? 'Running...' : 'Run Flow'}
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<Rocket size={16} />}
                                    onClick={handleDeployFlow}
                                    sx={{
                                        backgroundColor: '#6c5ce7',
                                        '&:hover': {
                                            backgroundColor: '#5f50e3'
                                        },
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        py: 0.75
                                    }}
                                >
                                    Deploy Flow
                                </Button>
                            </Box>
                        </Box>



                        {viewMode === 'graph' ? (
                            <div className="h-full w-full">
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    nodeTypes={nodeTypes}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    onNodeClick={onNodeClick}
                                    fitView
                                    style={{ backgroundColor: "#F7F9FB" }}
                                    defaultEdgeOptions={{
                                        animated: true,
                                        style: { stroke: '#6c5ce7' }
                                    }}
                                >
                                    <Background />
                                    <Controls />
                                </ReactFlow>
                            </div>
                        ) : (
                            <div className="h-full overflow-auto">
                                <JsonSpecView />
                            </div>
                        )}

                        <SideDrawer />
                        <NodeDetailsModal
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
                                displayInputParameters: selectedNode?.data?.inputParameters ? true : false,
                                displayOutputParameters: selectedNode?.data?.outputParameters ? true : false
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
}

export default function StudioPage() {
    return (
        <Studio />
    );
}
