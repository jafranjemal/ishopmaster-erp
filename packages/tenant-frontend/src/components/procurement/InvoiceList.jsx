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
  Badge,
} from "ui-library";
import useAuth from "../../context/useAuth";
import { Eye } from "lucide-react";

const InvoiceList = ({ invoices }) => {
  const { formatDate, formatCurrency } = useAuth();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Invoice Date</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice._id}>
            <TableCell className="font-mono">
              {/* The clickable link you requested */}
              <Link
                to={`/procurement/invoices/${invoice._id}`}
                className="hover:text-indigo-300 hover:underline"
              >
                {invoice.supplierInvoiceNumber}
              </Link>
            </TableCell>
            <TableCell>{invoice.supplierId?.name || "N/A"}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {invoice.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(invoice.totalAmount)}
            </TableCell>
            <TableCell className="text-right">
              <Link to={`/procurement/invoices/${invoice._id}`}>
                <Button variant="ghost" size="icon" aria-label="View Invoice">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default InvoiceList;
