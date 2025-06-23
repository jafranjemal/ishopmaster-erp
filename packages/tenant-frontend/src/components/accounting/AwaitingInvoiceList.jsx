import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";
import useAuth from "../../context/useAuth";

const AwaitingInvoiceList = ({ purchaseOrders }) => {
  const { formatDate, formatCurrency } = useAuth();

  if (purchaseOrders.length === 0) {
    return (
      <div className="text-center p-8 text-slate-400">
        No purchase orders are currently awaiting an invoice.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>PO #</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Order Date</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchaseOrders.map((po) => (
          <TableRow key={po._id}>
            <TableCell className="font-mono">{po.poNumber}</TableCell>
            <TableCell>{po.supplierId?.name || "N/A"}</TableCell>
            <TableCell>{formatDate(po.orderDate)}</TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(po.totalAmount)}
            </TableCell>
            <TableCell className="text-right">
              <Link to={`/accounting/payables/reconcile/${po._id}`}>
                <Button size="sm">Reconcile</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AwaitingInvoiceList;
