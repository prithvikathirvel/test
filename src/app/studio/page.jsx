"use client";
import { Box, Typography, Button, ButtonGroup, Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useCallback, useState, useEffect } from "react";
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import { useNodeTypes } from "@/components/FlowNodes";
import ComponentsSidebar from "@/components/studio/ComponentsSidebar";
import JsonSpecView from "@/components/studio/JsonSpecView";
import { Save, Rocket, Code, List } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setNodes, setEdges, toggleViewMode, updateSpecification,deleteNode, updateNodeConnections } from "@/redux/slices/flowSlice";
import SideDrawer from "@/components/Common/SideDrawer";
import { fetchTools, fetchAgents, fetchModels, fetchDeployedNodes } from "@/redux/slices/studioSlice";
import NodeDetailsModal from "@/components/studio/NodeDetailsModal";
import { toast } from "react-toastify"; 
import axios from "axios";
import { loadSpecification } from "@/redux/slices/flowSlice";

const drawerWidth = 280;

function Studio() {
  const dispatch = useDispatch();
  const viewMode = useSelector((state) => state.flow.viewMode);
  const [nodes, setNodesState, onNodesChange] = useNodesState([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState([]);
  const nodeTypes = useNodeTypes();
  const [open, setOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const specification = useSelector((state) => state.flow.specification);


  useEffect(() => {
    dispatch(fetchTools());
    dispatch(fetchModels());
    dispatch(fetchAgents());
    dispatch(fetchDeployedNodes());
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

  const loadSampleSpecification = () => {
    const sampleSpecification = {
      agent_id: "67dbef1fba68eac0121fad7909",
      name: "Resume-Parser",
      graphSpec: {
        description: "AI Agent system for parsing and summarising a resume",
        nodes: [
          {
            node_id: "67dbef1fba68eac0121ffgd7909",
            name: "Start Node",
            type: "input",
            description: "Receives user query",
            next: ["67dbef1fba68eac9021fad7909"]
          },
          // ... other nodes from your example
        ],
        edges: [
          { from: "67dbef1fba68eac0121ffgd7909", to: "67dbef1fba68eac9021fad7909" },
          { from: "67dbef1fba68eac9021fad7909", to: "67dbef1fbr78eac9021fahjuo89" }
        ]
      }
    };
  
    handleLoadSpecification(sampleSpecification);
  };

  const handleLoadSpecification = (specificationPayload) => {
    try {
      // Validate specification
      if (!specificationPayload || !specificationPayload.graphSpec || !specificationPayload.graphSpec.nodes) {
        toast.error('Invalid specification');
        return;
      }
  
      // Dispatch the loadSpecification thunk
      dispatch(loadSpecification(specificationPayload));
    } catch (error) {
      console.error('Error loading specification:', error);
      toast.error('Failed to load specification');
    }
  };





  const handleRunFlow = async (specification) => {
    try {
      // Check if specification and nodes exist
      if (!specification || !specification.nodes || specification.nodes.length === 0) {
        toast.error('No nodes found in the flow');
        return;
      }
  
      // Get the first node ID
      const firstNodeId = specification.nodes[0].node_id;
  
      // Make the API call
      const response = await axios.post('http://127.0.0.1:5000/execute-graph', {
        agent_id: firstNodeId
      });

      console.log('Flow execution response:', response);
  
      // Handle successful response
      if(response.status === 200) {
        console.log("Inside Status")
        toast.success('Flow executed successfully');
      }
    } catch (error) {
      console.error('Error executing flow:', error);
      toast.error(`Failed to execute flow: ${error.message}`);
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
      console.log(node.id,'node id');
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
              
              <Button
                variant="contained"
                startIcon={<Save size={16} />}
                onClick={() => handleRunFlow(specification)}
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
                Run Flow
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

      <Button onClick={loadSampleSpecification}>
        Load Sample Specification
      </Button>
            
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
                displayBasicInformation:  true,
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
