import React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "ui-library";
import useAuth from "../../context/useAuth";
import { CreditCard } from "lucide-react";

/**
 * A presentational component to display the details and schedule of an installment plan.
 * @param {object} props
 * @param {object} props.paymentPlan - The full payment plan object.
 * @param {Function} props.onPayInstallment - A callback function to trigger when a "Pay Now" button is clicked. It receives the installment line object.
 */
const PaymentPlanDetailView = ({ paymentPlan, onPayInstallment }) => {
  const { formatDate, formatCurrency } = useAuth();

  const statusColors = {
    pending: "warning",
    paid: "success",
    overdue: "destructive",
    cancelled: "secondary",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Installment Plan: {paymentPlan.planId}</CardTitle>
            <CardDescription>
              Total Amount: {formatCurrency(paymentPlan.totalAmount)}
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize text-base px-3 py-1">
            {paymentPlan.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount Due</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentPlan.installments.map((installment, index) => (
              <TableRow key={installment._id}>
                <TableCell className="font-mono text-slate-400">
                  {index + 1}
                </TableCell>
                <TableCell>{formatDate(installment.dueDate)}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusColors[installment.status] || "default"}
                    className="capitalize"
                  >
                    {installment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(installment.amountDue)}
                </TableCell>
                <TableCell className="text-right">
                  {installment.status === "pending" ||
                  installment.status === "overdue" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPayInstallment(installment)}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-500">Paid</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PaymentPlanDetailView;
