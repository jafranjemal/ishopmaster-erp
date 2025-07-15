import React from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Checkbox } from 'ui-library';

const SelectReturnItems = ({ invoice, selectedItems, onSelectionChange, onQuantityChange }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-12'></TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Qty on Invoice</TableHead>
          <TableHead>Return Qty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoice.items.map((item) => (
          <TableRow key={item.productVariantId}>
            <TableCell>
              <Checkbox
                checked={selectedItems.some((s) => s.productVariantId === item.productVariantId)}
                onCheckedChange={() => onSelectionChange(item)}
              />
            </TableCell>
            <TableCell>{item.description}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>
              <Input
                type='number'
                min='1'
                max={item.quantity}
                defaultValue='1'
                disabled={!selectedItems.some((s) => s.productVariantId === item.productVariantId)}
                onChange={(e) => onQuantityChange(item.productVariantId, e.target.value)}
                className='w-20 h-8'
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default SelectReturnItems;
