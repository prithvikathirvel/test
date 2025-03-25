"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  IconButton,
} from "@mui/material";
import {
  Network,
  Play,
  Plus,
  Settings,
  BarChart4,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { fetchDeployedNodes } from "@/redux/slices/studioSlice";

const StudioListing = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const deployedFlows = useSelector((state) => state.studio.agentFlows.data || []);

  useEffect(() => {
    dispatch(fetchDeployedNodes());
  }, [dispatch]);

  const handleOpenStudio = (flowId) =>{
    router.push(`/studio/${flowId}`);
  };

  const handleRunFlow = (flow) => {
    console.log("Running flow:", flow);
  };

  const handleCreateStudio = () => {
    const newFlowId = uuidv4();
    router.push(`/studio/${newFlowId}`);
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
          { label: "Total Flows", value: deployedFlows.length, icon: <BarChart4 /> },
          { label: "Active Runs", value: 0, icon: <Play /> },
          { label: "Last Updated", value: "Just Now", icon: <Clock /> },
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

      {/* Flow Listing */}
      <Typography variant="h5" className="font-semibold mb-6 text-gray-700">
        Your Flows
      </Typography>

      {deployedFlows.length > 0 ? (
        <Grid container spacing={4}>
          {deployedFlows.map((flow) => (
            <Grid item xs={12} sm={6} md={4} key={flow.id || flow.agent_id}>
              <Card className="h-full flex flex-col transition-transform duration-300 hover:scale-[1.03] border border-gray-200">
                {/* <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div> */}

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
                    <Clock size={14} className="mr-1" /> Updated 2 days ago
                  </div>
                </CardContent>

                <CardActions className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                  <Button
                    variant="contained"
                    className="bg-blue-600 hover:bg-blue-700"
                    startIcon={<Network size={16} />}
                    onClick={() => handleOpenStudio(flow.id || flow.agent_id)}
                  >
                    Open Studio
                  </Button>

                  {/* <IconButton onClick={() => handleRunFlow(flow)}>
                    <Play size={24} className="text-emerald-600" />
                  </IconButton> */}
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
    </Box>
  );
};

export default StudioListing;
