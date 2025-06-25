import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";
import useAuth from "../../context/useAuth";

const SupplierInvoiceDetailView = ({ invoice }) => {
  const { formatCurrency, formatDate } = useAuth();
  const amountDue = (invoice.totalAmount || 0) - (invoice.amountPaid || 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Invoice #{invoice.supplierInvoiceNumber}</CardTitle>
            <CardDescription>From: {invoice.supplierId.name}</CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize text-base px-3 py-1">
            {invoice.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-slate-400">Invoice Date</dt>
            <dd>{formatDate(invoice.invoiceDate)}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Due Date</dt>
            <dd>{invoice.dueDate ? formatDate(invoice.dueDate) : "N/A"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Posted By</dt>
            <dd>{invoice.postedBy?.name || "N/A"}</dd>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Billed Items</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Final Cost</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantityBilled}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(item.finalCostPrice)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(item.totalCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal</span>
              <span>{formatCurrency(invoice.subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Taxes</span>
              <span>{formatCurrency(invoice.taxes)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-slate-700 pt-2">
              <span>Total Amount</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount Paid</span>
              <span>- {formatCurrency(invoice.amountPaid || 0)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-indigo-500 pt-2 text-indigo-300">
              <span>Amount Due</span>
              <span>{formatCurrency(amountDue)}</span>
            </div>
          </div>
        </div>

        {invoice.payments && invoice.payments.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Payment History</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>{formatDate(p.paymentDate)}</TableCell>
                    <TableCell>
                      {p.paymentLines
                        .map((l) => l.paymentMethodId.name)
                        .join(", ")}
                    </TableCell>
                    <TableCell>
                      {p.paymentLines
                        .map((l) => l.referenceNumber)
                        .filter(Boolean)
                        .join(", ")}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(p.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default SupplierInvoiceDetailView;
