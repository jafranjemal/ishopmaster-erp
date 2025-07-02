import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from "ui-library";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

const PayslipHistoryList = ({ payslips }) => {
  const { formatDate, formatCurrency } = useAuth();
  const navigate = useNavigate();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Payslip ID</TableHead>
          <TableHead>Pay Period</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Net Pay</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payslips.map((p) => (
          <TableRow key={p._id}>
            <TableCell className="font-mono">{p.payslipId}</TableCell>
            <TableCell>
              {formatDate(p.payPeriod.startDate)} - {formatDate(p.payPeriod.endDate)}
            </TableCell>
            <TableCell>
              <Badge variant={p.status === "paid" ? "success" : "warning"} className="capitalize">
                {p.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(p.netPay)}</TableCell>
            <TableCell className="text-right font-mono">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/accounting/payslips/${p._id}`)}>
                <FileText size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default PayslipHistoryList;
