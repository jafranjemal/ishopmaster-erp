import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";
import useAuth from "../../context/useAuth";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const LeaveHistoryTable = ({ data }) => {
  const { formatDate } = useAuth();
  const statusStyles = {
    approved: "bg-green-500/20 text-green-300",
    rejected: "bg-red-500/20 text-red-300",
    pending: "bg-amber-500/20 text-amber-300",
  };
  const statusIcons = {
    approved: <CheckCircle size={14} />,
    rejected: <XCircle size={14} />,
    pending: <AlertTriangle size={14} />,
  };

  if (!data || data.length === 0) {
    return <p className="p-4 text-center text-slate-400">No leave records found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Leave Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((leave) => (
          <TableRow key={leave._id}>
            <TableCell className="capitalize font-medium">{leave.leaveType}</TableCell>
            <TableCell>{formatDate(leave.startDate)}</TableCell>
            <TableCell>{formatDate(leave.endDate)}</TableCell>
            <TableCell className="truncate max-w-xs">{leave.reason}</TableCell>
            <TableCell className="text-center">
              <Badge variant="custom" className={`${statusStyles[leave.status]} inline-flex items-center gap-1.5`}>
                {statusIcons[leave.status]}
                {leave.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LeaveHistoryTable;
