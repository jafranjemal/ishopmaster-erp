import React from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from "ui-library";
import { Eye, Edit, Trash2 } from "lucide-react";

/**
 * @desc A reusable component to display a list of employees in a table.
 * It receives employee data and handler functions as props.
 * @param {Array} employees - The list of employee objects to display.
 * @param {Function} onEdit - Function to call when the edit button is clicked.
 * @param {Function} onDelete - Function to call when the delete button is clicked.
 * @param {Function} onView - Function to call when the view button is clicked.
 */
const EmployeeList = ({ employees, onEdit, onDelete, onView }) => {
  if (!employees || employees.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No employees found.</p>
        <p className="text-sm mt-1">Click "New Employee" to add your first staff member.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Linked User</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee._id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span className="text-white">{employee.name}</span>
                <span className="text-xs text-slate-400 font-mono">{employee.employeeId}</span>
              </div>
            </TableCell>
            <TableCell>{employee.designation}</TableCell>
            <TableCell>{employee.branchId?.name || "N/A"}</TableCell>
            <TableCell>{employee.userId?.email || <span className="text-slate-500 italic">None</span>}</TableCell>
            <TableCell className="text-center">
              <Badge variant={employee.isActive ? "success" : "destructive"}>{employee.isActive ? "Active" : "Inactive"}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onView(employee._id)} title="View Details">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(employee)} title="Edit">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400" onClick={() => onDelete(employee)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default EmployeeList;
