import React from "react";
import { Check, AlertTriangle } from "lucide-react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "ui-library";
import useAuth from "../../context/useAuth";

const PendingChequeList = ({ cheques, onMarkCleared, onMarkBounced }) => {
  const { formatDate, formatCurrency } = useAuth();

  if (cheques.length === 0) {
    return (
      <div className="text-center p-8 text-slate-400">
        There are no cheques pending clearance.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Direction</TableHead>
          <TableHead>Cheque Date</TableHead>
          <TableHead>Cheque #</TableHead>
          <TableHead>Bank</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cheques.map((cheque) => (
          <TableRow key={cheque._id}>
            <TableCell>
              <Badge
                variant={cheque.direction === "inflow" ? "success" : "warning"}
              >
                {cheque.direction === "inflow" ? "Incoming" : "Outgoing"}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(cheque.chequeDate)}</TableCell>
            <TableCell className="font-mono">{cheque.chequeNumber}</TableCell>
            <TableCell>{cheque.bankName}</TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(cheque.paymentId?.totalAmount || 0)}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkBounced(cheque)}
              >
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Bounce
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => onMarkCleared(cheque)}
              >
                <Check className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PendingChequeList;
