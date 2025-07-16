import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tenantReturnsService } from '../../services/api';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import { Search } from 'lucide-react';
import SelectReturnItems from '../../components/sales/returns/SelectReturnItems';
import ConfirmRefundStep from '../../components/sales/returns/ConfirmRefundStep';
import { useNavigate } from 'react-router-dom';

const ReturnsPage = () => {
  const [step, setStep] = useState(1);
  const [invoiceId, setInvoiceNumber] = useState('');
  const [originalInvoice, setOriginalInvoice] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleFindInvoice = async () => {
    try {
      const res = await tenantReturnsService.findInvoice(invoiceId);
      if (res.data.data.length === 0) throw new Error('Invoice not found.');
      setOriginalInvoice(res.data.data[0]);
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to find invoice.');
    }
  };

  const handleSelectionChange = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.productVariantId === item.productVariantId);
      if (exists) return prev.filter((i) => i.productVariantId !== item.productVariantId);
      return [...prev, { productVariantId: item.productVariantId, quantityReturned: 1, returnPrice: item.finalPrice }];
    });
  };

  const handleQuantityChange = (variantId, qty) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.productVariantId === variantId ? { ...i, quantityReturned: Number(qty) } : i)),
    );
  };

  const handleProcessReturn = async (resolution) => {
    setIsProcessing(true);
    const returnData = {
      originalInvoiceId: originalInvoice._id,
      customerId: originalInvoice.customerId,
      items: selectedItems,
      totalRefundAmount: selectedItems.reduce((sum, i) => sum + i.returnPrice * i.quantityReturned, 0),
      resolution,
    };
    try {
      await toast.promise(tenantReturnsService.processReturn(returnData), {
        loading: 'Processing return...',
        success: 'Return processed successfully!',
        error: 'Return failed.',
      });
      navigate('/sales/history');
    } catch (err) {
      /* handled by toast */
    } finally {
      setIsProcessing(false);
    }
  };

  const totalRefund = selectedItems.reduce((sum, i) => sum + i.returnPrice * i.quantityReturned, 0);

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold'>Process Customer Return (RMA)</h1>
      <Card>
        <CardHeader>
          <CardTitle>
            Step {step}: {step === 1 ? 'Find Original Invoice' : 'Select Items & Confirm'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className='flex gap-2'>
              <Input
                value={invoiceId}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder='Enter Invoice Number...'
              />
              <Button onClick={handleFindInvoice}>
                <Search className='h-4 w-4 mr-2' />
                Find
              </Button>
            </div>
          )}
          {step === 2 && originalInvoice && (
            <div>
              <h3 className='font-bold mb-2'>Select Items to Return</h3>
              <SelectReturnItems
                invoice={originalInvoice}
                selectedItems={selectedItems}
                onSelectionChange={handleSelectionChange}
                onQuantityChange={handleQuantityChange}
              />
              <div className='mt-6 border-t border-slate-700 pt-6'>
                <h3 className='font-bold mb-4'>Confirm Refund</h3>
                <ConfirmRefundStep
                  totalRefund={totalRefund}
                  paymentMethods={[]}
                  onConfirm={handleProcessReturn}
                  isSaving={isProcessing}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default ReturnsPage;
