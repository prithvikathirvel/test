"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { Network, Plus, Play, Trash2, Search, Filter, ArrowUpRight, Clock, Zap, Grid3X3, List } from "lucide-react"
import { getAllFlows, saveFlow, updateSpecification, deleteFlow } from "@/redux/slices/studioSlice"
import FlowDetailsModal from "@/components/studio/FlowDetailsModal"
import { Container, Box, Paper, Card, Button, ButtonGroup } from "@mui/material"
import DetailsCard from "@/components/StudioListing/DetailsCard";
import Grid from '@mui/material/Grid2';
import InputBox from "@/components/Common/InputBox";
import { sortByField } from "@/utils/commonFunction";
import FlowListingTableView from "@/components/StudioListing/FlowListingTableView";
import FlowListingGridView from "@/components/StudioListing/FlowListingGridView";
import BlurredLoader from '@/components/Common/BlurredLoader';
import colors from "@/utils/colors";

const StudioListing = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const flows = useSelector((state) => state.studio.flows || [])
  const [flowDetailsModalOpen, setFlowDetailsModalOpen] = useState(false)
  const newFlowId = useSelector((state) => state.studio.newFlowId)
  const studioSaveFlowLoader = useSelector((state) => state.studio.studioSaveFlowLoader)
  const spec = useSelector((state) => state.studio.specification)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("list") // grid or list



  useEffect(() => {
    dispatch(getAllFlows())
    setFlowDetailsModalOpen(false)
    if (newFlowId) {
      router.push(`/studio/${newFlowId}`)
    }
  }, [newFlowId])

  const handleDeleteFlow = (flowId) => {
    dispatch(deleteFlow({
      data: flowId,
      onSuccess: () => {
        console.log("Deleted Successfully");
        dispatch(getAllFlows());
      }
    }));
  }


  const handleFlowDetailsSubmit = (details) => {
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
      inputs: []
    };

    dispatch(
      saveFlow({
        data: initialSpec,
        onSuccess: () => {
          updateSpecificationDispatch(initialSpec);
          dispatch(getAllFlows());
        },
      })
    );
  };


  const handleOpenStudio = (flowId) => {
    router.push(`/studio/${flowId}`)
  }

  const handleRunFlow = (flow) => {
    console.log("Running flow:", flow)
  }

  const handleCreateStudio = () => {
    setFlowDetailsModalOpen(true)
  }

  const updateSpecificationDispatch = (specification) => {
    dispatch(updateSpecification(specification))
  }

  const searchFlow = (searchTerm) => {
    setSearchTerm(searchTerm)
  }

  const filteredFlows = sortByField(flows, "updatedAt", "desc").filter(
    (flow) =>
      (flow.name || flow.agent_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flow.description || flow.agent_description || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Box className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {studioSaveFlowLoader && (
        <BlurredLoader title="Creating Flow..." />
      )}

      <Box className="px-4 sm:px-6 lg:px-8 py-10">
        <Container className="!m-0 !mb-10 !min-w-full flex items-center justify-between">
          <Box>
            <h1 className="text-3xl font-extrabold bg-clip-text flex items-center">
              <Box className="text-[var(--primary-color)]">
                <Network className="mr-3 text-[var(--primary-color)]" size={36} />
              </Box>
              Sify Aurora
            </h1>
            <p className="text-slate-500 mt-1">Build, manage, and deploy intelligent workflows</p>
          </Box>

          <button
            onClick={handleCreateStudio}
            className={`px-5 py-2.5 !bg-[var(--primary-color)] hover:cursor-pointer text-white rounded-lg flex items-center font-medium`}
          >
            <Plus size={18} className="mr-2" />
            Create Agentic Flow
          </button>
        </Container>




        <Grid container spacing={4} className="!flex justify-between  mb-10 ">
          <DetailsCard title="Total Flows" icon={<Network className={`h-5 w-5 !text-[${colors.primary}]`} />} flows={flows} />
          <DetailsCard title="Active Runs" icon={<Play className={`h-5 w-5 !text-[${colors.primary}]`} />} flows={[]} />
          <DetailsCard title="Total Failed" icon={<Clock className={`h-5 w-5 !text-[${colors.primary}]`} />} flows={[]} />

        </Grid>

        <Box className="flex flex-row !sm:flex-col justify-end mb-6 gap-4">

          <InputBox
            placeholder="Search"
            value={searchTerm}
            isShowLabel={false}
            height="40px"
            onChange={searchFlow}
            icon={<Search className='text-gray-400' size={18} />}
          />


          <ButtonGroup variant="text" className="!flex items-center shadow-sm !text-slate-400">
            <Button
              onClick={() => setViewMode("grid")}
              className={` h-full ${viewMode === "grid" ? `!bg-[var(--primary-color)]/20` : "text-slate-400"}`}
            >
              <Grid3X3 size={18} className={`!text-[var(--primary-color)]`} />
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              className={`h-full ${viewMode === "list" ? `!bg-[var(--primary-color)]/20` : "!text-slate-400"}`}
            >
              <List size={18} className={`!text-[var(--primary-color)]`} />
            </Button>

          </ButtonGroup>

        </Box>

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
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/70 backdrop-blur-sm rounded-xl border border-dashed border-slate-200 shadow-sm">
            <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Network className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No flows available</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">
              Create your first AI flow to start building intelligent workflows that automate your tasks
            </p>
            <button
              onClick={handleCreateStudio}
              className={`px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center font-medium`}
            >
              <Plus size={18} className="mr-2" />
              Create New Flow
            </button>
          </div>
        )}
      </Box>

      <FlowDetailsModal
        open={flowDetailsModalOpen}
        onClose={() => setFlowDetailsModalOpen(false)}
        onSubmit={handleFlowDetailsSubmit}
      />
    </Box>
  )
}

export default StudioListing
