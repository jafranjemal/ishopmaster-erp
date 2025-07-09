import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from "ui-library";
import useAuth from "../../context/useAuth";
import { Check, X } from "lucide-react";

const LeaveApprovalList = ({ requests, onApprove, onReject }) => {
  const { formatDate } = useAuth();

  if (requests.length === 0) {
    return <div className="p-8 text-center text-slate-400">No pending leave requests.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((req) => (
          <TableRow key={req._id}>
            <TableCell className="font-medium">{req.employeeId?.name || "N/A"}</TableCell>
            <TableCell className="capitalize">{req.leaveType}</TableCell>
            <TableCell>
              {formatDate(req.startDate)} - {formatDate(req.endDate)}
            </TableCell>
            <TableCell className="text-sm text-slate-400 max-w-xs truncate" title={req.reason}>
              {req.reason}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button size="sm" variant="destructive" onClick={() => onReject(req._id)}>
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button size="sm" variant="success" onClick={() => onApprove(req._id)}>
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default LeaveApprovalList;
