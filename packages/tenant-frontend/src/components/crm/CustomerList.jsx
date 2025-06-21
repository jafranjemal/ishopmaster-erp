import React from "react";
import { FilePenLine, Shield, Trash2 } from "lucide-react";
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
import { Link } from "react-router-dom";

const CustomerList = ({ customers, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Customer Name</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {customers.map((customer) => (
        <TableRow key={customer._id}>
          <TableCell className="font-medium">
            {/* 2. Wrap the name in a Link component */}
            <Link
              to={`/crm/customers/${customer._id}`}
              className="hover:text-indigo-300 hover:underline transition-colors"
            >
              {customer.name}
            </Link>
          </TableCell>
          <TableCell>{customer.phone}</TableCell>
          <TableCell className="text-slate-400">
            {customer.email || "N/A"}
          </TableCell>
          <TableCell>
            <Badge variant={customer.isActive ? "success" : "destructive"}>
              {customer.isActive ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
          {customer && customer?.isSystemCreated ? (
            <TableCell className="text-right space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(customer)}
              >
                <Shield className="h-4 w-4" />
              </Button>
            </TableCell>
          ) : (
            <TableCell className="text-right space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(customer)}
              >
                <FilePenLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(customer)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default CustomerList;
