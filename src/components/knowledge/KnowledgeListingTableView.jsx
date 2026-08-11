import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { FileText, Link2, ArrowUpRight, Trash2, Eye, Database, FileSpreadsheet, FileCode, Clock } from "lucide-react";
import CustomTable from "../Common/CustomTable";
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
  filteredFlows,
  handleOpenStudio,
  handleDeleteKnowledge
}) => {
  const columns = [
    {
      key: "knowledgeBase",
      label: "Document Source",
      render: (row) => {
        const style = getFileTypeBadge(row.type || row.content_type);
        return (
          <Box className="flex items-center gap-3">
            <Box className={`h-8 w-8 rounded-lg ${style.bg} border ${style.border} flex items-center justify-center shrink-0`}>
              {style.icon}
            </Box>
            <Box className="min-w-0">
              <Typography className="!text-[13px] !font-semibold !text-slate-900 !truncate">
                {row.knowledgeBase || row.knowledge_base_name || row.filename || "Untitled Source"}
              </Typography>
              <Typography className="!text-[11px] !text-slate-400 !truncate">
                {row.filename || row.knowledgeBase}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      key: "type",
      label: "Format",
      render: (row) => {
        const ext = (row.type || row.content_type || "txt").toUpperCase();
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
            {ext}
          </span>
        );
      }
    },
    {
      key: "size",
      label: "File Size",
      render: (row) => (
        <Typography className="!text-[13px] !text-slate-500">
          {row.size || row.file_size || "—"}
        </Typography>
      )
    },
    {
      key: "createdAt",
      label: "Uploaded",
      render: (row) => (
        <Box className="flex items-center gap-1.5 text-[12px] text-slate-500">
          <Clock size={13} className="text-slate-400" />
          <span>{timeAgo(row.createdAt || row.uploaded_at || new Date().toISOString())}</span>
        </Box>
      )
    },
    {
      key: "status",
      label: "Index Status",
      render: (row) => {
        const status = row.status || "Indexed";
        const isIndexed = status.toLowerCase() === "indexed";
        const isProcessing = status.toLowerCase() === "processing";

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
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
        );
      }
    }
  ];

  const actions = [
    {
      icon: <Eye size={16} />,
      tooltip: "Inspect Knowledge Metadata",
      color: "primary",
      onClick: (row) => handleOpenStudio && handleOpenStudio(row.id || row)
    },
    {
      icon: <Trash2 size={16} />,
      tooltip: "Delete Source",
      color: "error",
      onClick: (row) => handleDeleteKnowledge && handleDeleteKnowledge(row?.knowledgeBase || row?.id)
    }
  ];

  return (
    <CustomTable
      columns={columns}
      rows={filteredFlows || []}
      rowKey="id"
      actions={actions}
      emptyMessage="No knowledge sources found. Upload your documents above to get started."
    />
  );
};

export default KnowledgeListingTableView;
