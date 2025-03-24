"use client";
import { Box, Typography, Button, ButtonGroup, Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useCallback, useState, useEffect } from "react";
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import { useNodeTypes } from "@/components/FlowNodes";
import Sidenav from "@/components/layout/Sidenav";
import Header from "@/components/layout/Header";
import ComponentsSidebar from "@/components/studio/ComponentsSidebar";
import JsonSpecView from "@/components/studio/JsonSpecView";
import { Save, Rocket, Code, List } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setNodes, setEdges, toggleViewMode, updateSpecification } from "@/redux/slices/flowSlice";
import SideDrawer from "@/components/Common/SideDrawer";
import { fetchTools, fetchAgents, fetchModels } from "@/redux/slices/studioSlice";
import NodeDetailsModal from "@/components/studio/NodeDetailsModal";

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

  useEffect(() => {
    dispatch(fetchTools());
    dispatch(fetchModels());
    dispatch(fetchAgents());
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
        console.log("Node Specification:", spec);
      } catch (error) {
        console.error("Error parsing node spec:", error);
      }

      const position = {
        x: event.clientX - drawerWidth,
        y: event.clientY - 100,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
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

  const handleSaveFlow = () => {
    console.log('Saving flow with:', { nodes, edges });
    dispatch(updateSpecification());
  };

  const handleDeployFlow = () => {
    console.log('Deploying flow with:', { nodes, edges });
    dispatch(updateSpecification());
  };

  // New onNodeClick handler
  const onNodeClick = (event, node) => {
    console.log('Node clicked:', node);
    setSelectedNode(node);
    setModalOpen(true);
  };

  // Handle node deletion from ReactFlow
  const handleNodeDelete = useCallback((nodeId) => {
    setNodesState((nodes) => nodes.filter(node => node.id !== nodeId));
    setEdgesState((edges) => edges.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodesState, setEdgesState]);

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
                onClick={handleSaveFlow}
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
                Save Flow
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
              onClose={() => setModalOpen(false)} 
              node={selectedNode} 
              onDeleteNode={handleNodeDelete}
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
