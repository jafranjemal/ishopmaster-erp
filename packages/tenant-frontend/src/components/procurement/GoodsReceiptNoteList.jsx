import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "ui-library";
import useAuth from "../../context/useAuth";

const GoodsReceiptNoteList = ({ grns }) => {
  const { formatDate } = useAuth();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>GRN #</TableHead>
          <TableHead>PO #</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Received Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {grns.map((grn) => (
          <TableRow key={grn._id}>
            <TableCell className="font-mono">
              <Link
                to={`/procurement/receipts/${grn._id}`}
                className="hover:text-indigo-300 hover:underline"
              >
                {grn.grnNumber}
              </Link>
            </TableCell>
            <TableCell className="font-mono hover:text-indigo-300 hover:underline">
              <Link to={`/procurement/po/${grn.purchaseOrderId._id}`}>
                {grn.purchaseOrderId.poNumber}
              </Link>
            </TableCell>
            <TableCell>{grn.supplierId.name}</TableCell>
            <TableCell>{formatDate(grn.receivedDate)}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {grn.status.replace("_", " ")}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default GoodsReceiptNoteList;
