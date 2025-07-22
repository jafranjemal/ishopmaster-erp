import { Info } from 'lucide-react';
import { Input, Label } from 'ui-library';
import useAuth from '../../context/useAuth';

export const NonSerializedDetails = ({ itemState, onItemChange }) => {
  const { formatCurrency } = useAuth();
  const variantId = itemState.productVariantId;

  return (
    <div className='p-4 flex items-start gap-4'>
      <div className='w-1/2 space-y-1'>
        <Label htmlFor={`price-${variantId}`}>Override Selling Price (Optional)</Label>
        <Input
          id={`price-${variantId}`}
          type='number'
          placeholder={`e.g., ${itemState.defaultSellingPrice}`}
          value={itemState.overridePrice || ''}
          onChange={(e) => onItemChange(variantId, 'overridePrice', e.target.value)}
          className='h-9'
          prefix={formatCurrency(0).charAt(0)}
        />
        <div className='text-xs text-slate-500 pl-1 flex items-center gap-1'>
          <Info size={12} />
          <span>Last Selling Price: {formatCurrency(itemState.defaultSellingPrice)}</span>
        </div>
      </div>
    </div>
  );
};
