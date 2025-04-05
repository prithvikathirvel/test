import React from 'react'
import { Box, Card, Button } from '@mui/material'
import { Play, ArrowUpRight, Clock, Trash2 } from 'lucide-react'
import {timeAgo} from "@/utils/commonFunction";

const FlowListingGridView = ({ flows, handleRunFlow, handleOpenStudio, handleDeleteFlow }) => {
  return (
    <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {flows.map((flow) => (
      <Card
        key={flow.id || flow.agent_id}
        className="group relative bg-white rounded-xl overflow-hidden shadow-sm  border border-slate-100"
      >
        <Box className="absolute top-0 left-0 w-full h-1 bg-[var(--primary-color)]"></Box>
        <Box className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2 transition-colors">
            {flow.name || flow.agent_name || "Unnamed Flow"}
          </h3>
          <p className="text-slate-500 text-sm mb-4 line-clamp-2">
            {flow.description || flow.agent_description || "No description available"}
          </p>
          <Box className="flex items-center text-xs text-slate-400 mb-4">
            <Clock className="h-3 w-3 mr-1" /> {timeAgo(flow.updatedAt)}
          </Box>

          <Box className="flex items-center justify-between pt-4 border-t border-slate-300">
            <Button
              onClick={() => handleRunFlow(flow)}
    
              className='!text-[var(--primary-color)] !hover:bg-[var(--primary-color)]'
            >
              <Play size={15} className="mr-1" /> Run
            </Button  >

            <Button
            //   color=""
              onClick={() => handleOpenStudio(flow.id)}
              className="!text-[#6c5ce7]"
            >
              Open Studio <ArrowUpRight size={16} className="ml-1" />
            </Button>

            <Button
              onClick={() => handleDeleteFlow(flow.id)}
              color="error"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Box>
        </Box>
      </Card>
    ))}
  </Box>
  )
}

export default FlowListingGridView