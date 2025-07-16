import React from 'react';
import { Button } from 'ui-library';
import useAuth from '../../context/useAuth';
import { CreditCard, LoaderCircle } from 'lucide-react';
import { cn } from 'ui-library/lib/utils';

const TotalsPanel = ({ cart, isLoading, onPay, additionalCharges }) => {
  const { formatCurrency } = useAuth();

  const safeCart = cart || {
    subTotal: 0,
    totalLineDiscount: 0,
    totalGlobalDiscount: 0,
    totalCharges: 0,
    taxBreakdown: [],
    grandTotal: 0,
    items: [],
  };

  const totalDiscount = safeCart.totalLineDiscount + safeCart.totalGlobalDiscount;
  console.log('safecart ', safeCart);
  console.log('car ', cart);
  return (
    <div className='bg-slate-900/50 rounded-lg p-4 space-y-2'>
      {/* --- DEFINITIVE FIX: FULL FINANCIAL BREAKDOWN --- */}
      <div className='flex justify-between text-slate-300 text-sm'>
        <p>Subtotal</p>
        <p className='font-mono'>{formatCurrency(safeCart.subTotal)}</p>
      </div>

      {totalDiscount > 0 && (
        <div className='flex justify-between text-slate-300 text-sm'>
          <p>Discounts</p>
          <p className='font-mono text-green-400'>-{formatCurrency(totalDiscount)}</p>
        </div>
      )}

      {additionalCharges?.map((charge, index) => (
        <div key={index} className='flex justify-between text-slate-300 text-sm'>
          <p>{charge.description}</p>
          <p className='font-mono'>+{formatCurrency(charge.amount)}</p>
        </div>
      ))}

      {safeCart.taxBreakdown.map((tax, index) => (
        <div key={index} className='flex justify-between text-slate-300 text-sm'>
          <p>{tax.ruleName}</p>
          <p className='font-mono'>+{formatCurrency(tax.amount)}</p>
        </div>
      ))}
      {/* --- END OF FIX --- */}

      <div className='flex justify-between items-center text-white font-bold text-3xl border-t border-slate-700 pt-3 mt-3'>
        <p>Total</p>
        {isLoading ? (
          <LoaderCircle className='h-7 w-7 animate-spin text-indigo-400' />
        ) : (
          <p className='font-mono'>{formatCurrency(safeCart.grandTotal)}</p>
        )}
      </div>

      <Button
        onClick={onPay}
        size='lg'
        className='w-full h-16 text-lg mt-2'
        disabled={safeCart.items.length === 0 || isLoading}
      >
        <CreditCard className='h-6 w-6 mr-3' />
        Pay
      </Button>
    </div>
  );
};

export default TotalsPanel;
