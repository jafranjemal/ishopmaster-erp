import React from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";
import useAuth from "../../../context/useAuth";
import { Trash2 } from "lucide-react";

/**
 * A presentational component to display a list of benefits assigned to an employee.
 */
const AssignedBenefitList = ({ assignedBenefits = [], onRemove }) => {
  const { formatCurrency, formatDate } = useAuth();

  if (assignedBenefits.length === 0) {
    return <p className="p-8 text-center text-sm text-slate-400">This employee has no benefits assigned.</p>;
  }

  return (
    <div className="border border-slate-700 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Benefit Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount (per payroll)</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignedBenefits.map((benefit) => (
            <TableRow key={benefit._id}>
              <TableCell className="font-medium">{benefit.benefitTypeId?.name || "N/A"}</TableCell>
              <TableCell className="capitalize text-slate-400">{benefit.benefitTypeId?.type || "N/A"}</TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(benefit.amount)}</TableCell>
              <TableCell>{formatDate(benefit.startDate)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onRemove(benefit._id)} aria-label={`Remove ${benefit.benefitTypeId?.name}`}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AssignedBenefitList;
