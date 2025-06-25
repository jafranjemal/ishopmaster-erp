import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";

const StockLevelsList = ({ stockLevels }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Variant</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead className="text-right">Quantity In Stock</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stockLevels.map((stock, index) => (
          // Using a composite key since _id is grouped out in the aggregation
          <TableRow
            key={`${stock.productVariantId}-${stock.branchId}-${index}`}
          >
            <TableCell className="font-medium">
              <Link
                to={`/inventory/stock-details/${stock.productVariantId}`}
                className="hover:text-indigo-300 hover:underline"
              >
                {stock.variantName}
              </Link>
            </TableCell>
            <TableCell className="font-mono text-slate-400">
              {stock.sku}
            </TableCell>
            <TableCell>{stock.branchName}</TableCell>
            <TableCell className="text-right font-bold text-lg">
              {stock.quantityInStock}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StockLevelsList;
