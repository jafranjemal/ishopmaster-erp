import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Label } from 'ui-library';
import { PlusCircle, Trash2 } from 'lucide-react';

import CouponRedemption from './CouponRedemption';
import useAuth from '../../../context/useAuth';

const PaymentModal = ({ isOpen, onClose, onConfirm, totalAmount, paymentMethods = [], customer }) => {
  const { formatCurrency } = useAuth();
  const [paymentLines, setPaymentLines] = useState([]);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponId, setCouponId] = useState(null);

  const totalPaid = useMemo(
    () => paymentLines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
    [paymentLines],
  );
  const finalAmountDue = useMemo(() => totalAmount - couponDiscount, [totalAmount, couponDiscount]);
  const remainingBalance = useMemo(() => finalAmountDue - totalPaid, [finalAmountDue, totalPaid]);

  useEffect(() => {
    if (isOpen) {
      // Reset on open
      setPaymentLines([{ paymentMethodId: '', amount: '', referenceNumber: '' }]);
      setCouponDiscount(0);
      setCouponId(null);
    }
  }, [isOpen]);

  const addPaymentLine = () =>
    setPaymentLines((prev) => [...prev, { paymentMethodId: '', amount: '', referenceNumber: '' }]);
  const removePaymentLine = (index) => setPaymentLines((prev) => prev.filter((_, i) => i !== index));
  const updatePaymentLine = (index, field, value) =>
    setPaymentLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));

  const handleAutoFill = (index) => {
    if (remainingBalance > 0) {
      updatePaymentLine(index, 'amount', remainingBalance.toFixed(2));
    }
  };

  const handleConfirm = () => {
    const finalPaymentData = { paymentLines, notes: 'POS Sale' };
    onConfirm(finalPaymentData, couponId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Process Payment'>
      <div className='space-y-4'>
        <div className='p-4 bg-slate-900 rounded-lg text-center'>
          <p className='text-sm text-slate-400'>Total Amount Due</p>
          <p className='text-4xl font-bold'>{formatCurrency(finalAmountDue)}</p>
        </div>
        <div className='space-y-3 max-h-64 overflow-y-auto pr-2'>
          {paymentLines.map((line, index) => {
            const selectedMethod = paymentMethods.find((pm) => pm._id === line.paymentMethodId);
            return (
              <div key={index} className='p-3 border border-slate-700 rounded-lg space-y-3'>
                <div className=' grid grid-cols-12 gap-2 items-end'>
                  <div className='col-span-6'>
                    <Label>Method</Label>
                    <Select
                      onValueChange={(val) => updatePaymentLine(index, 'paymentMethodId', val)}
                      value={line.paymentMethodId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select...' />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((pm) => (
                          <SelectItem key={pm._id} value={pm._id}>
                            {pm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='col-span-5'>
                    <Label>Amount</Label>
                    <Input
                      type='number'
                      placeholder='0.00'
                      value={line.amount}
                      onChange={(e) => updatePaymentLine(index, 'amount', e.target.value)}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <div className='col-span-1'>
                    <Button variant='ghost' size='icon' onClick={() => removePaymentLine(index)}>
                      <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                  </div>
                  <div className='col-span-12'>
                    <Button variant='link' size='sm' onClick={() => handleAutoFill(index)} className='h-auto p-0'>
                      Fill Remaining ({formatCurrency(remainingBalance)})
                    </Button>
                  </div>
                </div>

                {selectedMethod?.type === 'cheque' && (
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                    <div>
                      <Label>Cheque No.</Label>
                      <Input
                        value={line.referenceNumber}
                        onChange={(e) => updatePaymentLine(index, 'referenceNumber', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        value={line.bankName}
                        onChange={(e) => updatePaymentLine(index, 'bankName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Cheque Date</Label>
                      <Input
                        type='date'
                        value={line.chequeDate}
                        onChange={(e) => updatePaymentLine(index, 'chequeDate', e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {selectedMethod?.type === 'card' && (
                  <div>
                    <Label>Card Transaction ID</Label>
                    <Input
                      value={line.referenceNumber}
                      onChange={(e) => updatePaymentLine(index, 'referenceNumber', e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Button variant='outline' size='sm' onClick={addPaymentLine}>
          <PlusCircle className='h-4 w-4 mr-2' />
          Add Split Payment
        </Button>
        <CouponRedemption
          cartTotal={totalAmount}
          onCouponApplied={({ discountAmount, couponId }) => {
            setCouponDiscount(discountAmount);
            setCouponId(couponId);
          }}
        />
        <div className='pt-4 flex justify-end'>
          <Button size='lg' className='w-full' onClick={handleConfirm} disabled={Math.abs(remainingBalance) > 0.01}>
            Confirm & Complete Sale
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default PaymentModal;
