"use client";

import { useCallback, useEffect, useState } from "react";
import { Tooltip, IconButton, CircularProgress } from "@mui/material";
import { RefreshCw } from "lucide-react";
import CustomTable from "@/components/Common/CustomTable";
import { listUsers } from "@/utils/adminAPI";
import { toast } from "sonner";

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
      active
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
        : "bg-slate-100 text-slate-500 border border-slate-200"
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
    {active ? "Active" : "Inactive"}
  </span>
);

const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } catch (err) {
      toast.error("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-[11px] font-semibold">
            {(row.name || row.email || "?").slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[13px] font-semibold text-slate-800">
            {row.name || row.preferred_username || "—"}
          </span>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <span className="text-[12px] font-mono text-slate-600">
          {Array.isArray(row.roles)
            ? row.roles.join(", ")
            : row.role || "—"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => <StatusBadge active={row.isActive !== false} />,
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row) => (
        <span className="text-[12px] text-slate-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-800">Users Registry</h2>
          <p className="text-[12.5px] text-slate-500">
            Workspace users and their roles (read-only).
          </p>
        </div>
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={load} className="!text-slate-500 hover:!text-slate-800">
            <RefreshCw size={14} />
          </IconButton>
        </Tooltip>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <CircularProgress size={24} className="!text-indigo-600" />
        </div>
      ) : (
        <CustomTable
          columns={columns}
          rows={users}
          rowKey="id"
          emptyMessage="No users found."
        />
      )}
    </div>
  );
};

export default UsersSection;
