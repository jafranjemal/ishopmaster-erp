import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";
import useAuth from "../../context/useAuth";
import { Clock, LogOut } from "lucide-react";

const AttendanceHistoryTable = ({ data }) => {
  const { formatDate } = useAuth();

  const formatTime = (date) => new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "N/A";
    const durationMs = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  if (!data || data.length === 0) {
    return <p className="p-4 text-center text-slate-400">No attendance records found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Check-In</TableHead>
          <TableHead>Check-Out</TableHead>
          <TableHead>Duration</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((att) => (
          <TableRow key={att._id}>
            <TableCell>{formatDate(att.checkInTime)}</TableCell>
            <TableCell className="flex items-center gap-2 text-green-400">
              <Clock size={14} /> {formatTime(att.checkInTime)}
            </TableCell>
            <TableCell className="text-red-400">
              {att.checkOutTime ? (
                <span className="flex items-center gap-2">
                  <LogOut size={14} /> {formatTime(att.checkOutTime)}
                </span>
              ) : (
                "In Progress"
              )}
            </TableCell>
            <TableCell>{calculateDuration(att.checkInTime, att.checkOutTime)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AttendanceHistoryTable;
