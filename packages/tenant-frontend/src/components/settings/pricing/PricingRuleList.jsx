import React from "react";
import { FilePenLine, Trash2 } from "lucide-react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";

const PricingRuleList = ({ rules, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rule Name</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((rule) => (
          <TableRow key={rule._id}>
            <TableCell className="font-medium">{rule.name}</TableCell>
            <TableCell className="text-sm text-slate-400">
              {rule.customerGroupId
                ? `Group: ${rule.customerGroupId.name}`
                : rule.productCategoryId
                  ? `Category: ${rule.productCategoryId.name}`
                  : "All Customers/Products"}
            </TableCell>
            <TableCell>
              <Badge variant="success">{rule.discount.type === "percentage" ? `${rule.discount.value}% OFF` : `Fixed: ${rule.discount.value}`}</Badge>
            </TableCell>
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
export default PricingRuleList;
