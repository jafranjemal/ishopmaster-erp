import React from 'react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from 'ui-library';
import useAuth from '../../../context/useAuth';

const ConfirmRefundStep = ({ totalRefund, paymentMethods, onConfirm, isSaving }) => {
  const [refundMethodId, setRefundMethodId] = React.useState('');
  const { formatCurrency } = useAuth();

  return (
    <div className='space-y-4'>
      <div className='text-center'>
        <p className='text-slate-400'>Total Refund Amount</p>
        <p className='text-3xl font-bold'>{formatCurrency(totalRefund)}</p>
      </div>
      <div>
        <Label>Refund Method</Label>
        <Select onValueChange={setRefundMethodId} value={refundMethodId}>
          <SelectTrigger>
            <SelectValue placeholder='Select refund method...' />
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
      <div className='pt-4'>
        <Button
          className='w-full'
          onClick={() => onConfirm({ type: 'card_refund', paymentMethodId: refundMethodId })}
          disabled={!refundMethodId || isSaving}
        >
          {isSaving ? 'Processing...' : 'Confirm & Process Refund'}
        </Button>
      </div>
    </div>
  );
};
export default ConfirmRefundStep;
