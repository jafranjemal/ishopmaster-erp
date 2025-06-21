import React from "react";
import { FilePenLine, Trash2 } from "lucide-react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";
import { Link } from "react-router-dom";

const SupplierList = ({ suppliers, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Supplier Name</TableHead>
        <TableHead>Contact Person</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {suppliers.map((supplier) => (
        <TableRow key={supplier._id}>
          <TableCell className="font-medium">
            <Link
              to={`/procurement/suppliers/${supplier._id}`}
              className="hover:text-indigo-300 hover:underline hover:uppercase"
            >
              {supplier.name}
            </Link>
          </TableCell>
          <TableCell className="text-slate-400">
            {supplier.contactPerson || "N/A"}
          </TableCell>
          <TableCell>{supplier.phone}</TableCell>
          <TableCell className="text-right space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(supplier)}
            >
              <FilePenLine className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(supplier)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default SupplierList;
