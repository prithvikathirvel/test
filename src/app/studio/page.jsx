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
  Workflow,
  Activity,
  Timer,
  CheckCircle2,
} from "lucide-react";
import { getAllFlows, saveFlow, updateSpecification, deleteFlow } from "@/redux/slices/studioSlice";
import FlowDetailsModal from "@/components/studio/FlowDetailsModal";
import { Box, Typography } from "@mui/material";
import InputBox from "@/components/Common/InputBox";
import Pagination from "@/components/Common/Pagination";
import { sortByField } from "@/utils/commonFunction";
import FlowListingTableView from "@/components/StudioListing/FlowListingTableView";
import FlowListingGridView from "@/components/StudioListing/FlowListingGridView";
import BlurredLoader from "@/components/Common/BlurredLoader";
import ConfirmDialog from "@/components/Common/ConfirmDialog";
import PageHeader from "@/components/layout/PageHeader";

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

  // Item 8 — deletion is irreversible, so it is always confirmed first.
  const [flowPendingDeletion, setFlowPendingDeletion] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  /** Opens the confirmation dialog; the actual delete happens on confirm. */
  const handleDeleteFlow = (flow) => {
    // Tolerates being called with either the flow object or a bare id.
    setFlowPendingDeletion(
      flow && typeof flow === "object" ? flow : { id: flow, name: "" }
    );
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setFlowPendingDeletion(null);
  };

  const handleConfirmDelete = () => {
    if (!flowPendingDeletion?.id) return;
    setIsDeleting(true);
    dispatch(
      deleteFlow({
        data: flowPendingDeletion.id,
        onSuccess: () => {
          setIsDeleting(false);
          setFlowPendingDeletion(null);
          dispatch(getAllFlows());
        },
      })
    )
      .unwrap()
      .catch(() => {
        // The thunk already toasts the failure; just release the dialog.
        setIsDeleting(false);
        setFlowPendingDeletion(null);
      });
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

      <Box className="px-6 lg:px-5 py-5">
        <PageHeader
          icon={Workflow}
          title="Studio Flows"
          description="Manage and orchestrate AI agent workflows for your workspace"
          actions={
            <button
              onClick={handleCreateStudio}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              <Plus size={15} /> Create Flow
            </button>
          }
        />

        <Box className="mb-6 grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {[
            { label: "Total flows", value: flows.length, Icon: Workflow },
            { label: "Active runs", value: 0, Icon: Activity },
            { label: "Avg response", value: "0ms", Icon: Timer },
            { label: "Success rate", value: "100%", Icon: CheckCircle2 },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3.5">
              <span className="h-8 w-8 shrink-0 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500">
                <Icon size={15} />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {label}
                </span>
                <span className="block text-[17px] font-bold leading-tight text-slate-800 tabular-nums">
                  {value}
                </span>
              </span>
            </div>
          ))}
        </Box>

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
          <Box className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-lg border border-slate-200 text-center">
            <div className="h-10 w-10 rounded-md bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center mb-3">
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors"
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

      {/* Destructive-action guard for flow deletion */}
      <ConfirmDialog
        open={Boolean(flowPendingDeletion)}
        tone="danger"
        title="Delete this workflow?"
        description="This permanently removes the workflow along with its nodes, connections and configuration. This action cannot be undone."
        details={flowPendingDeletion?.name || flowPendingDeletion?.id}
        confirmLabel="Delete workflow"
        cancelLabel="Cancel"
        busy={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Box>
  );
};

export default StudioListing;
