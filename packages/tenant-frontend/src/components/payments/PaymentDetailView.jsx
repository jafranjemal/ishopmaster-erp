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
import { Link } from "react-router-dom";

const PaymentDetailView = ({ payment }) => {
  const { formatDate, formatCurrency } = useAuth();

  const getSourceDocumentLink = () => {
    if (!payment.sourceDocument || !payment.paymentSourceType) return "N/A";

    switch (payment.paymentSourceType) {
      case "SupplierInvoice":
        return (
          <Link
            to={`/procurement/invoices/${payment.paymentSourceId}`}
            className="text-indigo-400 hover:underline"
          >{`Invoice #${payment.sourceDocument.supplierInvoiceNumber}`}</Link>
        );
      // Add cases for SalesInvoice etc. here in the future
      default:
        return payment.paymentSourceId;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Payment Details: {payment.paymentId}</CardTitle>
            <CardDescription>
              Processed on {formatDate(payment.paymentDate)} by{" "}
              {payment.processedBy?.name || "System"}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize text-base px-3 py-1">
            {payment.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <dt className="text-slate-400 font-semibold">Total Amount</dt>
            <dd className="text-2xl font-bold font-mono">
              {formatCurrency(payment.totalAmount)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400 font-semibold">Direction</dt>
            <dd>
              <Badge
                variant={payment.direction === "inflow" ? "success" : "warning"}
                className="capitalize"
              >
                {payment.direction}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-slate-400 font-semibold">Payment For</dt>
            <dd>{getSourceDocumentLink()}</dd>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Payment Breakdown</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Reference #</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payment.paymentLines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>{line.paymentMethodId.name}</TableCell>
                  <TableCell className="font-mono">
                    {line.referenceNumber || "N/A"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(line.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {payment.notes && (
          <div>
            <h4 className="font-semibold mb-2">Notes</h4>
            <p className="text-sm text-slate-300 bg-slate-800 p-3 rounded-md">
              {payment.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentDetailView;
