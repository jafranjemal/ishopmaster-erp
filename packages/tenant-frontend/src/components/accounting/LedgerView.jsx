import React from "react";
import { ArrowRight } from "lucide-react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Card,
  CardContent,
} from "ui-library";

/**
 * A presentational component to display ledger entries with pagination.
 */
const LedgerView = ({ entries, pagination, onPageChange }) => {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const PaginationControls = () => (
    <div className="flex items-center justify-between pt-4">
      <div className="text-sm text-slate-400">
        Page {pagination.currentPage} of {pagination.totalPages} (
        {pagination.total} total entries)
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= pagination.totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Debit Account</TableHead>
              <TableHead>Credit Account</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell>
                  {new Date(entry.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">
                  {entry.description}
                </TableCell>
                <TableCell className="text-green-400">
                  {entry.debitAccountId.name}
                </TableCell>
                <TableCell className="text-red-400">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-slate-600" />
                    {entry.creditAccountId.name}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(entry.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-700">
            <PaginationControls />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LedgerView;
