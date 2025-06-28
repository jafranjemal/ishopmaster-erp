import React from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
} from "ui-library";
import { Trash2 } from "lucide-react";

const PrintQueue = ({ queue, onQuantityChange, onRemoveItem }) => {
  if (queue.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        Add items from a GRN or search to build your print queue.
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {queue.map((item, index) => (
          <TableRow key={item.key}>
            <TableCell>
              {item.variantName}
              <br />
              <span className="font-mono text-xs text-slate-400">
                {item.sku}
              </span>
            </TableCell>
            <TableCell className="text-xs text-slate-400">
              {item.serials?.join(", ") || `Batch: ${item.batchNumber}`}
            </TableCell>
            <TableCell className="text-right">
              {item.isSerialized ? (
                item.quantity
              ) : (
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onQuantityChange(item.key, e.target.value)}
                  className="w-20 h-8 text-right"
                />
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveItem(item.key)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default PrintQueue;
