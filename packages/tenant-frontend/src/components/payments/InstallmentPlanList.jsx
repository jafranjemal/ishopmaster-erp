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

const InstallmentPlanList = ({ plans }) => {
  const { formatCurrency, formatDate } = useAuth();

  if (plans.length === 0) {
    return (
      <p className="text-center p-4 text-slate-400">
        This customer has no active installment plans.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plan ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created Date</TableHead>
          <TableHead className="text-right">Total Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan._id}>
            <TableCell className="font-mono">{plan.planId}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {plan.status}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(plan.createdAt)}</TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(plan.totalAmount)}
            </TableCell>
            <TableCell className="text-right">
              <Link to={`/accounting/installments/${plan._id}`}>
                <Button variant="ghost" size="icon" aria-label="View Plan">
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
export default InstallmentPlanList;
