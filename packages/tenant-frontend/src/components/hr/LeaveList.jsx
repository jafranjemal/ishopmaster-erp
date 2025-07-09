import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from "ui-library";
import useAuth from "../../context/useAuth";
import { Check, X } from "lucide-react";

const LeaveList = ({ requests, onApprove, onReject }) => {
  const { formatDate } = useAuth();
  const statusColors = { pending: "warning", approved: "success", rejected: "destructive" };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status / Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-slate-400">
              No leave records found.
            </TableCell>
          </TableRow>
        )}
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
            <TableCell className="text-right">
              {req.status === "pending" && onApprove && onReject ? (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="destructive" onClick={() => onReject(req._id)}>
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button size="sm" variant="success" onClick={() => onApprove(req._id)}>
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                </div>
              ) : (
                <Badge variant={statusColors[req.status] || "default"} className="capitalize">
                  {req.status}
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default LeaveList;
