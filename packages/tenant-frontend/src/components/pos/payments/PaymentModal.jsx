import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Label } from 'ui-library';
import {
  PlusCircle,
  CheckCircle,
  Wallet,
  CreditCard,
  FileText,
  AlertCircle,
  ChevronDown,
  X,
  Calculator,
} from 'lucide-react';
import CouponRedemption from './CouponRedemption';
import useAuth from '../../../context/useAuth';
import { calculateChange } from '../../../utils/calculateChange';
import ChangeCalculatorModal from '../ChangeCalculatorModal';

const PaymentMethodIcon = ({ type }) => {
  const iconMap = {
    cash: <Wallet className='h-4 w-4' />,
    card: <CreditCard className='h-4 w-4' />,
    cheque: <FileText className='h-4 w-4' />,
    credit: <CreditCard className='h-4 w-4' />,
  };
  return iconMap[type] || <Wallet className='h-4 w-4' />;
};

const PaymentModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  onPartialPaymentAttempt,
  paymentMethods = [],
  customer,
  creditSummary,
  denominations = [],
}) => {
  const { formatCurrency } = useAuth();
  const [paymentLines, setPaymentLines] = useState([]);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponId, setCouponId] = useState(null);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [changeBreakdown, setChangeBreakdown] = useState([]);
  const [activeCouponSection, setActiveCouponSection] = useState(false);

  // Derived values
  const finalAmountDue = useMemo(() => totalAmount - couponDiscount, [totalAmount, couponDiscount]);
  const totalPaid = useMemo(
    () => paymentLines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
    [paymentLines],
  );
  const remainingBalance = useMemo(() => finalAmountDue - totalPaid, [finalAmountDue, totalPaid]);
  const availableCredit = useMemo(() => (creditSummary.limit || 0) - (creditSummary.balance || 0), [creditSummary]);
  const paymentProgress = useMemo(() => Math.min(100, (totalPaid / finalAmountDue) * 100), [totalPaid, finalAmountDue]);

  // Business rules
  const canAcceptPartialPayment = useMemo(() => {
    if (customer?.isWalkingCustomer) return false;
    return availableCredit >= remainingBalance;
  }, [customer, availableCredit, remainingBalance]);

  const isFullyPaid = Math.abs(remainingBalance) < 0.01;
  const isConfirmDisabled = !isFullyPaid && !canAcceptPartialPayment;

  const availablePaymentMethods = useMemo(() => {
    return customer?.isWalkingCustomer ? paymentMethods.filter((pm) => pm.allowedFor === 'all') : paymentMethods;
  }, [customer, paymentMethods]);

  // Calculate total change due from all cash payments
  const changeDue = useMemo(() => {
    return paymentLines.reduce((total, line) => {
      if (line.paymentMethodId) {
        const method = paymentMethods.find((pm) => pm._id === line.paymentMethodId);
        if (method?.type === 'cash' && line.changeDue) {
          return total + Number(line.changeDue);
        }
      }
      return total;
    }, 0);
  }, [paymentLines, paymentMethods]);

  const handleShowChangeBreakdown = () => {
    if (changeDue > 0) {
      const breakdown = calculateChange(changeDue, denominations);
      setChangeBreakdown(breakdown);
      setIsChangeModalOpen(true);
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      resetPaymentForm();
    }
  }, [isOpen, paymentMethods, finalAmountDue]);

  const totalChangeBreakdown = useMemo(() => {
    return calculateChange(changeDue, denominations);
  }, [changeDue, denominations]);

  // Helper functions
  const resetPaymentForm = () => {
    const cashMethod = paymentMethods.find((pm) => pm.type === 'cash');
    setPaymentLines([
      {
        paymentMethodId: cashMethod?._id || '',
        amount: finalAmountDue.toFixed(2),
        referenceNumber: '',
        cashTendered: '',
        changeDue: 0,
      },
    ]);
    setCouponDiscount(0);
    setCouponId(null);
    setActiveCouponSection(false);
  };

  const addPaymentLine = () => {
    setPaymentLines((prev) => [
      ...prev,
      {
        paymentMethodId: '',
        amount: '',
        referenceNumber: '',
        cashTendered: '',
        changeDue: 0,
        bankName: '',
        chequeDate: '',
      },
    ]);
  };

  const updatePaymentLine = (index, field, value) => {
    setPaymentLines((prev) =>
      prev.map((line, i) => {
        if (i === index) {
          const updatedLine = { ...line, [field]: value };

          // Auto-calculate change for cash payments
          if (field === 'cashTendered' && line.paymentMethodId) {
            const method = paymentMethods.find((pm) => pm._id === line.paymentMethodId);
            if (method?.type === 'cash') {
              const tendered = Number(value) || 0;
              const amount = Number(line.amount) || 0;
              updatedLine.changeDue = tendered > amount ? tendered - amount : 0;

              updatedLine.changeBreakdown = calculateChange(updatedLine.changeDue, [...denominations]);
            }
          }

          return updatedLine;
        }
        return line;
      }),
    );
  };

  const handleConfirm = () => {
    const finalPaymentData = {
      paymentLines: paymentLines.map((line) => {
        const method = paymentMethods.find((pm) => pm._id === line.paymentMethodId);
        return {
          ...line,
          status: method?.type === 'cheque' ? 'pending' : 'cleared',
        };
      }),
      notes: 'POS Sale',
    };

    if (remainingBalance > 0 && onPartialPaymentAttempt) {
      onPartialPaymentAttempt(finalPaymentData, couponId);
    } else {
      onConfirm(finalPaymentData, couponId);
    }
  };

  // Component rendering
  const renderPaymentLine = (line, index) => {
    const selectedMethod = paymentMethods.find((pm) => pm._id === line.paymentMethodId);
    const isCashMethod = selectedMethod?.type === 'cash';

    return (
      <div
        key={index}
        className='bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border dark:border-slate-700 mb-3'
      >
        <div className='flex gap-3 mb-3'>
          {/* Method Selector */}
          <div className='flex-1 min-w-0'>
            <Select
              onValueChange={(val) => updatePaymentLine(index, 'paymentMethodId', val)}
              value={line.paymentMethodId}
            >
              <SelectTrigger className='h-[56px]'>
                {selectedMethod ? (
                  <div className='flex items-center'>
                    <PaymentMethodIcon type={selectedMethod.type} className='flex mr-[20px]' />
                    <span className='flex ml-[20px]'>{selectedMethod.name}</span>
                  </div>
                ) : (
                  <span>Select method</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {availablePaymentMethods.map((pm) => (
                  <SelectItem key={pm._id} value={pm._id} className='flex items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <PaymentMethodIcon type={pm.type} className='flex mr-[20px]' />

                      <span className='flex ml-[10px]'>{pm.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className='w-[120px]'>
            <Input
              type='number'
              className='h-[56px] text-right text-lg font-medium'
              placeholder='0.00'
              value={line.amount}
              onChange={(e) => updatePaymentLine(index, 'amount', e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          </div>
        </div>

        {/* Dynamic Method Fields */}
        {isCashMethod && (
          <div className='grid grid-cols-2 gap-3 mt-3'>
            <div>
              <Label className='text-xs'>Cash Tendered</Label>
              <Input
                type='number'
                value={line.cashTendered}
                onChange={(e) => updatePaymentLine(index, 'cashTendered', e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <Label className='text-xs'>Change Due</Label>
              <Input
                type='number'
                disabled
                value={line.changeDue}
                className='font-medium bg-slate-100 dark:bg-slate-700'
              />

              {changeDue > 0 && (
                <Button variant='outline' size='sm' onClick={handleShowChangeBreakdown} className='mt-2 gap-2'>
                  <Calculator className='h-4 w-4' />
                  Calculate Change Breakdown
                </Button>
              )}
            </div>
          </div>
        )}

        {line.changeBreakdown?.length > 0 && (
          <div className='mt-2'>
            <p className='text-xs text-slate-500'>Change breakdown:</p>
            <div className='flex flex-wrap gap-1 mt-1'>
              {line.changeBreakdown.map((denom, i) => (
                <span key={i} className='px-2 py-1  rounded-md text-xs'>
                  {denom.count}x {denom.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {selectedMethod?.type === 'cheque' && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mt-3'>
            <div>
              <Label className='text-xs'>Cheque No.</Label>
              <Input
                value={line.referenceNumber}
                onChange={(e) => updatePaymentLine(index, 'referenceNumber', e.target.value)}
              />
            </div>
            <div>
              <Label className='text-xs'>Bank Name</Label>
              <Input value={line.bankName} onChange={(e) => updatePaymentLine(index, 'bankName', e.target.value)} />
            </div>
            <div>
              <Label className='text-xs'>Cheque Date</Label>
              <Input
                type='date'
                value={line.chequeDate}
                onChange={(e) => updatePaymentLine(index, 'chequeDate', e.target.value)}
              />
            </div>
          </div>
        )}

        {selectedMethod?.type === 'card' && (
          <div className='mt-3'>
            <Label className='text-xs'>Transaction ID</Label>
            <Input
              value={line.referenceNumber}
              onChange={(e) => updatePaymentLine(index, 'referenceNumber', e.target.value)}
            />
          </div>
        )}

        <div className='flex justify-between items-center mt-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              if (remainingBalance > 0) {
                updatePaymentLine(index, 'amount', remainingBalance.toFixed(2));
              }
            }}
            className='text-blue-600 dark:text-blue-400'
          >
            Apply remaining {formatCurrency(remainingBalance)}
          </Button>

          {paymentLines.length > 1 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setPaymentLines((prev) => prev.filter((_, i) => i !== index));
              }}
              className='text-red-600 dark:text-red-400'
            >
              <X className='h-4 w-4 mr-1' /> Remove
            </Button>
          )}
        </div>
      </div>
    );

    return (
      <div
        key={index}
        className='bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border dark:border-slate-700 mb-3'
      >
        <div className='flex gap-3 mb-3'>
          {/* Method Selector */}
          <div className='flex-1 min-w-0'>
            <Select
              onValueChange={(val) => updatePaymentLine(index, 'paymentMethodId', val)}
              value={line.paymentMethodId}
            >
              <SelectTrigger className='h-[56px]'>
                {selectedMethod ? (
                  <div className='flex items-center'>
                    <PaymentMethodIcon type={selectedMethod.type} className='flex mr-2' />
                    {selectedMethod.name}
                  </div>
                ) : (
                  <span>Select method</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {availablePaymentMethods.map((pm) => (
                  <SelectItem key={pm._id} value={pm._id} className='flex items-center gap-2'>
                    <PaymentMethodIcon type={pm.type} />
                    {pm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className='w-[120px]'>
            <Input
              type='number'
              className='h-[56px] text-right text-lg font-medium'
              placeholder='0.00'
              value={line.amount}
              onChange={(e) => updatePaymentLine(index, 'amount', e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          </div>
        </div>

        {/* Dynamic Method Fields */}
        {isCashMethod && (
          <div className='grid grid-cols-2 gap-3 mt-3'>
            <div>
              <Label className='text-xs'>Cash Tendered</Label>
              <Input
                type='number'
                value={line.cashTendered}
                onChange={(e) => updatePaymentLine(index, 'cashTendered', e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div>
              <Label className='text-xs'>Change Due</Label>
              <Input
                type='number'
                disabled
                value={line.changeDue}
                className='font-medium bg-slate-100 dark:bg-slate-700'
              />

              {changeDue > 0 && (
                <Button variant='outline' size='sm' onClick={handleShowChangeBreakdown} className='mt-2 gap-2'>
                  <Calculator className='h-4 w-4' />
                  Calculate Change Breakdown
                </Button>
              )}
            </div>
          </div>
        )}

        {line.changeBreakdown?.length > 0 && (
          <div className='mt-2'>
            <p className='text-xs text-slate-500'>Change breakdown:</p>
            <div className='flex flex-wrap gap-1 mt-1'>
              {line.changeBreakdown.map((denom, i) => (
                <span key={i} className='px-2 py-1  rounded-md text-xs'>
                  {denom.count}x {denom.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {selectedMethod?.type === 'cheque' && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mt-3'>
            <div>
              <Label className='text-xs'>Cheque No.</Label>
              <Input
                value={line.referenceNumber}
                onChange={(e) => updatePaymentLine(index, 'referenceNumber', e.target.value)}
              />
            </div>
            <div>
              <Label className='text-xs'>Bank Name</Label>
              <Input value={line.bankName} onChange={(e) => updatePaymentLine(index, 'bankName', e.target.value)} />
            </div>
            <div>
              <Label className='text-xs'>Cheque Date</Label>
              <Input
                type='date'
                value={line.chequeDate}
                onChange={(e) => updatePaymentLine(index, 'chequeDate', e.target.value)}
              />
            </div>
          </div>
        )}

        {selectedMethod?.type === 'card' && (
          <div className='mt-3'>
            <Label className='text-xs'>Transaction ID</Label>
            <Input
              value={line.referenceNumber}
              onChange={(e) => updatePaymentLine(index, 'referenceNumber', e.target.value)}
            />
          </div>
        )}

        <div className='flex justify-between items-center mt-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              if (remainingBalance > 0) {
                updatePaymentLine(index, 'amount', remainingBalance.toFixed(2));
              }
            }}
            className='text-blue-600 dark:text-blue-400'
          >
            Apply remaining {formatCurrency(remainingBalance)}
          </Button>

          {paymentLines.length > 1 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setPaymentLines((prev) => prev.filter((_, i) => i !== index));
              }}
              className='text-red-600 dark:text-red-400'
            >
              <X className='h-4 w-4 mr-1' /> Remove
            </Button>
          )}
        </div>
      </div>
    );
  };

  const CustomProgress = ({ value, className = '' }) => {
    return (
      <div className={`h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative ${className}`}>
        <div
          className='h-full absolute top-0 left-0 origin-left transition-all duration-500 ease-out'
          style={{
            transform: `scaleX(${value / 100})`,
            backgroundColor: isFullyPaid
              ? '#10B981' // green-500
              : canAcceptPartialPayment
                ? '#3B82F6' // blue-500
                : '#F59E0B', // amber-500,
            width: '100%', // Always full width, scaled via transform
          }}
        />
      </div>
    );
  };

  // In the JSX, replace the Progress component usage:
  <CustomProgress value={paymentProgress} className='mt-1' />;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title='Process Payment'
        className='max-h-[90vh] flex flex-col'
        overlayClassName='backdrop-blur-sm'
      >
        <div className='flex-1 overflow-y-auto p-6'>
          {/* Header Section */}

          <div className='sticky top-0 bg-white dark:bg-slate-900 z-10 p-5 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b dark:border-slate-700'>
            <div className='flex items-center justify-between mb-3'>
              <p className='text-sm font-medium text-slate-600 dark:text-slate-300'>PAYMENT SUMMARY</p>
              <div
                className={`px-2 py-1 rounded text-xs ${
                  isFullyPaid
                    ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                    : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                }`}
              >
                {isFullyPaid ? 'Ready to Complete' : 'Payment Pending'}
              </div>
            </div>

            <div className='flex items-end justify-between mb-4'>
              <p className='text-4xl font-bold'>{formatCurrency(finalAmountDue)}</p>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                <span className='font-medium text-slate-700 dark:text-slate-300'>
                  {Number(paymentProgress).toFixed()}%
                </span>{' '}
                Completed
              </p>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-500 dark:text-slate-400'>Paid Amount</span>
                <span className='font-medium'>{formatCurrency(totalPaid)}</span>
              </div>

              <CustomProgress value={paymentProgress} />

              <div className='flex justify-between text-sm'>
                <span
                  className={
                    remainingBalance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                  }
                >
                  {remainingBalance > 0 ? 'Balance Due' : remainingBalance === 0 ? 'Fully Paid' : 'Overpayment'}
                </span>
                <span className='font-medium'>{formatCurrency(Math.abs(remainingBalance))}</span>
              </div>
            </div>
          </div>
          {/* Payment Methods Section */}
          <div className='mt-6'>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='font-medium'>Payment Methods</h3>
              <Button variant='outline' size='sm' onClick={addPaymentLine} className='gap-1'>
                <PlusCircle className='h-4 w-4' />
                Add Payment
              </Button>
            </div>

            <div className='space-y-3'>{paymentLines.map(renderPaymentLine)}</div>
          </div>

          {/* Coupon Section */}
          <div className='mt-6 border-t pt-4'>
            <button
              className='flex items-center justify-between w-full'
              onClick={() => setActiveCouponSection(!activeCouponSection)}
            >
              <h3 className='font-medium'>Coupon Redemption</h3>
              <ChevronDown className={`h-5 w-5 transition-transform ${activeCouponSection ? 'rotate-180' : ''}`} />
            </button>

            {activeCouponSection && (
              <div className='mt-3'>
                <CouponRedemption
                  cartTotal={totalAmount}
                  onCouponApplied={({ discountAmount, couponId }) => {
                    setCouponDiscount(discountAmount);
                    setCouponId(couponId);
                  }}
                />
              </div>
            )}
          </div>

          {/* Status Messages */}
          {!isFullyPaid && (
            <div
              className={`mt-6 p-4 rounded-lg ${
                canAcceptPartialPayment
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  : 'bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200'
              }`}
            >
              <div className='flex items-start gap-3'>
                <AlertCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />
                <div>
                  {canAcceptPartialPayment ? (
                    <>
                      <p className='font-medium'>Partial Payment Approved</p>
                      <p className='text-sm mt-1'>
                        Outstanding balance of {formatCurrency(remainingBalance)} will be added to{' '}
                        {customer?.name || 'customer'}'s account.
                      </p>
                    </>
                  ) : customer?.isWalkingCustomer ? (
                    <>
                      <p className='font-medium'>Full Payment Required</p>
                      <p className='text-sm mt-1'>
                        Walking customers must pay the full amount. Please collect {formatCurrency(remainingBalance)}{' '}
                        more to complete this sale.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className='font-medium'>Credit Limit Exceeded</p>
                      <p className='text-sm mt-1'>
                        Customer doesn't have sufficient credit ({formatCurrency(availableCredit)} available). Please
                        collect full payment or adjust credit limit.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='sticky bottom-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800'>
          <div className='p-4'>
            {/* Status Bar */}
            <div
              className={`flex items-center justify-between mb-3 px-3 py-2 rounded-lg ${
                isFullyPaid
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : canAcceptPartialPayment
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'
              }`}
            >
              <div className='flex items-center gap-2'>
                {isFullyPaid ? <CheckCircle className='h-4 w-4' /> : <AlertCircle className='h-4 w-4' />}
                <span className='text-sm font-medium'>
                  {isFullyPaid
                    ? 'Ready to complete'
                    : canAcceptPartialPayment
                      ? 'Partial payment available'
                      : 'Payment incomplete'}
                </span>
              </div>
              <span className='text-sm font-semibold'>{formatCurrency(isFullyPaid ? 0 : remainingBalance)}</span>
            </div>

            {/* Primary Button */}
            <Button
              size='xl'
              className={`w-full h-14 text-lg font-medium ${
                isConfirmDisabled
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'
              }`}
              disabled={isConfirmDisabled}
              onClick={handleConfirm}
            >
              {isFullyPaid ? (
                <>
                  <CheckCircle className='h-5 w-5 mr-2' />
                  Finalize Transaction
                </>
              ) : (
                <>
                  <FileText className='h-5 w-5 mr-2' />
                  Authorize Partial Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <ChangeCalculatorModal
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
        changeBreakdown={totalChangeBreakdown}
        changeDue={changeDue}
      />
    </>
  );
};

export default PaymentModal;
