import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";
import useAuth from "../../context/useAuth";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { cn } from "ui-library";

/**
 * A presentational component to display a list of historical stock adjustments.
 */
const StockAdjustmentHistoryList = ({ adjustments }) => {
  const { formatDate } = useAuth();

  if (adjustments.length === 0) {
    return <div className="text-center p-8 text-slate-400">No adjustment history found for the selected criteria.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead className="text-right">Quantity Change</TableHead>
          <TableHead>Reason / Notes</TableHead>
          <TableHead>User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {adjustments.map((adj) => {
          const isIncrease = adj.quantityChange > 0;
          const Icon = isIncrease ? ArrowUpCircle : ArrowDownCircle;
          const textColor = isIncrease ? "text-green-400" : "text-red-400";

          return (
            <TableRow key={adj._id}>
              <TableCell>{formatDate(adj.createdAt)}</TableCell>
              <TableCell>
                <div className="font-medium">{adj.ProductVariantId?.variantName || "N/A"}</div>
                <div className="text-xs text-slate-400 font-mono">{adj.ProductVariantId?.sku || "N/A"}</div>
              </TableCell>
              <TableCell>{adj.branchId?.name}</TableCell>
              <TableCell className={cn("text-right font-mono font-bold flex items-center justify-end gap-2", textColor)}>
                <Icon className="h-4 w-4" />
                <span>{isIncrease ? `+${adj.quantityChange}` : adj.quantityChange}</span>
              </TableCell>
              <TableCell className="text-sm text-slate-400 max-w-xs truncate" title={adj.notes}>
                {adj.notes}
              </TableCell>
              <TableCell className="text-slate-400">{adj.userId?.name || "System"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default StockAdjustmentHistoryList;
