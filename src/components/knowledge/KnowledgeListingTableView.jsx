import React from "react";
import { Typography, Tooltip } from "@mui/material";
import { FileText, Link2, Trash2, Eye, FileSpreadsheet, FileCode, Clock } from "lucide-react";
import { timeAgo } from "@/utils/commonFunction";

const getFileTypeBadge = (type) => {
  const t = (type || "").toLowerCase();
  if (t === "pdf") {
    return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200/60", icon: <FileText size={14} className="text-red-600" /> };
  }
  if (["docx", "doc"].includes(t)) {
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200/60", icon: <FileText size={14} className="text-blue-600" /> };
  }
  if (["csv", "xlsx", "xls"].includes(t)) {
    return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/60", icon: <FileSpreadsheet size={14} className="text-emerald-600" /> };
  }
  if (["json", "md", "txt"].includes(t)) {
    return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/60", icon: <FileCode size={14} className="text-amber-600" /> };
  }
  return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200/60", icon: <FileText size={14} className="text-slate-500" /> };
};

const KnowledgeListingTableView = ({
  filteredFlows = [],
  handleOpenStudio,
  handleDeleteKnowledge
}) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-2xs overflow-hidden border border-slate-200/80">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Document Source
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Format
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Uploaded
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredFlows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-400 font-medium">
                  No knowledge sources uploaded yet.
                </td>
              </tr>
            ) : (
              filteredFlows.map((row, idx) => {
                const style = getFileTypeBadge(row.type || row.content_type);
                const status = row.status || "Indexed";
                const isIndexed = status.toLowerCase() === "indexed";
                const isProcessing = status.toLowerCase() === "processing";

                return (
                  <tr key={row.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-7 w-7 rounded-md ${style.bg} border ${style.border} flex items-center justify-center shrink-0`}>
                          {style.icon}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[13px] font-semibold text-slate-800 truncate block max-w-xs">
                            {row.knowledgeBase || row.knowledge_base_name || row.filename || "Untitled Document"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {(row.type || row.content_type || "txt").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                      {row.size || row.file_size || "—"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-400">
                      {timeAgo(row.createdAt || row.uploaded_at || new Date().toISOString())}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          isIndexed
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : isProcessing
                            ? "bg-amber-50 text-amber-700 border-amber-200/60"
                            : "bg-red-50 text-red-700 border-red-200/60"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isIndexed ? "bg-emerald-500" : isProcessing ? "bg-amber-500 animate-pulse" : "bg-red-500"
                          }`}
                        />
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Tooltip title="Delete Knowledge Base Source">
                          <button
                            onClick={() => handleDeleteKnowledge && handleDeleteKnowledge(row?.knowledgeBase || row?.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KnowledgeListingTableView;
