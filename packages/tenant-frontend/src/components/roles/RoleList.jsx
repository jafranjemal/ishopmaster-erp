import React from "react";
import { FilePenLine, Trash2, ShieldCheck, Lock } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";

const RoleList = ({ roles, onEdit, onDelete }) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    {role.isSystemRole && (
                      <ShieldCheck className="h-4 w-4 text-sky-400" />
                    )}
                    <span>{role.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-400">
                  {role.description}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {role.permissions.length} Permissions
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(role)}
                  >
                    <FilePenLine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(role)}
                    disabled={!role.isDeletable}
                  >
                    {role.isDeletable ? (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RoleList;
