import React from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";
import useAuth from "../../context/useAuth";
import { PlusCircle, Trash2 } from "lucide-react";

const JobSheetEditor = ({ items = [], onAddItem, onRemoveItem }) => {
  const { formatCurrency } = useAuth();
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Job Sheet</h3>
        <Button size="sm" onClick={onAddItem}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Part / Service
        </Button>
      </div>
      <div className="border border-slate-700 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400">
                  No items added to job sheet.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {item.itemType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item._id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
export default JobSheetEditor;
