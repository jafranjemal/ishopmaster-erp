import dayjs from 'dayjs';
import {
  Barcode,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Package,
  PackageCheck,
  Repeat,
  ShieldCheck,
  Tag,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { Button, cn, Input, TableCell, TableRow } from 'ui-library';
import useAuth from '../../context/useAuth';

const JobSheetItem = ({ item, onRemove, onQuantityChange, onEdit, taxMode }) => {
  const { formatCurrency } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const isExchangeItem = item.isExchangeItem;
  const displayQuantity = Math.abs(item.quantity);
  const displayPrice = Math.abs(item.finalPrice);
  const displayTotal = displayQuantity * displayPrice;
  const quantity = item.quantity || 0;
  const unitPrice = item.unitPrice || 0;
  const lineDiscount = item.lineDiscount || null;
  const taxBreakdown = item.taxBreakdown || [];

  const totalRate = taxBreakdown.reduce((sum, t) => sum + (t.rate || 0), 0);

  // Step 1: Pre-discount price
  const lineTotal = unitPrice * quantity;

  // Step 2: Apply discount
  const discountAmount =
    lineDiscount && lineDiscount.type === 'percentage'
      ? lineTotal * (lineDiscount.value / 100)
      : lineDiscount
        ? lineDiscount.value * quantity
        : 0;

  const discountedTotal = lineTotal - discountAmount;

  // Step 3: Base & Tax Calculation
  let basePrice = 0;
  let totalTax = 0;
  let taxDetails = [];

  if (taxMode === 'inclusive') {
    basePrice = discountedTotal / (1 + totalRate / 100);
    taxDetails = taxBreakdown.map((tax) => {
      const amount = basePrice * (tax.rate / 100);
      totalTax += amount;
      return { ...tax, amount };
    });
  } else {
    basePrice = discountedTotal;
    taxDetails = taxBreakdown.map((tax) => {
      const amount = basePrice * (tax.rate / 100);
      totalTax += amount;
      return { ...tax, amount };
    });
  }

  const finalTotal = basePrice + totalTax;

  const basePriceDisplay =
    taxMode === 'inclusive' && taxBreakdown.length > 0 ? `(Base: ${formatCurrency(basePrice)})` : null;

  const renderTaxInfo = () =>
    taxDetails.length > 0 && (
      <div className='text-xs text-yellow-400 mt-1 space-y-0.5'>
        {taxDetails.map((tax, idx) => (
          <div key={idx} className='flex gap-2 items-center font-mono'>
            <span className='font-semibold'>({tax.ruleName || tax.name})</span>
            <span>{tax.rate}%</span>
            <span>– LKR {tax.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );

  const renderWarrantyInfo = () => {
    if (!item.warrantyInfo) return null;

    const { name, duration, durationUnit, startsFrom } = item.warrantyInfo;
    const startDate = dayjs(item.createdAt);
    const endDate =
      startsFrom === 'purchase'
        ? startDate.add(duration, durationUnit)
        : startsFrom === 'installation'
          ? item.installationDate
            ? dayjs(item.installationDate).add(duration, durationUnit)
            : null
          : null;

    return (
      <div className='mt-2 border-t border-slate-700 pt-2'>
        <div className='flex items-center gap-2 text-indigo-300'>
          <ShieldCheck className='h-4 w-4 flex-shrink-0' />
          <div className='flex-1'>
            <div className='font-medium'>{name}</div>
            <div className='text-xs flex items-center gap-2 mt-1'>
              <span className='bg-indigo-900/50 px-1.5 py-0.5 rounded'>
                {duration} {durationUnit}
              </span>
              <span className='flex items-center gap-1'>
                <CalendarCheck className='h-3 w-3' />
                {startsFrom === 'purchase' ? 'From purchase' : 'From installation'}
              </span>
              {endDate && (
                <span className='flex items-center gap-1'>
                  <CalendarClock className='h-3 w-3' />
                  Expires: {endDate.format('MMM D, YYYY')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBatchInfo = () => {
    if (!item.batchInfo) return null;

    const { batchNumber, expirationDate, manufacturingDate } = item.batchInfo;

    return (
      <div className='mt-2 border-t border-slate-700 pt-2'>
        <div className='flex items-center gap-2 text-amber-300'>
          <PackageCheck className='h-4 w-4 flex-shrink-0' />
          <div className='flex-1'>
            <div className='font-medium'>Batch #{batchNumber}</div>
            <div className='text-xs flex items-center gap-3 mt-1'>
              {manufacturingDate && (
                <span className='flex items-center gap-1'>
                  <CalendarCheck className='h-3 w-3' />
                  Mfg: {dayjs(manufacturingDate).format('MMM YYYY')}
                </span>
              )}
              {expirationDate && (
                <span className='flex items-center gap-1'>
                  <CalendarClock className='h-3 w-3' />
                  Exp: {dayjs(expirationDate).format('MMM YYYY')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSerialInfo = () => {
    if (!item.serialNumber) return null;

    return (
      <div className='mt-2 border-t border-slate-700 pt-2'>
        <div className='flex items-center gap-2 text-green-300'>
          <Barcode className='h-4 w-4 flex-shrink-0' />
          <div>
            <div className='font-medium'>Serial Number</div>
            <div className='font-mono text-sm mt-1'>{item.serialNumber}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderSaleItem = () => (
    <>
      <TableCell className='font-medium'>
        <div className='flex items-center gap-2'>
          {lineDiscount && <Tag className='h-3 w-3 text-green-400 flex-shrink-0' title='Discount applied' />}
          {isExchangeItem && <Repeat className='h-4 w-4 text-red-400' title='Exchange Item Credit' />}
          <span>{item.description}</span>
        </div>

        <div className='mt-2'>
          {renderTaxInfo()}

          {/* Serial/Batch Metadata */}
          {(item.serialNumber || item.batchInfo) && (
            <div className='flex gap-3 mt-2 flex-wrap'>
              {item.serialNumber && (
                <div className='text-xs bg-green-900/30 px-2 py-0.5 rounded flex items-center gap-1'>
                  <Barcode className='h-3 w-3' />
                  <span>SN: {item.serialNumber}</span>
                </div>
              )}
              {item.batchInfo && (
                <div className='text-xs bg-amber-900/30 px-2 py-0.5 rounded flex items-center gap-1'>
                  <PackageCheck className='h-3 w-3' />
                  <span>Batch: {item.batchInfo.batchNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Expanded warranty/batch/serial details */}
          {isExpanded && (
            <div className='mt-2'>
              {renderWarrantyInfo()}
              {renderBatchInfo()}
              {renderSerialInfo()}
            </div>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Input
          type='number'
          value={quantity}
          onChange={(e) => onQuantityChange(item.cartId, e.target.value)}
          className='h-8 w-20 text-center bg-slate-700'
          min='1'
        />
        {isExchangeItem ? (
          displayQuantity
        ) : (
          <Input
            type='number'
            value={displayQuantity}
            onChange={(e) => onQuantityChange(item.cartId, e.target.value)}
          />
        )}
      </TableCell>

      <TableCell className='text-right font-mono'>
        {discountAmount > 0 && (
          <span className='text-xs text-slate-500 line-through mr-2'>
            {formatCurrency(lineTotal + (taxMode === 'exclusive' ? totalTax : 0))}
          </span>
        )}
        <span className='font-semibold'>{formatCurrency(finalTotal)}</span>
        {basePriceDisplay && <p className='text-xs text-slate-500'>{basePriceDisplay}</p>}
      </TableCell>
    </>
  );

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

              {isExpanded && item.warrantyInfo && <div className='mt-2'>{renderWarrantyInfo()}</div>}
            </TableCell>
            <TableCell className='text-center'>{quantity}</TableCell>
            <TableCell className='text-right font-mono'>{formatCurrency(item.finalPrice * quantity)}</TableCell>
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

              {item.warrantyInfo && <div className='mt-2'>{renderWarrantyInfo()}</div>}
            </TableCell>
            <TableCell className='text-center'>{quantity}</TableCell>
            <TableCell className='text-right font-mono'>{formatCurrency(item.finalPrice)}</TableCell>
          </>
        );

      case 'sale_item':
      default:
        return renderSaleItem();
    }
  };

  const showExpandButton = item.lineType === 'sale_item' && (item.warrantyInfo || item.batchInfo || item.serialNumber);

  return (
    <>
      <TableRow
        key={item.cartId}
        onClick={() => onEdit(item)}
        className={cn('cursor-pointer hover:bg-slate-700/50', isExpanded && 'bg-slate-700/50')}
      >
        {renderItemContent()}

        <TableCell className='text-right'>
          {showExpandButton && (
            <Button
              variant='ghost'
              size='icon'
              className='mr-1'
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
            </Button>
          )}

          {item.lineType === 'bundle' && (
            <Button
              variant='ghost'
              size='icon'
              className='mr-1'
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

      {isExpanded &&
        item.lineType === 'bundle' &&
        item.bundleItems?.map((bundleComponent) => (
          <TableRow key={bundleComponent.productVariantId} className='bg-slate-900/50'>
            <TableCell className='pl-12'>
              <div className='flex items-center gap-2'>
                <ChevronRight className='h-3 w-3 text-slate-500' />
                <span className='text-sm'>{bundleComponent.productVariantId.variantName}</span>

                {bundleComponent.serialNumber && (
                  <span className='text-xs text-slate-400 ml-2'>SN: {bundleComponent.serialNumber}</span>
                )}
              </div>
            </TableCell>
            <TableCell className='text-center text-sm text-slate-400'>{bundleComponent.quantity}</TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        ))}
    </>
  );
};

export default JobSheetItem;
