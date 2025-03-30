"use client";
import { Box, Typography, Button, ButtonGroup, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useCallback, useState, useEffect ,useMemo} from "react";
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import { useNodeTypes } from "@/components/FlowNodes";
import ComponentsSidebar from "@/components/studio/ComponentsSidebar";
import JsonSpecView from "@/components/studio/JsonSpecView";
import { Save, Rocket, Code, List, Eye, Play } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleViewMode, updateSpecification } from "@/redux/slices/flowSlice";
import SideDrawer from "@/components/Common/SideDrawer";
import { fetchTools, fetchAgents, fetchModels ,getFlowById, updateFlow, setNodes, setEdges ,deleteNode, updateNodeConnections,updateNode} from "@/redux/slices/studioSlice";
import NodeDetailsModal from "@/components/studio/NodeDetailsModal";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams } from 'next/navigation';

const drawerWidth = 280;


const Studio = () => {
    const dispatch = useDispatch();
    const [nodes, setNodesState, onNodesChange] = useNodesState([]);
    const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [flowOutput, setFlowOutput] = useState(null);
    const [outputModalOpen, setOutputModalOpen] = useState(false);
    const [isFlowRunning, setIsFlowRunning] = useState(false);
    const [saveFlow, setSaveFlow] = useState(false);
    const [toggleViewMode, setToggleViewMode] = useState(false);
    
    const params = useParams();
    const flowId = params.id;
    const flow = useSelector(state => state.studio.flow);
    const loading = useSelector(state => state.studio.studioLoader);
    const specification = useSelector(state => state.studio.specification); 
    const studioUpdateFlowLoader = useSelector(state => state.studio.studioUpdateFlowLoader);   
    const nodeTypes = useNodeTypes();


   useEffect(() => {
        dispatch(getFlowById({ id: flowId }));
        dispatch(fetchTools());
        dispatch(fetchModels());
        dispatch(fetchAgents());
    }, [flowId, dispatch]);



    useEffect(() => {
        if (!flow?.graphSpec?.nodes || !flow?.graphSpec?.edges) return;
        
        if (Array.isArray(flow.graphSpec.nodes) && Array.isArray(flow.graphSpec.edges)) {
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
            console.log("nodes", nodesWithPositions);
            console.log("uniqueEdges", uniqueEdges);
        } else {
            console.error('Invalid graphSpec:', flow.graphSpec);
        }
    }, [flow?.graphSpec, setNodesState, setEdgesState]);

    
    const onConnect = useCallback(
        (params) => {
            setEdgesState((eds) => addEdge(params, eds));
            dispatch(updateNodeConnections({
                source: params.source,
                target: params.target
            }));
        },
        [dispatch, setEdgesState]
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
                return;
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
            // dispatch(updateSpecification());
        },
        [setNodesState]
    );

    useEffect(() => {
        console.log("calling dispatch setNodes");
        dispatch(setNodes({nodes: nodes,flow: flow}));
    }, [nodes]);

    useEffect(() => {
        console.log("calling dispatch setEdges");
        dispatch(setEdges({edges: edges,flow: flow}));
    }, [edges]);


    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const handleToggleViewMode = useCallback(() => {
        setToggleViewMode(prev => !prev);
    }, []);

    const handleRunFlow = useCallback(async (flowId) => {
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
    }, []);

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
            dispatch(deleteNode({flow: flow, nodeId: node.id}));
            handleNodeDelete(node.id);
            setModalOpen(false);
            setSelectedNode(null);
        }
    }, [dispatch, handleNodeDelete]);

    const handleSaveFlow = useCallback(() => {
        setSaveFlow(false);
        console.log('save flow');
        console.log('Flow ID:', flowId);
        console.log('specification',specification);
        console.log('flow before saving',flow);
        dispatch(updateFlow({id: flowId, updatedData: specification}));
    }, [dispatch, flowId, specification, flow]);

    const handleUpdateNodeParameters = useCallback((nodeId, updatedParameters) => {
        // // Update local state
        // setNodesState((nodes) => {
        //     return nodes.map((node) => {
        //         if (node.id === nodeId) {
        //             return {
        //                 ...node,
        //                 data: {
        //                     ...node.data,
        //                     inputParameters: updatedParameters
        //                 }
        //             };
        //         }
        //         return node;
        //     });
        // });
    
        // Update Redux flow
        console.log(nodeId,'NodeIdddd')
        console.log(updatedParameters,'updateddd')
        dispatch(updateNode({flow:flow,nodeId:nodeId,updatedNode:updatedParameters}));
    
        // The specification will be automatically updated by the updateNode action
    }, [dispatch]);

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
            animated: true,
            style: { stroke: '#6c5ce7' }
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

    // FlowOutputModal component
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
                                            {toggleViewMode ? <Code size={18} /> : <List size={18} />}
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
                                    startIcon={studioUpdateFlowLoader ? <CircularProgress size={16} /> : <Save size={16} />}
                                    onClick={() => handleSaveFlow()}
                                    // disabled={isFlowRunning}
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
                                    {saveFlow ? 'Saving Flow...' : 'Save Flow'}
                                </Button>

                                {/* {saveFlow && ( */}
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
                                {/* )} */}

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

                        {!toggleViewMode ? (
                            <div className="h-full w-full">
                                <ReactFlow {...reactFlowProps}>
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
                                displayInputParameters: !!selectedNode?.data?.inputParameters,
                                displayOutputParameters: !!selectedNode?.data?.outputParameters
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
};

export default function StudioPage() {
    return (
        <Studio />
    );
}
