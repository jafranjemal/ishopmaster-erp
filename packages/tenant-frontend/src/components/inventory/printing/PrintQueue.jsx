import React from "react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";
import { Trash2, Edit } from "lucide-react";
import LotQuantityInput from "./LotQuantityInput";

const PrintQueue = ({ queue, onQuantityChange, onRemoveItem, onEditSerials }) => {
  if (queue.length === 0) {
    return <div className="p-8 text-center text-slate-400">Add items from a GRN or search to build your print queue.</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {queue.map((item) => (
          <TableRow key={item.key}>
            <TableCell>
              <div className="font-medium">{item.variantName}</div>
              <div className="font-mono text-xs text-slate-400">{item.sku}</div>
            </TableCell>
            <TableCell>
              <Badge variant={item.isSerialized ? "default" : "secondary"}>{item.isSerialized ? "Serialized" : "Non-Serialized"}</Badge>
            </TableCell>
            <TableCell className="text-center">
              {item.isSerialized ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold">{item.serials.length}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onEditSerials(item)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <LotQuantityInput
                  productVariantId={item.productVariantId}
                  branchId={item.branchId} // This needs to be passed when item is added to queue
                  value={item.quantity}
                  onChange={(newQty) => onQuantityChange(item.key, newQty)}
                />
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.key)}>
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
