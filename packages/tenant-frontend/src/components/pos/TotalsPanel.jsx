import React from 'react';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from 'ui-library';
import useAuth from '../../context/useAuth';
import { Banknote, CreditCard, LoaderCircle, X } from 'lucide-react';
import { cn } from 'ui-library/lib/utils';

const TotalsPanel = ({
  cart,
  isLoading,
  onPay,
  additionalCharges,
  onRemoveGlobalDiscount,
  onRemoveCharge,
  onFinalizeOnCredit,
  canSellOnCredit,
  creditSummary,
}) => {
  const { formatCurrency } = useAuth();

  const safeCart = cart || {
    subTotal: 0,
    totalLineDiscount: 0,
    totalGlobalDiscount: 0,
    totalCharges: 0,
    taxBreakdown: [],
    grandTotal: 0,
    items: [],
    additionalCharges: [],
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
        <>
          {safeCart?.totalLineDiscount > 0 && (
            <div className='flex justify-between items-center text-slate-300 text-sm'>
              <span className='flex items-center gap-2'>Item Discount </span>
              <span className='flex items-center gap-1 font-mono text-green-400'>
                -{formatCurrency(safeCart?.totalLineDiscount)}
                <Button variant='ghost' size='icon' className='h-6 w-6 text-red-500' onClick={onRemoveGlobalDiscount}>
                  <X className='h-4 w-4' />
                </Button>
              </span>
            </div>
          )}

          {safeCart.globalDiscount && (
            <div className='flex justify-between items-center text-slate-300 text-sm'>
              <span className='flex items-center gap-2'>
                Global Discount{' '}
                {safeCart.globalDiscount && (
                  <span className='text-xs text-slate-500'>({safeCart.globalDiscount?.reason})</span>
                )}
              </span>
              <span className='flex items-center gap-1 font-mono text-green-400'>
                -{formatCurrency(totalDiscount)}
                <Button variant='ghost' size='icon' className='h-6 w-6 text-red-500' onClick={onRemoveGlobalDiscount}>
                  <X className='h-4 w-4' />
                </Button>
              </span>
            </div>
          )}
        </>
      )}
      {additionalCharges.map((charge, index) => (
        <div key={index} className='flex justify-between items-center text-slate-300 text-sm'>
          <span>{charge.description}</span>
          <span className='flex items-center gap-1 font-mono'>
            +{formatCurrency(charge.amount)}
            <Button variant='ghost' size='icon' className='h-6 w-6 text-red-500' onClick={() => onRemoveCharge(index)}>
              <X className='h-4 w-4' />
            </Button>
          </span>
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

      <div className='flex gap-2 mt-2'>
        {/* --- THE DEFINITIVE FIX: DUAL WORKFLOW BUTTONS --- */}
        <FinalizeCreditButton
          onFinalize={onFinalizeOnCredit}
          isLoading={isLoading}
          cart={cart}
          creditSummary={creditSummary}
        />

        <Button
          onClick={onPay}
          size='lg'
          className='flex-1 h-16 text-lg'
          disabled={cart.items.length === 0 || isLoading}
        >
          <CreditCard className='h-6 w-6 mr-3' /> Pay
        </Button>
        {/* --- END OF FIX --- */}
      </div>
      {/* <Button
        onClick={onPay}
        size='lg'
        className='w-full h-16 text-lg mt-2'
        disabled={safeCart.items.length === 0 || isLoading}
      >
        <CreditCard className='h-6 w-6 mr-3' />
        Pay
      </Button> */}
    </div>
  );
};

const FinalizeCreditButton = ({ onFinalize, isLoading, cart, creditSummary }) => {
  const { formatCurrency } = useAuth();
  const availableCredit = (creditSummary.limit || 0) - (creditSummary.balance || 0);
  const isCreditPossible = availableCredit >= cart.grandTotal;
  const isDisabled = cart.items.length === 0 || isLoading || !isCreditPossible;

  let disabledReason = '';
  if (cart.items.length === 0) disabledReason = 'Cart is empty';
  else if (isLoading) disabledReason = 'Calculating...';
  else if (!isCreditPossible)
    disabledReason = `Credit limit exceeded. Available: ${formatCurrency(availableCredit)}, Required: ${formatCurrency(cart.grandTotal)}`;

  const buttonContent = (
    <>
      <Banknote className='h-6 w-6 mr-3' /> On Account
    </>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='flex-1'>
            {' '}
            {/* Wrapper div for tooltip on disabled button */}
            <Button
              onClick={onFinalize}
              size='lg'
              variant='secondary'
              className='w-full h-16 text-lg'
              disabled={isDisabled}
            >
              {buttonContent}
            </Button>
          </div>
        </TooltipTrigger>
        {isDisabled && (
          <TooltipContent>
            <p>{disabledReason}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const FinalizeCreditButtonOld = ({ onFinalizeOnCredit, isLoading, cart, canSellOnCredit }) => {
  const isDisabled = cart.items.length === 0 || isLoading || !canSellOnCredit;

  let disabledReason = '';
  if (cart.items.length === 0) {
    disabledReason = 'Cart is empty';
  } else if (isLoading) {
    disabledReason = 'Processing...';
  } else if (!canSellOnCredit) {
    disabledReason = 'Customer not eligible for credit sale';
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='flex-1'>
            <Button
              onClick={onFinalizeOnCredit}
              size='lg'
              variant='secondary'
              className='flex h-16 w-full text-lg'
              disabled={isDisabled}
            >
              <Banknote className={cn('h-6 w-6 mr-3', isDisabled && 'text-slate-500')} />
              On Account
            </Button>
          </div>
        </TooltipTrigger>
        {isDisabled && <TooltipContent className='max-w-xs text-sm text-center'>{disabledReason}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

export default TotalsPanel;
