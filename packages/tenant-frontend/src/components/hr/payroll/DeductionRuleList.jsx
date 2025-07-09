import React from "react";
import { FilePenLine, Trash2 } from "lucide-react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";

const DeductionRuleList = ({ rules, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rule Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Linked Liability Account</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((rule) => (
          <TableRow key={rule._id}>
            <TableCell className="font-medium">{rule.name}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {rule.type}
              </Badge>
            </TableCell>
            <TableCell>{rule.type === "percentage" ? `${rule.value}%` : `Fixed: ${rule.value}`}</TableCell>
            <TableCell className="text-slate-400">{rule.linkedAccountId?.name || "N/A"}</TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(rule)} aria-label="Edit Rule">
                <FilePenLine className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(rule)} aria-label="Delete Rule">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default DeductionRuleList;
