import React, { useState } from 'react';
import { Button, cn, Input, TableCell, TableRow } from 'ui-library';
import { ChevronDown, ChevronRight, Trash2, Wrench } from 'lucide-react';
import useAuth from '../../context/useAuth';

const JobSheetItem = ({ item, onRemove, onQuantityChange, onEdit }) => {
  const { formatCurrency } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false); // State for bundle expansion

  const renderItemContent = () => {
    switch (item.lineType) {
      case 'bundle':
        return (
          <>
            <TableCell className='font-medium'>
              <div className='flex items-center gap-2'>
                <Package className='h-4 w-4 text-amber-400' />
                <span>{item.description}</span>
              </div>
            </TableCell>
            <TableCell className='text-center'>{item.quantity}</TableCell>
            <TableCell className='text-right font-mono'>{formatCurrency(item.finalPrice * item.quantity)}</TableCell>
          </>
        );

      case 'trade_in_credit':
        return (
          <>
            <TableCell className='font-medium text-green-400'>{item.description}</TableCell>
            <TableCell className='text-center'>-</TableCell>
            <TableCell className='text-right font-mono text-green-400'>-{formatCurrency(item.finalPrice)}</TableCell>
          </>
        );
      case 'repair_service':
        return (
          <>
            <TableCell className='font-medium'>
              <div className='flex items-center gap-2'>
                <Wrench className='h-4 w-4 text-indigo-400' />
                <span>{item.description}</span>
              </div>
            </TableCell>
            <TableCell className='text-center'>{item.quantity}</TableCell>
            <TableCell className='text-right font-mono'>{formatCurrency(item.finalPrice)}</TableCell>
          </>
        );
      case 'sale_item':
      default:
        return (
          <>
            <TableCell className='font-medium'>
              {item.description}

              {(item.serialNumber || item.batchInfo) && (
                <p className='text-xs text-slate-400 font-mono'>
                  {item.serialNumber ? `SN: ${item.serialNumber}` : `Batch: ${item.batchInfo.batchNumber}`}
                </p>
              )}
            </TableCell>
            <TableCell>
              <Input
                type='number'
                value={item.quantity}
                onChange={(e) => onQuantityChange(item.cartId, e.target.value)}
                className='h-8 w-20 text-center bg-slate-700'
                min='1'
              />
            </TableCell>
            <TableCell className='text-right font-mono'>{formatCurrency(item.finalPrice * item.quantity)}</TableCell>
          </>
        );
    }
  };

  return (
    <>
      <TableRow
        key={item.cartId}
        onClick={() => onEdit(item)}
        className={cn('cursor-pointer hover:bg-slate-700/50', isExpanded && 'bg-slate-700/50')}
      >
        {renderItemContent()}
        <TableCell className='text-right'>
          {item.lineType === 'bundle' && (
            <Button
              variant='ghost'
              size='icon'
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
            </Button>
          )}

          <Button variant='ghost' size='icon' onClick={() => onRemove(item.cartId)}>
            <Trash2 className='h-4 w-4 text-red-500' />
          </Button>
        </TableCell>
      </TableRow>
      {/* --- NEW EXPANDABLE ROW FOR BUNDLE ITEMS --- */}
      {isExpanded &&
        item.bundleItems?.map((bundleComponent) => (
          <TableRow key={bundleComponent.productVariantId} className='bg-slate-900/50'>
            <TableCell className='pl-12 text-xs text-slate-400'>
              ↳ {bundleComponent.productVariantId.variantName}
            </TableCell>
            <TableCell className='text-center text-xs text-slate-400'>{bundleComponent.quantity}</TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        ))}
    </>
  );
};

export default JobSheetItem;
