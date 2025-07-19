import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import JobSheetItem from './JobSheetItem';

const JobSheet = ({ items, onRemoveItem, onQuantityChange, onEditItem, taxBreakdown, taxMode }) => {
  return (
    <div className='border border-slate-700 rounded-lg overflow-hidden h-full flex flex-col'>
      <div className='flex-grow overflow-y-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item / Service</TableHead>
              <TableHead className='w-24 text-center'>Qty</TableHead>
              <TableHead className='w-32 text-right'>Price</TableHead>
              <TableHead className='w-12'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className='text-center h-48 text-slate-400'>
                  Use the workspace on the right to add items or start a repair job.
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <JobSheetItem
                taxBreakdown={taxBreakdown}
                taxMode={taxMode}
                key={item.cartId}
                item={item}
                onRemove={onRemoveItem}
                onQuantityChange={onQuantityChange}
                onEdit={onEditItem}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default JobSheet;
