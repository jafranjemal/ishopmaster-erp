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
import useAuth from "../../../context/useAuth";
import { Eye } from "lucide-react";

const TransferList = ({ transfers }) => {
  const { formatDate } = useAuth();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transfer ID</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transfers.map((t) => (
          <TableRow key={t._id}>
            <TableCell className="font-mono">{t.transferId}</TableCell>
            <TableCell>{t.fromBranchId?.name || "N/A"}</TableCell>
            <TableCell>{t.toBranchId?.name || "N/A"}</TableCell>
            <TableCell>{formatDate(t.createdAt)}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {t.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Link to={`/inventory/transfers/${t._id}`}>
                <Button variant="ghost" size="icon" aria-label="View Transfer">
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
export default TransferList;
