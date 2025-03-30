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
  CircularProgress,
} from "@mui/material";
import { Network, Plus, Play, Edit, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getAllFlows, saveFlow, updateSpecification } from "@/redux/slices/studioSlice";
import FlowDetailsModal from "@/components/studio/FlowDetailsModal";

const StudioListing = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const flows = useSelector((state) => state.studio.flows || []);
  const [flowDetailsModalOpen, setFlowDetailsModalOpen] = useState(false);
  const newFlowId = useSelector((state) => state.studio.newFlowId);
  const studioSaveFlowLoader = useSelector((state) => state.studio.studioSaveFlowLoader);
  const spec = useSelector((state) => state.studio.specification);



  useEffect(() => {
      dispatch(getAllFlows());
      setFlowDetailsModalOpen(false);
      console.log("newFlowId", newFlowId);
      console.log("spec", spec);
      if (newFlowId) {
        router.push(`/studio/${newFlowId}`);
      }
    
  }, [newFlowId]);

  const handleOpenStudio = (flowId) => {
    router.push(`/studio/${flowId}`);
  };

  const handleRunFlow = (flow) => {
    console.log("Running flow:", flow);
  };

  const handleCreateStudio = () => {
    setFlowDetailsModalOpen(true);
  };

  const updateSpecificationDispatch = (specification) => {
    dispatch(updateSpecification(specification));
  };

  const handleFlowDetailsSubmit = (details) => {
    console.log("Flow details:", details);
    const initialSpec = {
      name: details.name,
      description: details.description,
      type: "flow",
      graphSpec: {
        nodes: [],
        edges: [],
      },
      status: "active",
      version: "1.0.0",
      isPublic: true,
      createdBy: "user",
    };
    console.log("Initial spec:", initialSpec);

    dispatch(saveFlow({data: initialSpec, onSuccess: () => updateSpecificationDispatch(initialSpec)}));
  };

  return (
    <Box className="flex-grow p-8 min-h-screen bg-gradient-to-b from-gray-200 to-white">
      {studioSaveFlowLoader && (
        <Box className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <CircularProgress size={40} />
        </Box>
      )}
      <div className="flex justify-between items-center mb-8">
        <Typography variant="h3" className="font-extrabold text-blue-700 flex items-center">
          <Network className="mr-3" size={40} /> AI Studio
        </Typography>
        <Button
          variant="contained"
          className="bg-blue-600 hover:bg-blue-700 shadow-md px-6 py-2 rounded-lg"
          startIcon={<Plus size={20} />}
          onClick={handleCreateStudio}
        >
          Create New Flow
        </Button>
      </div>

      <Grid container spacing={4} className="mb-10">
        {[{ label: "Total Flows", value: flows.length, icon: <Network size={20} /> },
          { label: "Active Runs", value: 0, icon: <Play size={20} /> },
          { label: "Last Updated", value: "Just Now", icon: <Edit size={20} /> }].map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all rounded-xl p-6 flex items-center">
              {stat.icon}
              <Box className="ml-4">
                <Typography variant="body2" className="text-gray-500">{stat.label}</Typography>
                <Typography variant="h5" className="font-bold">{stat.value}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" className="font-semibold mb-6 text-gray-700">
        Your Flows
      </Typography>

      {flows.length > 0 ? (
        <Grid container spacing={4}>
          {flows.map((flow) => (
            <Grid item xs={12} sm={6} md={4} key={flow.id || flow.agent_id}>
              <Card className="h-full flex flex-col shadow-md hover:shadow-lg transition-transform transform hover:scale-105 rounded-xl overflow-hidden">
                <CardContent className="flex-grow p-6">
                  <Typography variant="h6" className="mb-3 font-bold text-gray-800">
                    {flow.name || flow.agent_name || "Unnamed Flow"}
                  </Typography>
                  <Typography variant="body2" className="mb-4 text-gray-600">
                    {flow.description || flow.agent_description || "No description available"}
                  </Typography>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Edit size={14} className="mr-1" /> Updated 2 days ago
                  </div>
                </CardContent>
                <CardActions className="flex justify-between p-4 bg-gray-100 border-t">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Play size={16} />}
                    onClick={() => handleRunFlow(flow)}
                    className="text-blue-600 border-blue-600 hover:bg-blue-100"
                  >
                    Run
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenStudio(flow.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Open Studio
                  </Button>
                  <IconButton size="small" className="text-red-600 hover:text-red-800">
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
            onClick={handleCreateStudio}
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
