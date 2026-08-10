import React from 'react'
import { Box, Card } from '@mui/material'
import { Play, ArrowUpRight, Clock, Trash2, Workflow } from 'lucide-react'
import { timeAgo } from "@/utils/commonFunction";

const FlowListingGridView = ({ flows, handleRunFlow, handleOpenStudio, handleDeleteFlow }) => {
  return (
    <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flows.map((flow) => (
        <Card
          key={flow.id || flow.agent_id}
          className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-zinc-200 transition-all flex flex-col justify-between"
          elevation={0}
        >
          <Box className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Workflow size={14} className="text-zinc-700" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>

            <h3 className="text-sm font-semibold text-zinc-900 mb-1 line-clamp-1">
              {flow.name || flow.agent_name || "Unnamed workflow"}
            </h3>

            <p className="text-zinc-500 text-xs mb-4 line-clamp-2 leading-relaxed">
              {flow.description || flow.agent_description || "AI agent workflow"}
            </p>

            <Box className="flex items-center gap-1 text-[11px] text-zinc-400">
              <Clock size={12} />
              <span>{timeAgo(flow.updatedAt)}</span>
            </Box>
          </Box>

          <Box className="px-5 py-3 bg-zinc-50/60 border-t border-zinc-100 flex items-center justify-between">
            <button
              onClick={() => handleRunFlow(flow)}
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              <Play size={13} />
              <span>Execute</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenStudio(flow.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors"
              >
                <span>Open</span>
                <ArrowUpRight size={13} />
              </button>

              <button
                onClick={() => handleDeleteFlow(flow.id)}
                className="p-1 rounded text-zinc-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </Box>
        </Card>
      ))}
    </Box>
  )
}

export default FlowListingGridView
