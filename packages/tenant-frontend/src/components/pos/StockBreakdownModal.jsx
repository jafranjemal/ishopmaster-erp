import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Checkbox,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
  Badge,
} from 'ui-library';
import { tenantInventoryService } from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import useAuth from '../../context/useAuth';
import { AlertTriangle, Ban, PackageX } from 'lucide-react';

const StockBreakdownModal = ({ isOpen, onClose, onConfirm, variant, branchId, unavailableSerials }) => {
  const [breakdown, setBreakdown] = useState({ lots: [], items: [] });
  const [selections, setSelections] = useState({});
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatDate } = useAuth();

  const isSerialized = variant.templateId?.type === 'serialized';

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    tenantInventoryService
      .getStockBreakdown(variant._id, branchId)
      .then((res) => setBreakdown(res.data.data))
      .catch(() => toast.error('Failed to load stock details.'))
      .finally(() => setIsLoading(false));

    return () => {
      setSelections({});
      setSelectedSerials([]);
    };
  }, [isOpen, variant._id, branchId]);

  const handleConfirm = () => {
    if (isSerialized) {
      const payload = selectedSerials.map((serial) => ({
        ...variant,
        quantity: 1,
        serialNumber: serial,
        cartId: `${variant._id}-${serial}`,
      }));
      onConfirm(payload);
    } else {
      const payload = Object.entries(selections)
        .filter(([_, qty]) => Number(qty) > 0)
        .map(([lotId, qty]) => {
          const lot = breakdown.lots.find((l) => l._id === lotId);
          return {
            ...variant,
            quantity: Number(qty),
            batchInfo: {
              lotId: lot._id,
              batchNumber: lot.batchNumber,
              cartId: `${variant._id}-${lot._id}`,
            },
          };
        });
      onConfirm(payload);
    }
    onClose();
  };

  const handleSerialToggle = (checked, serial) => {
    setSelectedSerials((prev) => (checked ? [...prev, serial] : prev.filter((s) => s !== serial)));
  };

  const handleLotQtyChange = (lotId, qty, maxQty) => {
    const safeQty = Math.min(Number(qty), maxQty);
    setSelections((prev) => ({
      ...prev,
      [lotId]: safeQty,
    }));
  };

  const handleToggleSerial = (serialNumber) => {
    setSelectedSerials((prev) =>
      prev.includes(serialNumber) ? prev.filter((s) => s !== serialNumber) : [...prev, serialNumber],
    );
  };

  const renderSerializedSection = () => (
    <>
      {breakdown.items.length !== 0 && <Label className='text-base'>Select Serial Numbers</Label>}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
        {breakdown.items.length > 0 ? (
          breakdown.items.map((item) => {
            const isUnavailable = (unavailableSerials && unavailableSerials?.includes(item.serialNumber)) || false;
            const isSelected = selectedSerials.includes(item.serialNumber);

            return (
              <label
                key={item._id}
                className={cn(
                  'flex items-center space-x-3 p-2 rounded',
                  isUnavailable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700 cursor-pointer',
                )}
              >
                <Checkbox
                  id={item._id}
                  checked={isSelected || isUnavailable}
                  disabled={isUnavailable} // Disable if already in cart
                  onCheckedChange={() => !isUnavailable && handleToggleSerial(item.serialNumber)}
                />
                <span className='font-mono'>{item.serialNumber}</span>
                {isUnavailable && <Badge variant='destructive'>In Cart</Badge>}
              </label>
            );
          })
        ) : (
          <>
            <div className='col-span-full flex items-center gap-3 p-3 bg-yellow-100/10 border border-yellow-500 rounded-md text-sm'>
              <Ban className='w-5 h-5 text-yellow-400' />
              <div>
                <p className='text-yellow-300 font-semibold'>Out of Stock</p>

                <p className='text-yellow-200 text-xs'>
                  No serials in current inventory. Check purchase orders or incoming lots.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
      <p className='text-xs text-slate-400 mt-1'>Selected: {selectedSerials.length}</p>
    </>
  );

  const renderLotSection = () => (
    <>
      <Label className='text-base'>Enter Quantity Per Batch</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Batch #</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>UOM</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Stock Age</TableHead>
            <TableHead>Sell Qty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {breakdown.lots.length > 0 ? (
            breakdown.lots.map((lot) => (
              <TableRow key={lot._id}>
                <TableCell>{lot.batchNumber}</TableCell>
                <TableCell>{lot.quantityInStock}</TableCell>
                <TableCell>{variant.unitOfMeasure || variant.templateId?.unitOfMeasure || 'N/A'}</TableCell>
                <TableCell>{lot.costPriceInBaseCurrency}</TableCell>
                <TableCell className='text-xs text-slate-400'>
                  {lot.createdAt
                    ? formatDistanceToNow(new Date(lot.createdAt), {
                        addSuffix: true,
                      })
                    : 'Unknown'}
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    inputMode='numeric'
                    className='w-24 h-8'
                    value={selections[lot._id] || ''}
                    placeholder='0'
                    min='0'
                    max={lot.quantityInStock}
                    onChange={(e) => handleLotQtyChange(lot._id, e.target.value, lot.quantityInStock)}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className='text-center text-slate-400 text-sm'>
                No batch stock available for this item.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <p className='text-xs text-slate-400 mt-1'>
        Total Selected: {Object.values(selections).reduce((acc, qty) => acc + Number(qty || 0), 0)}
      </p>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='2xl'>
      <div className='flex items-center gap-4 p-4 border-b border-slate-700'>
        {variant.templateId?.images?.[0] ? (
          <img
            src={variant.images?.[0]?.url || variant.templateId.images[0].url}
            alt={variant.variantName}
            className='w-16 h-16 object-contain rounded bg-slate-900 border border-slate-700'
          />
        ) : (
          <div className='w-16 h-16 flex items-center justify-center rounded bg-slate-900 border border-slate-700 text-xs text-slate-500'>
            No Image
          </div>
        )}

        <div>
          <h2 className='text-lg font-semibold text-white'>
            Select Stock for <span className='text-indigo-400'>{variant.variantName}</span>
          </h2>
          {variant.sku && <p className='text-sm text-slate-400'>SKU: {variant.sku}</p>}
        </div>
      </div>

      {isLoading ? (
        <p className='p-4 text-sm text-slate-400'>Loading available stock...</p>
      ) : (
        <div className='space-y-6 max-h-[75vh] overflow-y-auto p-4'>
          {isSerialized ? renderSerializedSection() : renderLotSection()}

          <div className='pt-4 flex justify-end space-x-2'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                isSerialized
                  ? selectedSerials.length === 0
                  : Object.values(selections).every((qty) => Number(qty) === 0 || !qty)
              }
            >
              Add Selected to Job
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StockBreakdownModal;
