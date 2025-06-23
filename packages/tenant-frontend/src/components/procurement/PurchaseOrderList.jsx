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
import { Eye } from "lucide-react";
import useAuth from "../../context/useAuth";

const PurchaseOrderList = ({ purchaseOrders }) => {
  const { formatCurrency } = useAuth();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>PO #</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchaseOrders.map((po) => (
          <TableRow key={po._id}>
            <TableCell className="font-mono">
              {/* 2. Wrap the PO Number in a Link component */}
              <Link
                to={`/procurement/po/${po._id}`}
                className="hover:text-indigo-300 hover:underline"
              >
                {po.poNumber}
              </Link>
            </TableCell>
            <TableCell>{po.supplierId?.name || "N/A"}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {po.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>{new Date(po.orderDate).toLocaleDateString()}</TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(po.totalAmount)}
            </TableCell>
            <TableCell className="text-right">
              <Link to={`/procurement/po/${po._id}`}>
                <Button variant="ghost" size="icon" aria-label="View PO">
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
export default PurchaseOrderList;
