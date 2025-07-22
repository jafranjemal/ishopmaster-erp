import { Info, ScanBarcode, WandSparkles } from 'lucide-react';
import { useCallback } from 'react';
import { Button, Input, Label } from 'ui-library';
import useAuth from '../../context/useAuth';
import { generateSerialNumber, isValidSerial } from './grnUtils';

export const SerializedDetails = ({ itemState, onItemChange }) => {
  const { formatCurrency } = useAuth();
  const variantId = itemState.productVariantId;

  const handleSerialChange = (index, field, value) => {
    const updatedSerials = [...itemState.serials];
    updatedSerials[index] = { ...updatedSerials[index], [field]: value };
    onItemChange(variantId, 'serials', updatedSerials);
  };

  const handleGenerateAll = useCallback(
    (e) => {
      e.preventDefault();

      const newSerials = itemState.serials.map((serial, i) => ({
        ...serial,
        number: generateSerialNumber(i),
        sellingPrice: serial.sellingPrice || itemState.defaultSellingPrice,
      }));
      onItemChange(variantId, 'serials', newSerials);
    },
    [variantId, itemState.serials, itemState.defaultSellingPrice, onItemChange],
  );

  return (
    <div className='p-4 space-y-4'>
      <div className='flex justify-between items-center bg-slate-800/50 p-3 rounded-md'>
        <Label className='font-semibold'>Enter Serial Numbers & Selling Prices</Label>
        <Button type='button' variant='outline' size='sm' onClick={handleGenerateAll}>
          <WandSparkles className='mr-2 h-4 w-4' />
          Generate All Serials
        </Button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
        {itemState.serials.map((serial, i) => {
          const isSerialValid = isValidSerial(serial.number);
          return (
            <div key={i} className='flex items-start gap-3'>
              <span className='text-sm font-mono text-slate-400 pt-2 w-8 text-right'>{i + 1}.</span>
              <div className='flex-grow space-y-1'>
                <Input
                  placeholder='Enter Serial Number...'
                  value={serial.number}
                  onChange={(e) => handleSerialChange(i, 'number', e.target.value.toUpperCase())}
                  className={`h-9 ${!isSerialValid && serial.number ? 'border-red-500' : ''}`}
                  suffixIcon={<ScanBarcode size={16} />}
                  onSuffixClick={() => handleSerialChange(i, 'number', generateSerialNumber(i))}
                />
              </div>
              <div className='flex-grow space-y-1'>
                <Input
                  type='number'
                  placeholder='Override Price'
                  value={serial.sellingPrice}
                  onChange={(e) => handleSerialChange(i, 'sellingPrice', e.target.value)}
                  className='h-9'
                  prefix={formatCurrency(0).charAt(0)} // e.g., '$'
                />
                <div className='text-xs text-slate-500 pl-1 flex items-center gap-1'>
                  <Info size={12} />
                  <span>Default: {formatCurrency(itemState.defaultSellingPrice)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
