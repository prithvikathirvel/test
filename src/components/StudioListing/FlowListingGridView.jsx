import React from "react";
import { Box, Tooltip } from "@mui/material";
import { ArrowUpRight, Clock, Trash2, Workflow } from "lucide-react";
import { timeAgo } from "@/utils/commonFunction";

const flowName = (flow) => flow?.name || flow?.agent_name || "Unnamed Flow";
const flowDesc = (flow) =>
  flow?.description || flow?.agent_description || "";
const flowId = (flow) => flow?.id || flow?.agent_id || "";
const flowVersion = (flow) => {
  const v = flow?.version;
  if (v === null || v === undefined || v === "") return "";
  const str = String(v).trim();
  return str.startsWith("v") ? str : `v${str}`;
};

/**
 * Neutral SaaS grid. Colour is reserved for interaction (hover/focus) and
 * destructive actions — cards themselves stay white + slate so the listing
 * reads as a catalogue, not a palette.
 */
const FlowListingGridView = ({ flows, handleOpenStudio, handleDeleteFlow }) => {
  return (
    <Box className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {flows.map((flow) => {
        const id = flowId(flow);
        const description = flowDesc(flow);
        const version = flowVersion(flow);

        return (
          <article
            key={id}
            className="group flex flex-col bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="p-4 flex-1 flex flex-col min-w-0">
              <div className="flex items-start gap-3">
                <span className="h-8 w-8 shrink-0 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500">
                  <Workflow size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight truncate">
                      {flowName(flow)}
                    </h3>
                    {version ? (
                      <span className="shrink-0 inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] font-mono tabular-nums text-slate-500">
                        {version}
                      </span>
                    ) : null}
                  </div>
                  {description ? (
                    <Tooltip
                      title={
                        <span className="text-[12px] leading-relaxed">
                          {description}
                        </span>
                      }
                      placement="bottom-start"
                      arrow
                      slotProps={{
                        popper: {
                          sx: {
                            "& .MuiTooltip-tooltip": {
                              backgroundColor: "#0f172a",
                              borderRadius: "8px",
                              padding: "8px 10px",
                              maxWidth: 320,
                            },
                            "& .MuiTooltip-arrow": { color: "#0f172a" },
                          },
                        },
                      }}
                    >
                      <p className="mt-1 text-[12px] text-slate-500 leading-relaxed line-clamp-2 cursor-default">
                        {description}
                      </p>
                    </Tooltip>
                  ) : (
                    <p className="mt-1 text-[12px] text-slate-400 italic">
                      No description
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-3 flex items-center gap-1.5 text-[11.5px] text-slate-400">
                <Clock size={12} className="shrink-0" />
                <span>{timeAgo(flow.updatedAt)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleOpenStudio(id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400/40"
              >
                Open <ArrowUpRight size={13} />
              </button>

              <Tooltip title="Delete flow">
                <button
                  type="button"
                  aria-label={`Delete ${flowName(flow)}`}
                  onClick={() => handleDeleteFlow(flow)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500/40"
                >
                  <Trash2 size={14} />
                </button>
              </Tooltip>
            </div>
          </article>
        );
      })}
    </Box>
  );
};

export default FlowListingGridView;
