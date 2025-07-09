import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";
import useAuth from "../../context/useAuth";
import { cn } from "ui-library/lib/utils";

/**
 * A presentational component to display a list of historical shift summaries.
 */
const ShiftHistoryList = ({ shifts }) => {
  const { formatDate, formatCurrency } = useAuth();

  return (
    <div className="border border-slate-700 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shift ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Cashier</TableHead>
            <TableHead className="text-right">Opening Float</TableHead>
            <TableHead className="text-right">Expected Cash</TableHead>
            <TableHead className="text-right">Closing Float</TableHead>
            <TableHead className="text-right">Variance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-400 h-24">
                No shift history found.
              </TableCell>
            </TableRow>
          )}
          {shifts.map((shift) => (
            <TableRow key={shift._id}>
              <TableCell className="font-mono text-xs">{shift.shiftId}</TableCell>
              <TableCell>{formatDate(shift.shift_end)}</TableCell>
              <TableCell className="font-medium">{shift.userId?.name || "N/A"}</TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(shift.openingFloat)}</TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(shift.expectedClosingFloat)}</TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(shift.closingFloat)}</TableCell>
              <TableCell className="text-right font-mono font-bold">
                <span className={cn(shift.cashVariance > 0 && "text-green-400", shift.cashVariance < 0 && "text-red-400")}>
                  {formatCurrency(shift.cashVariance)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ShiftHistoryList;
