import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import useAuth from '../../context/useAuth';
import { ArrowUpCircle, ArrowDownCircle, FileText } from 'lucide-react';
import { cn } from 'ui-library';

const StockMovementList = ({ movements, onViewSource }) => {
  const { formatDate } = useAuth();

  const movementDetails = {
    purchase_receive: {
      text: 'Purchase Receipt',
      icon: ArrowUpCircle,
      color: 'text-green-400',
    },
    sale: { text: 'Sale', icon: ArrowDownCircle, color: 'text-red-400' },
    adjustment_in: {
      text: 'Adjustment (In)',
      icon: ArrowUpCircle,
      color: 'text-sky-400',
    },
    adjustment_out: {
      text: 'Adjustment (Out)',
      icon: ArrowDownCircle,
      color: 'text-amber-400',
    },
  };

  const renderSource = (move) => {
    console.log('move', move);
    const hasSource = move.relatedPurchaseId || move.relatedSaleId;
    const details = movementDetails[move.type] || {
      text: move.type,
      icon: FileText,
      color: 'text-slate-400',
    };

    const content = (
      <div className='flex items-center gap-2'>
        {details.icon && <details.icon className={cn('h-4 w-4 flex-shrink-0', details.color)} />}
        <span className='capitalize'>{details.text}</span>
      </div>
    );

    if (hasSource) {
      return (
        <button onClick={() => onViewSource(move)} className='text-left w-full hover:underline'>
          {content}
        </button>
      );
    }
    return content;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Source Document</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead className='text-right'>Quantity</TableHead>
          <TableHead>User</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((move) => (
          <TableRow key={move._id}>
            <TableCell>{formatDate(move.createdAt)}</TableCell>
            <TableCell>{renderSource(move)}</TableCell>
            <TableCell className='font-mono'>
              {move.relatedPurchaseId?.poNumber || move.relatedSaleId?.invoiceId || 'N/A'}
            </TableCell>
            <TableCell>{move.branchId?.name}</TableCell>
            <TableCell
              className={cn(
                'text-right font-mono font-bold',
                move.quantityChange > 0 ? 'text-green-400' : 'text-red-400',
              )}
            >
              {move.quantityChange > 0 ? `+${move.quantityChange}` : move.quantityChange}
            </TableCell>
            <TableCell className='text-slate-400'>{move.userId?.name || 'System'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StockMovementList;
