import React from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";
import useAuth from "../../context/useAuth";
import { GitCommitHorizontal } from "lucide-react";

const CommissionsHistoryTable = ({ data }) => {
  const { formatCurrency, formatDate } = useAuth();
  const statusStyles = {
    paid: "bg-green-500/20 text-green-300",
    pending: "bg-amber-500/20 text-amber-300",
  };

  if (!data || data.length === 0) {
    return <p className="p-4 text-center text-slate-400">No commission records found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sale Date</TableHead>
          <TableHead>Invoice ID</TableHead>
          <TableHead className="text-right">Commission Amount</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(data || []).map((commission) => (
          <TableRow key={commission._id}>
            <TableCell>{formatDate(commission.saleDate)}</TableCell>
            <TableCell className="font-mono text-cyan-400">
              <Link to={`/sales/invoices/${commission.salesInvoiceId}`} className="hover:underline">
                {commission.salesInvoiceId}
              </Link>
            </TableCell>
            <TableCell className="text-right font-semibold font-mono">{formatCurrency(commission.commissionAmount)}</TableCell>
            <TableCell className="text-center">
              <Badge variant="custom" className={`${statusStyles[commission.status]} inline-flex items-center gap-1.5`}>
                <GitCommitHorizontal size={14} />
                {commission.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CommissionsHistoryTable;
