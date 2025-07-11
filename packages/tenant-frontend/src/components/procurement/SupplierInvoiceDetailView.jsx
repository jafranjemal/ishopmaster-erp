import React, { Fragment, useState } from "react";
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
import { ChevronDown, ChevronRight } from "lucide-react";
const SupplierInvoiceDetailView = ({ invoice }) => {
  const { formatCurrency, formatDate } = useAuth();
  const amountDue = (invoice.totalAmount || 0) - (invoice.amountPaid || 0);
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sortedPayments = [...(invoice.payments || [])].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

  const totals = { cleared: 0, pending: 0, bounced: 0 };
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Invoice #{invoice.supplierInvoiceNumber}</CardTitle>
            <CardDescription>From: {invoice.supplierId.name}</CardDescription>
          </div>

          <Badge
            className="font-bold capitalize text-base px-3 py-1"
            variant={
              invoice.status === "fully_paid"
                ? "success"
                : invoice.status === "partially_paid"
                  ? "warning"
                  : invoice.status === "cancelled"
                    ? "destructive"
                    : "outline"
            }
          >
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
                  <TableCell className="text-right font-mono">{formatCurrency(item.finalCostPrice)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(item.totalCost)}</TableCell>
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
                  <TableHead className="w-4"></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map((p) => {
                  const isExpanded = expanded[p._id];
                  for (const line of p.paymentLines) {
                    const status = line.status || "cleared";
                    if (["cleared", "pending", "bounced"].includes(status)) {
                      totals[status] += line.amount;
                    }
                  }
                  return (
                    <Fragment key={p._id}>
                      {/* Payment group header */}
                      <TableRow className="bg-muted cursor-pointer hover:bg-muted/80" onClick={() => toggle(p._id)}>
                        <TableCell className="text-center align-middle">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </TableCell>
                        <TableCell>{formatDate(p.paymentDate)}</TableCell>
                        <TableCell colSpan={2}>{p.paymentLines.map((l) => l.paymentMethodId?.name).join(", ")}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "completed" ? "success" : p.status === "voided" ? "destructive" : "warning"}>{p.status}</Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${
                            p.status === "completed" ? "text-green-600" : p.status === "voided" ? "text-red-500" : "text-yellow-600"
                          }`}
                        >
                          {formatCurrency(p.totalAmount)}
                        </TableCell>
                      </TableRow>

                      {/* Payment line breakdown */}
                      {isExpanded &&
                        p.paymentLines.map((line, idx) => {
                          const status = line.status || "cleared";

                          return (
                            <TableRow key={`${p._id}-${idx}`}>
                              <TableCell></TableCell>
                              <TableCell colSpan={1}></TableCell>
                              <TableCell>{line.paymentMethodId?.name || "—"}</TableCell>
                              <TableCell>{line.referenceNumber || "—"}</TableCell>
                              <TableCell>
                                <Badge variant={status === "cleared" ? "success" : status === "pending" ? "warning" : "destructive"}>{status}</Badge>
                              </TableCell>
                              <TableCell
                                className={`text-right font-mono ${
                                  status === "cleared" ? "text-green-600" : status === "pending" ? "text-yellow-600" : "text-red-600"
                                }`}
                              >
                                {formatCurrency(line.amount)}
                              </TableCell>
                            </TableRow>
                          );
                        })}

                      {/* Optional: Notes */}
                      {isExpanded && p.notes && (
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell colSpan={5}>
                            <div className="text-xs text-red-500 italic whitespace-pre-line">{p.notes}</div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}

                {/* Summary Totals */}
                <TableRow className="text-right bg-muted font-semibold border-t">
                  <TableCell colSpan={5} className="text-right">
                    Total Cleared
                  </TableCell>
                  <TableCell colSpan={1} className="text-right text-green-600 font-mono">
                    {formatCurrency(totals.cleared)}
                  </TableCell>
                </TableRow>
                <TableRow className="text-right bg-muted font-semibold">
                  <TableCell colSpan={5}>Total Pending</TableCell>
                  <TableCell colSpan={1} className="text-right text-yellow-600 font-mono">
                    {formatCurrency(totals.pending)}
                  </TableCell>
                </TableRow>
                <TableRow className="text-right bg-muted font-semibold">
                  <TableCell colSpan={5}>Total Bounced</TableCell>
                  <TableCell colSpan={1} className="text-right text-red-600 font-mono">
                    {formatCurrency(totals.bounced)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
export default SupplierInvoiceDetailView;
