import React from 'react';
import { Input, TableCell, TableRow } from 'ui-library';
import { NonSerializedDetails } from './NonSerializedDetails';
import { SerializedDetails } from './SerializedDetails';

export const VariantRow = ({ poItem, itemState, onItemChange, onQuantityChange }) => {
  const variant = poItem.productVariantId;
  const variantId = variant._id;
  const isSerialized = itemState.type === 'serialized';

  return (
    <React.Fragment>
      <TableRow className='align-middle'>
        <TableCell className='font-medium'>
          <div className='flex flex-col'>
            <span>{poItem.description}</span>
            <span className='text-xs text-slate-500'>SKU: {variant.sku}</span>
          </div>
        </TableCell>
        <TableCell className='text-center'>{poItem.quantityOrdered}</TableCell>
        <TableCell className='text-center'>{poItem.quantityReceived}</TableCell>
        <TableCell>
          <Input
            type='number'
            placeholder='Enter Qty'
            max={itemState.maxQty}
            min='0'
            className='h-9 w-32'
            value={itemState.quantity || ''}
            onChange={(e) => onQuantityChange(variantId, parseInt(e.target.value, 10))}
          />
        </TableCell>
      </TableRow>

      {itemState.quantity > 0 && (
        <TableRow className='bg-slate-900/50 hover:bg-slate-900/50'>
          <TableCell colSpan={4} className='p-0'>
            {isSerialized ? (
              <SerializedDetails itemState={itemState} onItemChange={onItemChange} />
            ) : (
              <NonSerializedDetails itemState={itemState} onItemChange={onItemChange} />
            )}
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};
