import React from "react";
import { FilePenLine, PowerOff, Power, KeyRound, Trash2 } from "lucide-react";
import { Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";
import useAuth from "../../context/useAuth";

const UserList = ({ users, onEdit, onDeactivate, onResetPassword }) => {
  const { user } = useAuth();
  const canResetPassword = user?.permissions?.includes("hr:employee:manage_credentials");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Assigned Branch</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell className="font-medium">
              <div>{user.name}</div>
              <div className="text-xs text-slate-400">{user.email}</div>
            </TableCell>
            <TableCell>{user.role?.name || "N/A"}</TableCell>
            <TableCell>{user.assignedBranchId?.name || "N/A"}</TableCell>
            <TableCell>
              <Badge variant={user.isActive ? "success" : "destructive"}>{user.isActive ? "Active" : "Inactive"}</Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              {canResetPassword && (
                <Button variant="ghost" size="icon" onClick={() => onResetPassword(user)} aria-label="Reset Password">
                  <KeyRound className="h-4 w-4 text-amber-400" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                <FilePenLine className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDeactivate(user)}>
                {user.isActive ? <PowerOff className="h-4 w-4 text-red-500" /> : <Power className="h-4 w-4 text-green-500" />}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserList;
