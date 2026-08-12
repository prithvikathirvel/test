import React from "react";
import { Tooltip } from "@mui/material";
import { FileText, FileSpreadsheet, FileCode, Trash2 } from "lucide-react";
import { timeAgo } from "@/utils/commonFunction";

/**
 * Source catalogue grid.
 *
 * The previous version gave every file format its own tinted badge (red PDF,
 * blue DOCX, green CSV...), which turned a reference table into a colour chart.
 * Format is now a neutral monospace token and only the icon glyph varies, so
 * the eye is drawn to status — the one column where colour actually encodes
 * information.
 */

/** Icon per family; deliberately monochrome. */
const formatIcon = (type) => {
  const t = (type || "").toLowerCase();
  if (["csv", "xlsx", "xls"].includes(t)) return FileSpreadsheet;
  if (["json", "md", "txt"].includes(t)) return FileCode;
  return FileText;
};

const STATUS_STYLES = {
  indexed: { dot: "bg-emerald-500", text: "text-emerald-700", ring: "border-emerald-200" },
  processing: { dot: "bg-amber-500 animate-pulse", text: "text-amber-700", ring: "border-amber-200" },
  failed: { dot: "bg-red-500", text: "text-red-700", ring: "border-red-200" },
};

/**
 * Column widths as percentages so the layout is fluid rather than pinned to a
 * pixel minimum. Source takes the slack because it is the only free-text field.
 */
const COLUMNS = [
  { key: 'source', label: 'Source', width: '38%' },
  { key: 'format', label: 'Format', width: '12%' },
  { key: 'size', label: 'Size', width: '12%' },
  { key: 'uploaded', label: 'Uploaded', width: '16%' },
  { key: 'status', label: 'Status', width: '14%' },
  { key: 'actions', label: '', width: '8%', align: 'right' },
];

const KnowledgeListingTableView = ({
  filteredFlows = [],
  handleOpenStudio,
  handleDeleteKnowledge
}) => {
  return (
    <div className="w-full overflow-x-auto">
      {/* Percentage widths + `table-fixed` let the table compress gracefully on
          narrow screens. A fixed `min-w` used to force a horizontal scrollbar
          even when there was room to fit; now the source name absorbs the
          slack and truncates, and scroll only kicks in when genuinely needed. */}
      <table className="w-full text-left border-collapse table-fixed">
        <colgroup>
          {COLUMNS.map((col) => (
            <col key={col.key} style={{ width: col.width }} />
          ))}
        </colgroup>
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap ${
                  col.align === 'right' ? 'text-right' : ''
                }`}
              >
                {col.label ? col.label : <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {filteredFlows.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                No knowledge sources uploaded yet.
              </td>
            </tr>
          ) : (
            filteredFlows.map((row, idx) => {
              const format = (row.type || row.content_type || "txt").toLowerCase();
              const Icon = formatIcon(format);
              const status = row.status || "Indexed";
              const tone = STATUS_STYLES[status.toLowerCase()] || STATUS_STYLES.failed;
              const name =
                row.knowledgeBase || row.knowledge_base_name || row.filename || "Untitled Document";

              return (
                <tr
                  key={row.id || idx}
                  className="group/row hover:bg-slate-50/70 focus-within:bg-slate-50/70 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-8 w-8 shrink-0 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 group-hover/row:border-slate-300 transition-colors">
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold text-slate-800 truncate max-w-xs">
                          {name}
                        </span>
                        {row.filename && row.filename !== name && (
                          <span className="block text-[10.5px] text-slate-400 truncate max-w-xs">
                            {row.filename}
                          </span>
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10.5px] font-mono font-medium uppercase text-slate-500">
                      {format}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-[12px] text-slate-500">
                    {row.size || row.file_size || "—"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-[12px] text-slate-500">
                    {timeAgo(row.createdAt || row.uploaded_at || new Date().toISOString())}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border bg-white px-2 py-0.5 text-[11px] font-medium ${tone.ring} ${tone.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                      {status}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end">
                      <Tooltip title="Delete source">
                        <button
                          type="button"
                          aria-label={`Delete ${name}`}
                          onClick={() => handleDeleteKnowledge && handleDeleteKnowledge(row?.knowledgeBase || row?.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500/40"
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
  );
};

export default KnowledgeListingTableView;
