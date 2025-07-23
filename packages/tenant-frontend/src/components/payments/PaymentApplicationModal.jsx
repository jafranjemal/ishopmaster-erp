import { PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Label, Modal, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import useAuth from '../../context/useAuth';

const PaymentApplicationModal = ({ isOpen, onClose, onConfirm, invoice, paymentMethods = [] }) => {
  const { formatCurrency } = useAuth();
  const [paymentLines, setPaymentLines] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const amountDue = useMemo(() => (invoice.totalAmount || 0) - (invoice.amountPaid || 0), [invoice]);
  const totalPaidInModal = useMemo(
    () => paymentLines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
    [paymentLines],
  );
  const remainingBalance = useMemo(() => amountDue - totalPaidInModal, [amountDue, totalPaidInModal]);

  useEffect(() => {
    if (isOpen) {
      // Initialize with one line, pre-filled with the full amount due.
      const cashMethod = paymentMethods.find((pm) => pm.type === 'cash');
      setPaymentLines([
        {
          paymentMethodId: cashMethod?._id || '',
          amount: amountDue.toFixed(2),
          referenceNumber: '',
        },
      ]);
    }
  }, [isOpen, amountDue, paymentMethods]);

  const addPaymentLine = () =>
    setPaymentLines((prev) => [...prev, { paymentMethodId: '', amount: '', referenceNumber: '', status: 'cleared' }]);
  const removePaymentLine = (index) => setPaymentLines((prev) => prev.filter((_, i) => i !== index));
  const updatePaymentLine = (index, field, value) =>
    setPaymentLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));

  const handleConfirm = async () => {
    setIsSaving(true);
    const paymentData = {
      paymentSourceId: invoice._id,
      paymentSourceType: 'SalesInvoice',
      paymentLines: paymentLines.filter((line) => Number(line.amount) > 0),
      direction: 'inflow',
      notes: `Payment for Invoice #${invoice.invoiceId}`,
    };

    console.log(paymentData);

    try {
      await onConfirm(paymentData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment for Invoice #${invoice.invoiceId}`}>
      <div className='space-y-4'>
        <div className='p-4 bg-slate-900 rounded-lg text-center'>
          <p className='text-sm text-slate-400'>Balance Due</p>
          <p className='text-4xl font-bold'>{formatCurrency(amountDue)}</p>
        </div>
        <div className='space-y-3 max-h-64 overflow-y-auto pr-2'>
          {paymentLines.map((line, index) => (
            <div key={index} className='grid grid-cols-12 gap-2 items-end'>
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
                />
              </div>
              <div className='col-span-1'>
                <Button variant='ghost' size='icon' onClick={() => removePaymentLine(index)}>
                  <Trash2 className='h-4 w-4 text-red-500' />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant='outline' size='sm' onClick={addPaymentLine}>
          <PlusCircle className='h-4 w-4 mr-2' />
          Add Split Payment
        </Button>
        <div className='pt-4 flex justify-end'>
          <Button
            size='lg'
            className='w-full'
            onClick={handleConfirm}
            disabled={totalPaidInModal <= 0 || totalPaidInModal > amountDue + 0.01 || isSaving}
          >
            {isSaving ? 'Processing...' : `Record Payment of ${formatCurrency(totalPaidInModal)}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default PaymentApplicationModal;
