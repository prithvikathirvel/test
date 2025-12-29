import React from "react";
import { Box, Typography } from "@mui/material";
import { FileText, Link2, ArrowUpRight, Trash2,Eye } from "lucide-react";
import CustomTable from "../Common/CustomTable";
import { timeAgo } from "@/utils/commonFunction";
import { useDispatch } from 'react-redux';
import { deleteKnowledgeSource } from '@/redux/slices/knowledgeSlice';

const KnowledgeListingTableView = ({
  filteredFlows,
  handleOpenStudio,
  handleDeleteKnowledge
}) => {

const columns = [
  {
    key: "filename",
    label: "File Name",
    render: (row) => (
      <Box className="flex items-center">
        <Box className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
          {row.type === 'pdf' ? (
            <FileText size={15} className="text-red-500" />
          ) : ['docx', 'doc'].includes(row.type) ? (
            <FileText size={15} className="text-blue-500" />
          ) : row.type === 'txt' ? (
            <FileText size={15} className="text-gray-500" />
          ) : row.type === 'url' ? (
            <Link2 size={15} className="text-blue-500" />
          ) : (
            <FileText size={15} className="text-gray-400" />
          )}
        </Box>
        <Box>
          <Typography className="!text-sm !font-semibold">
            {row.filename}
          </Typography>
          <Typography className="!text-xs !text-slate-400 md:hidden">
            {row.size} • {timeAgo(row.createdAt)}
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    key: "type",
    label: "Type",
    render: (row) => (
      <Typography className="!text-xs !font-medium bg-slate-100 px-2 py-1 rounded-md inline-block uppercase ">
        {row.type}
      </Typography>
    )
  },
  {
    key: "size",
    label: "Size",
    render: (row) => (
      <Typography className="!text-sm !text-slate-500">
        {row.size}
      </Typography>
    )
  },
  {
    key: "createdAt",
    label: "Date Added",
    render: (row) => (
      <Typography className="!text-sm !text-slate-500">
        {timeAgo(row.createdAt)}
      </Typography>
    )
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <Typography
        className={`!text-xs !font-semibold ${
          row.status === "Indexed"
            ? "!text-emerald-600"
            : row.status === "Processing"
            ? "!text-amber-600"
            : "!text-red-600"
        }`}
      >
        {row.status}
      </Typography>
    )
  }
];

  const actions = [
  {
    icon: <Eye size={18} />,
    color: "primary",
    onClick: (row) => handleOpenStudio(row.id)
  },
  {
    icon: <Trash2 size={18} />,
    color: "error",
    onClick: (row) => handleDeleteKnowledge(row.id)
  }
];


  return (
    <CustomTable
      columns={columns}
      rows={filteredFlows}
      rowKey="id"
      actions={actions}
    />
  );
};

export default KnowledgeListingTableView;
