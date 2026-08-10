"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Workflow,
  Plus,
  Search,
  Grid3X3,
  List,
  Activity,
  Clock
} from "lucide-react";
import { getAllFlows, saveFlow, updateSpecification, deleteFlow } from "@/redux/slices/studioSlice";
import FlowDetailsModal from "@/components/studio/FlowDetailsModal";
import { Box, ButtonGroup, Button } from "@mui/material";
import DetailsCard from "@/components/StudioListing/DetailsCard";
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
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    dispatch(getAllFlows());
    setFlowDetailsModalOpen(false);
    if (newFlowId) {
      router.push(`/studio/${newFlowId}`);
    }
  }, [newFlowId, router]);

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

  const filteredFlows = sortByField(flows, "updatedAt", "desc").filter(
    (flow) =>
      (flow.name || flow.agent_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (flow.description || flow.agent_description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="min-h-screen bg-[#fafafa] px-6 py-8">
      {studioSaveFlowLoader && <BlurredLoader title="Creating workflow..." />}

      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/80">
        <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
          Workflows
        </h1>

        <button
          onClick={() => setFlowDetailsModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>New workflow</span>
        </button>
      </div>

      {/* 3 Minimal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <DetailsCard
          title="Workflows"
          flows={flows}
          subtitle="All pipelines"
        />
        <DetailsCard
          title="Active"
          flows={flows}
          subtitle="Deployed to edge"
        />
        <DetailsCard
          title="Latency"
          flows={flows}
          subtitle="184 ms median"
        />
      </div>

      {/* Toolbar: Minimal Search & View Toggle */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="w-full sm:w-72">
          <InputBox
            placeholder="Search workflows…"
            value={searchTerm}
            isShowLabel={false}
            height="38px"
            onChange={setSearchTerm}
            icon={<Search className="text-zinc-400" size={15} />}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">
            {filteredFlows.length} {filteredFlows.length === 1 ? "workflow" : "workflows"}
          </span>

          <ButtonGroup variant="outlined" size="small" className="!rounded-lg !border-zinc-200 overflow-hidden">
            <Button
              onClick={() => setViewMode("list")}
              sx={{
                borderColor: "#e4e4e7",
                backgroundColor: viewMode === "list" ? "#18181b" : "#ffffff",
                color: viewMode === "list" ? "#ffffff" : "#71717a",
                "&:hover": {
                  backgroundColor: viewMode === "list" ? "#27272a" : "#fafafa",
                },
              }}
            >
              <List size={15} />
            </Button>
            <Button
              onClick={() => setViewMode("grid")}
              sx={{
                borderColor: "#e4e4e7",
                backgroundColor: viewMode === "grid" ? "#18181b" : "#ffffff",
                color: viewMode === "grid" ? "#ffffff" : "#71717a",
                "&:hover": {
                  backgroundColor: viewMode === "grid" ? "#27272a" : "#fafafa",
                },
              }}
            >
              <Grid3X3 size={15} />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Flow Listing */}
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
        <div className="py-16 px-6 bg-white rounded-xl border border-zinc-200 shadow-sm text-center">
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">
            No workflows found
          </h3>
          <p className="text-xs text-zinc-500 mb-6">
            {searchTerm
              ? "No matching workflows."
              : "Create your first workflow to get started."}
          </p>
          <button
            onClick={() => setFlowDetailsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs transition-colors"
          >
            Create workflow
          </button>
        </div>
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
