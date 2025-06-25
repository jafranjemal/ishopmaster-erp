import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "ui-library";
import useAuth from "../../context/useAuth";
import { Link } from "react-router-dom";

const PaymentList = ({ payments }) => {
  const { formatDate, formatCurrency } = useAuth();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Payment ID</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead>Method(s)</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p._id}>
            <TableCell>{formatDate(p.paymentDate)}</TableCell>

            <TableCell className="font-mono">
              <Link
                to={`/accounting/payments/${p._id}`}
                className="hover:text-indigo-300 hover:underline"
              >
                {p.paymentId}
              </Link>
            </TableCell>
            <TableCell>
              <Badge
                variant={p.direction === "inflow" ? "success" : "warning"}
                className="capitalize"
              >
                {p.direction}
              </Badge>
            </TableCell>
            <TableCell>
              {p.paymentLines.map((l) => l.paymentMethodId.name).join(", ")}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(p.totalAmount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default PaymentList;
