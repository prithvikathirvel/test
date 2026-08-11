"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Sparkles,
} from "lucide-react";
import { getAllFlows, saveFlow, updateSpecification, deleteFlow } from "@/redux/slices/studioSlice";
import FlowDetailsModal from "@/components/studio/FlowDetailsModal";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import InputBox from "@/components/Common/InputBox";
import Pagination from "@/components/Common/Pagination";
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
  const [viewMode, setViewMode] = useState("list");

  // Frontend Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    dispatch(getAllFlows());
    setFlowDetailsModalOpen(false);
    if (newFlowId) {
      router.push(`/studio/${newFlowId}`);
    }
  }, [newFlowId, dispatch, router]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  const handleCreateStudio = () => {
    setFlowDetailsModalOpen(true);
  };

  const filteredFlows = useMemo(() => {
    return sortByField(flows, "updatedAt", "desc").filter((flow) => {
      const nameMatch = (flow.name || flow.agent_name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = (flow.description || flow.agent_description || "").toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || descMatch;
    });
  }, [flows, searchTerm]);

  // Slice flows for current page
  const paginatedFlows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredFlows.slice(startIndex, startIndex + pageSize);
  }, [filteredFlows, currentPage, pageSize]);

  return (
    <Box className="min-h-screen bg-[#f8fafc]">
      {studioSaveFlowLoader && <BlurredLoader title="Creating Flow..." />}

      <Box className="px-6 lg:px-10 py-8">
        {/* Page Header */}
        <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Studio Flows
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Manage and orchestrate AI agent workflows for your workspace
            </p>
          </div>

          <Box className="flex items-center gap-3">
            <button
              onClick={handleCreateStudio}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Plus size={15} /> Create Flow
            </button>
          </Box>
        </Box>

        {/* Minimal Metric Cards */}
        <Grid container spacing={2.5} className="mb-8">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                TOTAL FLOWS
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{flows.length}</p>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                ACTIVE RUNS
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-2">0</p>
              <p className="text-xs text-slate-400 mt-1">0 running</p>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 shadow-2xs">
              <p className="text-[11px] font-semibold text-indigo-900/60 uppercase tracking-wider">
                AVG RESPONSE TIME
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-2">0ms</p>
              <p className="text-xs text-slate-400 mt-1">Per node execution</p>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                SUCCESS RATE
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-2">100%</p>
              <p className="text-xs text-slate-400 mt-1">0 failed runs</p>
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
          <div className="space-y-4">
            {viewMode === "grid" ? (
              <FlowListingGridView
                flows={paginatedFlows}
                handleOpenStudio={handleOpenStudio}
                handleDeleteFlow={handleDeleteFlow}
              />
            ) : (
              <FlowListingTableView
                filteredFlows={paginatedFlows}
                handleOpenStudio={handleOpenStudio}
                handleDeleteFlow={handleDeleteFlow}
              />
            )}

            {/* Reusable Pagination */}
            <Pagination
              currentPage={currentPage}
              totalItems={filteredFlows.length}
              pageSize={pageSize}
              pageSizeOptions={[6, 12, 24, 48]}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </div>
        ) : (
          <Box className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center">
            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center mb-3">
              <Sparkles size={18} />
            </div>
            <Typography variant="h6" className="!font-bold !text-slate-800 !tracking-tight mb-1 !text-base">
              No Workflows Found
            </Typography>
            <Typography variant="body2" className="!text-slate-400 !max-w-md mb-5 !text-xs">
              {searchTerm
                ? "No agent flows match your search query."
                : "Create your first AI workflow to connect nodes, models, and tools."}
            </Typography>
            <button
              onClick={handleCreateStudio}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
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
