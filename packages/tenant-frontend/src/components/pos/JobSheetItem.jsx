import React from "react";
import { Button, Input, TableCell, TableRow } from "ui-library";
import { Trash2, Wrench } from "lucide-react";
import useAuth from "../../context/useAuth";

const JobSheetItem = ({ item, onRemove, onQuantityChange }) => {
  const { formatCurrency } = useAuth();

  const renderItemContent = () => {
    switch (item.lineType) {
      case "trade_in_credit":
        return (
          <>
            <TableCell className="font-medium text-green-400">{item.description}</TableCell>
            <TableCell className="text-center">-</TableCell>
            <TableCell className="text-right font-mono text-green-400">-{formatCurrency(item.finalPrice)}</TableCell>
          </>
        );
      case "repair_service":
        return (
          <>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-indigo-400" />
                <span>{item.description}</span>
              </div>
            </TableCell>
            <TableCell className="text-center">{item.quantity}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(item.finalPrice)}</TableCell>
          </>
        );
      case "sale_item":
      default:
        return (
          <>
            <TableCell className="font-medium">{item.description}</TableCell>
            <TableCell>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => onQuantityChange(item.cartId, e.target.value)}
                className="h-8 w-20 text-center bg-slate-700"
                min="1"
              />
            </TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(item.finalPrice * item.quantity)}</TableCell>
          </>
        );
    }
  };

  return (
    <TableRow key={item.cartId}>
      {renderItemContent()}
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.cartId)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default JobSheetItem;
