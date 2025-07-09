import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";
import useAuth from "../../context/useAuth";

const LeaveHistoryList = ({ leaveRecords }) => {
  const { formatDate } = useAuth();
  const statusColors = { pending: "warning", approved: "success", rejected: "destructive" };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Request History</h3>
      <div className="border border-slate-700 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-400">
                  No leave history found.
                </TableCell>
              </TableRow>
            )}
            {leaveRecords.map((record) => (
              <TableRow key={record._id}>
                <TableCell className="capitalize">{record.leaveType}</TableCell>
                <TableCell>
                  {formatDate(record.startDate)} - {formatDate(record.endDate)}
                </TableCell>
                <TableCell className="text-sm text-slate-400 max-w-xs truncate" title={record.reason}>
                  {record.reason}
                </TableCell>
                <TableCell>
                  <Badge variant={statusColors[record.status] || "default"} className="capitalize">
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
export default LeaveHistoryList;
