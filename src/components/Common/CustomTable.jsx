import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Paper,
  Typography,
  Tooltip,
  IconButton
} from "@mui/material";

const CustomTable = ({
  columns = [],
  rows = [],
  rowKey = "id",
  actions = [],
  emptyMessage = "No records found"
}) => {
  return (
    <Box className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200/80 mt-4">
      <TableContainer component={Paper} className="shadow-none">
        <Table className="min-w-full">
          <TableHead className="bg-slate-50/90 border-b border-slate-200/80">
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || "left"}
                  className="!px-6 !py-3.5 !text-[11px] !font-semibold !text-slate-500 !uppercase !tracking-wider"
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.label}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell
                  align="right"
                  className="!px-6 !py-3.5 !text-[11px] !font-semibold !text-slate-500 !uppercase !tracking-wider"
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="!py-12 !text-center"
                >
                  <Typography className="!text-sm !text-slate-400 !font-medium">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={row[rowKey] || idx}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align || "left"} className="!px-6 !py-4">
                      {col.render ? (
                        col.render(row)
                      ) : (
                        <Typography className="!text-[13px] !text-slate-700">
                          {row[col.key] ?? "—"}
                        </Typography>
                      )}
                    </TableCell>
                  ))}

                  {actions.length > 0 && (
                    <TableCell align="right" className="!px-6 !py-4">
                      <Box className="flex justify-end items-center gap-1.5">
                        {actions.map((action, actionIdx) => {
                          const isError = action.color === "error";
                          return (
                            <Tooltip key={actionIdx} title={action.tooltip || ""}>
                              <IconButton
                                size="small"
                                onClick={() => action.onClick(row)}
                                className={`!p-1.5 !rounded-lg transition-colors ${
                                  isError
                                    ? "!text-slate-400 hover:!text-red-600 hover:!bg-red-50"
                                    : "!text-slate-500 hover:!text-blue-600 hover:!bg-blue-50"
                                }`}
                              >
                                {action.icon}
                              </IconButton>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomTable;
