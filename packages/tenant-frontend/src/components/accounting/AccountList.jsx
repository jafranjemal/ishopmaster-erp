import React from "react";
import { FilePenLine, Trash2, Lock } from "lucide-react";
import {
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";

/**
 * A presentational component to display the Chart of Accounts.
 * It receives data and action handlers as props.
 */
const AccountList = ({ accounts, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Sub-Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account._id}>
            <TableCell className="font-medium">{account.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{account.type}</Badge>
            </TableCell>
            <TableCell className="text-slate-400">{account.subType}</TableCell>
            <TableCell className="text-right space-x-2">
              {/* Only allow editing of non-system accounts */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(account)}
                disabled={account.isSystemAccount}
              >
                {account.isSystemAccount ? (
                  <Lock className="h-4 w-4 text-slate-500" />
                ) : (
                  <FilePenLine className="h-4 w-4" />
                )}
              </Button>
              {/* Only allow deleting of non-system accounts */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(account)}
                disabled={account.isSystemAccount}
              >
                {account.isSystemAccount ? (
                  <Lock className="h-4 w-4 text-slate-500" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AccountList;
