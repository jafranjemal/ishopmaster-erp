import { useMemo, useState } from 'react';
import { Button, Label, Modal, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import useAuth from '../../../context/useAuth';

const REFUND_METHODS = [
  { value: 'credit_note', label: 'Issue Store Credit' },
  { value: 'cash', label: 'Refund in Cash' },
  { value: 'original_payment_method', label: 'Refund to Original Card/Method' },
];

const RefundConfirmationModal = ({ isOpen, onClose, onConfirm, selectedItems, isSaving }) => {
  const { formatCurrency } = useAuth();
  const [refundMethod, setRefundMethod] = useState('credit_note');

  const totalRefundAmount = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, item) => {
      return sum + item.finalPrice * item.quantity;
    }, 0);
  }, [selectedItems]);

  const handleConfirm = () => {
    onConfirm(refundMethod);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Confirm Return & Refund'>
      <div className='space-y-4'>
        <div className='p-4 bg-slate-900 rounded-lg text-center'>
          <p className='text-sm text-slate-400'>Total Refund Amount</p>
          <p className='text-4xl font-bold'>{formatCurrency(totalRefundAmount)}</p>
        </div>
        <div>
          <Label>Refund Method</Label>
          <Select onValueChange={setRefundMethod} value={refundMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REFUND_METHODS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='pt-4 flex justify-end'>
          <Button size='lg' className='w-full' onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? 'Processing Return...' : 'Confirm Return'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RefundConfirmationModal;
