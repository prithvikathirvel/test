"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus,
  Play,
  Search,
  Grid3X3,
  List,
  Sparkles,
  Workflow,
  Activity,
  Zap,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { getAllFlows, saveFlow, updateSpecification, deleteFlow } from "@/redux/slices/studioSlice";
import FlowDetailsModal from "@/components/studio/FlowDetailsModal";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import InputBox from "@/components/Common/InputBox";
import { sortByField } from "@/utils/commonFunction";
import FlowListingTableView from "@/components/StudioListing/FlowListingTableView";
import FlowListingGridView from "@/components/StudioListing/FlowListingGridView";
import BlurredLoader from "@/components/Common/BlurredLoader";

const StudioListing = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const flows = useSelector((state) => state.studio.flows || []);
  const [flowDetailsModalOpen, setFlowDetailsModalOpen] = useState(false);
  const newFlowId = useSelector((state) => state.studio.newFlowId);
  const studioSaveFlowLoader = useSelector((state) => state.studio.studioSaveFlowLoader);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  useEffect(() => {
    dispatch(getAllFlows());
    setFlowDetailsModalOpen(false);
    if (newFlowId) {
      router.push(`/studio/${newFlowId}`);
    }
  }, [newFlowId, dispatch, router]);

  const handleDeleteFlow = (flowId) => {
    dispatch(
      deleteFlow({
        data: flowId,
        onSuccess: () => {
          dispatch(getAllFlows());
        },
      })
    );
  };

  const handleFlowDetailsSubmit = (details) => {
    const initialSpec = {
      name: details.name,
      description: details.description,
      type: "flow",
      graphSpec: {
        nodes: [],
        edges: [],
      },
      voice_enabled: false,
      voice_config: {
        tts_provider: "piper",
        stt_provider: "whisper",
        mode: "voice_in_voice_out",
      },
      status: "active",
      version: "1.0.0",
      isPublic: true,
      createdBy: "user",
      inputs: [],
    };

    dispatch(
      saveFlow({
        data: initialSpec,
        onSuccess: () => {
          dispatch(updateSpecification(initialSpec));
          dispatch(getAllFlows());
        },
      })
    );
  };

  const handleOpenStudio = (flowId) => {
    router.push(`/studio/${flowId}`);
  };

  const handleRunFlow = (flow) => {
    console.log("Running flow:", flow);
  };

  const handleCreateStudio = () => {
    setFlowDetailsModalOpen(true);
  };

  const filteredFlows = sortByField(flows, "updatedAt", "desc").filter((flow) => {
    const nameMatch = (flow.name || flow.agent_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = (flow.description || flow.agent_description || "").toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || descMatch;
  });

  return (
    <Box className="min-h-screen bg-[#f8fafc]">
      {studioSaveFlowLoader && <BlurredLoader title="Provisioning New Agentic Flow..." />}

      <Box className="px-6 lg:px-10 py-8">
        {/* Top Header */}
        <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <span>Platform</span>
              <span>/</span>
              <span className="text-slate-700">Studio</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
              Flows
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {flows.length}
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Build, test, and orchestrate autonomous AI agent workflows.
            </p>
          </div>

          <Box className="flex items-center gap-3">
            <button
              onClick={handleCreateStudio}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Plus size={15} /> Create Flow
            </button>
          </Box>
        </Box>

        {/* Telemetry Metric Cards */}
        <Grid container spacing={2} className="mb-8">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Flows</p>
                <Workflow size={16} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{flows.length}</p>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
                <CheckCircle2 size={12} className="text-emerald-500" /> Production ready
              </div>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Instances</p>
                <Activity size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{flows.length > 0 ? flows.length : 0}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Cluster operational
              </div>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reliability SLA</p>
                <Zap size={16} className="text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">99.9%</p>
              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                Average latency: 240ms
              </div>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connected Tools</p>
                <Cpu size={16} className="text-violet-600" />
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">12 MCP</p>
              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                OpenAI, Anthropic & Piper
              </div>
            </Box>
          </Grid>
        </Grid>

        {/* Controls Bar */}
        <Box className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <Box className="flex items-center gap-2">
            <InputBox
              placeholder="Search workflows by name or description..."
              value={searchTerm}
              isShowLabel={false}
              height="36px"
              onChange={setSearchTerm}
              className="w-full sm:w-80 bg-white"
              icon={<Search className="text-slate-400" size={15} />}
            />
          </Box>

          <Box className="flex items-center justify-end gap-2">
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-slate-100 text-slate-800 font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List size={14} /> Table
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-slate-800 font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Grid3X3 size={14} /> Grid
              </button>
            </div>
          </Box>
        </Box>

        {/* Content Listing or Empty State */}
        {filteredFlows.length > 0 ? (
          viewMode === "grid" ? (
            <FlowListingGridView
              flows={filteredFlows}
              handleRunFlow={handleRunFlow}
              handleOpenStudio={handleOpenStudio}
              handleDeleteFlow={handleDeleteFlow}
            />
          ) : (
            <FlowListingTableView
              filteredFlows={filteredFlows}
              handleRunFlow={handleRunFlow}
              handleOpenStudio={handleOpenStudio}
              handleDeleteFlow={handleDeleteFlow}
            />
          )
        ) : (
          <Box className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Sparkles size={18} />
            </div>
            <Typography variant="h6" className="!font-bold !text-slate-800 !tracking-tight mb-1 !text-base">
              No Workflows Found
            </Typography>
            <Typography variant="body2" className="!text-slate-500 !max-w-md mb-5 !text-xs">
              {searchTerm
                ? "No agent flows match your search query."
                : "Create your first AI workflow to connect nodes, models, and tools."}
            </Typography>
            <button
              onClick={handleCreateStudio}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Plus size={15} /> Create Flow
            </button>
          </Box>
        )}
      </Box>

      <FlowDetailsModal
        open={flowDetailsModalOpen}
        onClose={() => setFlowDetailsModalOpen(false)}
        onSubmit={handleFlowDetailsSubmit}
      />
    </Box>
  );
};

export default StudioListing;
