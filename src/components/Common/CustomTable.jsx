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
  Button
} from "@mui/material";

const CustomTable = ({
  columns = [],
  rows = [],
  rowKey = "id",
  actions = []
}) => {
  return (
    <Box className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 mt-5">
      <TableContainer component={Paper} className="shadow-none">
        <Table className="min-w-full">
          <TableHead className="bg-slate-50">
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || "left"}
                  className="px-6 py-3 text-xs font-semibold text-slate-500 tracking-wider"
                >
                  {col.label}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell
                  align="right"
                  className="px-6 py-3 text-xs font-semibold text-slate-500 tracking-wider"
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody className="divide-y divide-slate-200">
            {rows.map((row) => (
              <TableRow
                key={row[rowKey]}
                className="hover:bg-slate-50"
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className="px-6 py-4">
                    {col.render ? (
                      col.render(row)
                    ) : (
                      <Typography className="!text-sm">
                        {row[col.key] ?? "-"}
                      </Typography>
                    )}
                  </TableCell>
                ))}

                {actions.length > 0 && (
                  <TableCell align="right" className="px-6 py-4">
                    <Box className="flex justify-end gap-1">
                      {actions.map((action, idx) => (
                        <Button
                          key={idx}
                          color={action.color || "primary"}
                          onClick={() => action.onClick(row)}
                        >
                          {action.icon}
                        </Button>
                      ))}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomTable;
