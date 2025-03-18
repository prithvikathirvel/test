"use client"

import { Box, Typography, Button } from "@mui/material"
import Grid from "@mui/material/Grid2"
import { useCallback, useState } from "react"
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  addEdge
} from "reactflow"
import "reactflow/dist/style.css"
import { useNodeTypes } from "@/components/FlowNodes"
import Sidenav from "@/components/layout/Sidenav"
import Header from "@/components/layout/Header"
import ComponentsSidebar from "@/components/studio/ComponentsSidebar"
import { Play, Save ,Rocket} from "lucide-react"
const drawerWidth = 280

function Studio() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const nodeTypes = useNodeTypes()
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      const position = {
        x: event.clientX - drawerWidth,
        y: event.clientY - 100,
      }

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type}` },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes],
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const handleRunFlow = () => {
    console.log('Running flow with:', { nodes, edges })
  }

  const [open, setOpen] = useState(false)

  return (
    <div className="flex">
      <Sidenav open={open} setOpen={setOpen} />
      <div className="h-screen flex-1 p-1">
        <Header title="Agent Studio" />
        <Box sx={{ height: "calc(100vh - 60px)"}}>
          <Box className="!border-b-1 border-gray-300 flex items-center justify-between" sx={{ height: '50px', backgroundColor: 'white', px: 2 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#666' }}>
              Flow Editor
            </Typography>
            <Box className="min-w-[280px] flex flex-row justify-between">
            <Button
              variant="contained"
              startIcon={<Save size={16} />}
              onClick={handleRunFlow}
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
              onClick={handleRunFlow}
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
          <Grid container spacing={2} className="h-full p-1">
            <Grid size={3} className="bg-white !border-r-1 border-gray-200">
              <ComponentsSidebar />
            </Grid>
            <Grid size={9} className="bg-white !border-r-1 border-gray-200">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fitView
                defaultEdgeOptions={{
                  animated: true,
                  style: { stroke: '#6c5ce7' }
                }}
              >
                <Background />
                <Controls />
              </ReactFlow>
            </Grid>
          </Grid>
        </Box>
      </div>
    </div>
  )
}

export default function StudioPage() {
  return (
    <Studio />
  )
}
