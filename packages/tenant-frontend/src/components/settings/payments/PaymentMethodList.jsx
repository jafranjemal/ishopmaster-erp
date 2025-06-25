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
  Badge,
} from "ui-library";

const PaymentMethodList = ({ methods, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Linked Account</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {methods.map((method) => (
        <TableRow key={method._id}>
          <TableCell className="font-medium">{method.name}</TableCell>
          <TableCell>
            <Badge variant="secondary" className="capitalize">
              {method.type}
            </Badge>
          </TableCell>
          <TableCell className="text-slate-400">
            {method.linkedAccountId?.name || "N/A"}
          </TableCell>
          <TableCell className="text-right space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(method)}>
              <FilePenLine className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(method)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
export default PaymentMethodList;
