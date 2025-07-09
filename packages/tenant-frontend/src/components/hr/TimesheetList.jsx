import React from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";
import useAuth from "../../context/useAuth";
import { FilePenLine } from "lucide-react";

const TimesheetList = ({ records, onEdit }) => {
  const { formatDate } = useAuth();

  const calculateHours = (start, end) => {
    if (!end) return "Active";
    const duration = new Date(end) - new Date(start);
    const hours = duration / (1000 * 60 * 60);
    return hours.toFixed(2) + " hrs";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Clock In</TableHead>
          <TableHead>Clock Out</TableHead>
          <TableHead className="text-right">Hours Worked</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record._id}>
            <TableCell className="font-medium">{record.employeeId?.name || "N/A"}</TableCell>
            <TableCell>{record.branchId?.name || "N/A"}</TableCell>
            <TableCell>{formatDate(record.checkInTime, { timeStyle: "short" })}</TableCell>
            <TableCell>
              {record.checkOutTime ? formatDate(record.checkOutTime, { timeStyle: "short" }) : <span className="text-green-400">Clocked In</span>}
            </TableCell>
            <TableCell className="text-right font-mono">{calculateHours(record.checkInTime, record.checkOutTime)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
                <FilePenLine className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default TimesheetList;
