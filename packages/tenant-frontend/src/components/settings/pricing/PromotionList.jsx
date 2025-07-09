import React from "react";
import { FilePenLine, Trash2 } from "lucide-react";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "ui-library";
import useAuth from "../../../context/useAuth";

const PromotionList = ({ promotions, onEdit, onDelete }) => {
  const { formatDate } = useAuth();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Promotion Name</TableHead>
          <TableHead>Active Dates</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {promotions.map((promo) => (
          <TableRow key={promo._id}>
            <TableCell className="font-medium">{promo.name}</TableCell>
            <TableCell className="text-sm text-slate-400">
              {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
            </TableCell>
            <TableCell>
              <Badge variant="success">
                {promo.discount.type === "percentage" ? `${promo.discount.value}% OFF` : `Fixed: ${promo.discount.value}`}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(promo)}>
                <FilePenLine className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(promo)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default PromotionList;
