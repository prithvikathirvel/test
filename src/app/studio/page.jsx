"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Network,
  Plus,
  Play,
  Trash2,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  Zap,
  Grid3X3,
  List,
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  Bot,
  Activity,
  Workflow,
  CheckCircle2,
} from "lucide-react";
import { getAllFlows, saveFlow, updateSpecification, deleteFlow } from "@/redux/slices/studioSlice";
import FlowDetailsModal from "@/components/studio/FlowDetailsModal";
import { Container, Box, Typography, Button, ButtonGroup, Chip, Tooltip } from "@mui/material";
import DetailsCard from "@/components/StudioListing/DetailsCard";
import Grid from "@mui/material/Grid2";
import InputBox from "@/components/Common/InputBox";
import { sortByField } from "@/utils/commonFunction";
import FlowListingTableView from "@/components/StudioListing/FlowListingTableView";
import FlowListingGridView from "@/components/StudioListing/FlowListingGridView";
import BlurredLoader from "@/components/Common/BlurredLoader";
import CustomButton from "@/components/Common/CustomButton";

const StudioListing = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const flows = useSelector((state) => state.studio.flows || []);
  const [flowDetailsModalOpen, setFlowDetailsModalOpen] = useState(false);
  const newFlowId = useSelector((state) => state.studio.newFlowId);
  const studioSaveFlowLoader = useSelector((state) => state.studio.studioSaveFlowLoader);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [selectedFilter, setSelectedFilter] = useState("all"); // 'all', 'active', 'recent'

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
        {/* Top Header & Action Bar */}
        <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Platform</span>
              <span>/</span>
              <span className="text-slate-900">Flow Studio</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              Agent Workflows
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                {flows.length} Total
              </span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Build, test, and orchestrate autonomous AI agent workflows with real-time telemetry.
            </p>
          </div>

          <Box className="flex items-center gap-3">
            <CustomButton
              onClick={handleCreateStudio}
              variant="contained"
              size="medium"
              startIcon={<Plus size={16} />}
              className="!shadow-sm !shadow-blue-500/20"
            >
              Create Agentic Flow
            </CustomButton>
          </Box>
        </Box>

        {/* Enterprise KPI Metric Cards */}
        <Grid container spacing={2.5} className="mb-8">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Flows</p>
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Workflow size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{flows.length}</p>
              <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 font-medium">
                <CheckCircle2 size={12} /> Ready for deployment
              </div>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Instances</p>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">{flows.length > 0 ? flows.length : 0}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Cluster healthy
              </div>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Execution SLA</p>
                <div className="h-8 w-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Zap size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">99.9%</p>
              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                Average latency: 240ms
              </div>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connected Tools</p>
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Cpu size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">12 MCP</p>
              <div className="mt-2 text-[11px] text-slate-500 font-medium">
                OpenAI, Anthropic & Piper
              </div>
            </Box>
          </Grid>
        </Grid>

        {/* Search, Filter, and View Controls */}
        <Box className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <Box className="flex items-center gap-2">
            <InputBox
              placeholder="Search workflows by name or description..."
              value={searchTerm}
              isShowLabel={false}
              height="38px"
              onChange={setSearchTerm}
              className="w-full sm:w-80 bg-white"
              icon={<Search className="text-slate-400" size={16} />}
            />
          </Box>

          <Box className="flex items-center justify-end gap-2">
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <List size={14} /> Table
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-500 hover:text-slate-900"
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
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
              <Sparkles size={22} />
            </div>
            <Typography variant="h6" className="!font-bold !text-slate-900 !tracking-tight mb-1">
              No Workflows Found
            </Typography>
            <Typography variant="body2" className="!text-slate-500 !max-w-md mb-6">
              {searchTerm
                ? "No agent flows match your search filter. Try clearing the query or search for something else."
                : "Create your first AI flow to connect nodes, models, and tools into autonomous agent workflows."}
            </Typography>
            <CustomButton
              onClick={handleCreateStudio}
              variant="contained"
              startIcon={<Plus size={16} />}
            >
              Create First Flow
            </CustomButton>
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
