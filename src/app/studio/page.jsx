"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Grid,
} from "@mui/material";
import {
  Network,
  Plus,
  Play,
  Edit,
  Trash2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { fetchDeployedNodes } from "@/redux/slices/studioSlice";
import { saveFlow } from "@/redux/slices/studioSlice";
import FlowDetailsModal from "@/components/studio/FlowDetailsModal";
import { generateUUID } from '@/utils/commonFunction';

const StudioListing = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const deployedFlows = useSelector((state) => state.studio.agentFlows.data || []);
  const [flowDetailsModalOpen, setFlowDetailsModalOpen] = useState(false);
  const flowId = useSelector((state) => state.studio.saveFlow.data?.data?.id);

  useEffect(() => {
    dispatch(fetchDeployedNodes());
  }, [dispatch]);

  useEffect(() => {
    if (flowId) {
      router.push(`/studio/${flowId}`);
      setFlowDetailsModalOpen(false);
    }
  }, [flowId, router]);

  const handleOpenStudio = (flowId) => {
    router.push(`/studio/${flowId}`);
  };

  const handleRunFlow = (flow) => {
    console.log("Running flow:", flow);
  };

  const handleCreateStudio = () => {
    setFlowDetailsModalOpen(true);
  };

  const handleFlowDetailsSubmit = (details) => {
    const initialSpec = {
      name: details.name,
      description: details.description,
      type: 'flow',
      graphSpec: {
        nodes: [],
        edges: [],
      },
      status: 'active',
      version: '1.0.0',
      isPublic: true, 
      createdBy: "user"
    };

    dispatch(saveFlow(initialSpec));
  };

  return (
    <Box className="flex-grow p-8 bg-gradient-to-b from-gray-100 to-white min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <Typography variant="h3" className="font-extrabold text-primary flex items-center">
          <Network className="mr-3 text-blue-600" size={40} /> AI Studio
        </Typography>

        <Button
          variant="contained"
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          startIcon={<Plus size={20} />}
          onClick={handleCreateStudio}
        >
          Create New Flow
        </Button>
      </div>

      <Grid container spacing={4} className="mb-10">
        {[
          { label: "Total Flows", value: deployedFlows.length, icon: <Network size={20} /> },
          { label: "Active Runs", value: 0, icon: <Play size={20} /> },
          { label: "Last Updated", value: "Just Now", icon: <Edit size={20} /> },
        ].map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card className="bg-white shadow-md hover:shadow-xl transition-all duration-300">
              <CardContent className="flex items-center p-6">
                {stat.icon}
                <Box className="ml-4">
                  <Typography variant="body2" className="text-gray-600">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" className="font-semibold mb-6 text-gray-700">
        Your Flows
      </Typography>

      {deployedFlows.length > 0 ? (
        <Grid container spacing={4}>
          {deployedFlows.map((flow) => (
            <Grid item xs={12} sm={6} md={4} key={flow.id || flow.agent_id}>
              <Card className="h-full flex flex-col transition-transform duration-300 hover:scale-[1.03] border border-gray-200">

                <CardContent className="flex-grow p-6">
                  <Typography variant="h6" className="mb-3 font-bold text-gray-800">
                    {flow.name || flow.agent_name || "Unnamed Flow"}
                  </Typography>

                  <Typography variant="body2" className="mb-4 text-gray-600">
                    {flow.description || flow.agent_description || "No description available"}
                  </Typography>

                  {/* <Chip
                    label={flow.type || flow.agent_type || "Undefined"}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    className="mb-4"
                  /> */}

                  <div className="flex items-center text-gray-500 text-sm">
                    <Edit size={14} className="mr-1" /> Updated 2 days ago
                  </div>
                </CardContent>

                <CardActions className="flex justify-between">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Play size={16} />}
                    onClick={() => handleRunFlow(flow)}
                  >
                    Run
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenStudio(flow.id)}
                  >
                    Open Studio
                  </Button>
                  <IconButton size="small">
                    <Trash2 size={16} />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box className="flex flex-col items-center justify-center h-[400px] bg-white shadow-md rounded-lg border border-dashed border-gray-300">
          <Network size={48} className="text-gray-300 mb-4" />
          <Typography variant="h6" className="text-gray-600 mb-2">
            No flows available
          </Typography>
          <Typography variant="body2" className="text-gray-400 mb-6 text-center">
            Create your first AI flow to start building intelligent workflows
          </Typography>
          <Button
            variant="contained"
            className="bg-blue-600 hover:bg-blue-700"
            startIcon={<Plus size={20} />}
          >
            Create New Flow
          </Button>
        </Box>
      )}
      <FlowDetailsModal
        open={flowDetailsModalOpen}
        onClose={() => setFlowDetailsModalOpen(false)}
        onSubmit={handleFlowDetailsSubmit}
      />
    </Box>
  );
};

export default StudioListing;
