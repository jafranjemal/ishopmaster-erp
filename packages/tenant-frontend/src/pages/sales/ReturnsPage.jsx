import { Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import JobRecall from '../../components/pos/JobRecall';
import RefundConfirmationModal from '../../components/sales/returns/RefundConfirmationModal';
import ReturnableItemsList from '../../components/sales/returns/ReturnableItemsList';
import { tenantReturnsService } from '../../services/api';

const ReturnsPage = () => {
  const [foundInvoice, setFoundInvoice] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleJobFound = (foundJob) => {
    if (foundJob.type === 'SalesInvoice') {
      setFoundInvoice(foundJob.document);
      setSelectedItems({}); // Reset selection when a new invoice is found
    } else {
      toast.error('Only Sales Invoices can be processed for returns here.');
    }
  };

  const resetPage = () => {
    setFoundInvoice(null);
    setSelectedItems({});
    setIsConfirmModalOpen(false);
  };

  const handleProcessReturn = async (refundMethod) => {
    setIsSaving(true);
    const returnData = {
      invoiceId: foundInvoice._id,
      itemsToReturn: Object.values(selectedItems).map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        reason: 'Customer return', // In a real app, you'd have a reason input
        description: item.description,
      })),
      refundMethod,
    };

    try {
      await toast.promise(tenantReturnsService.processReturn(returnData), {
        loading: 'Processing return...',
        success: 'Return processed successfully!',
        error: (err) => err.response?.data?.error || 'Failed to process return.',
      });
      resetPage();
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsSaving(false);
      setIsConfirmModalOpen(false);
    }
  };

  const canProcessReturn = useMemo(() => Object.keys(selectedItems).length > 0, [selectedItems]);

  return (
    <>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Undo2 className='h-8 w-8 text-indigo-400' /> Process Customer Return
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Find Original Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <JobRecall onJobFound={handleJobFound} />
          </CardContent>
        </Card>

        {foundInvoice && (
          <Card>
            <CardHeader>
              <CardTitle>2. Select Items to Return</CardTitle>
            </CardHeader>
            <CardContent>
              <ReturnableItemsList
                items={foundInvoice.items}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
              />
            </CardContent>
          </Card>
        )}

        <div className='flex justify-end gap-2'>
          {foundInvoice && (
            <Button variant='outline' onClick={resetPage}>
              Clear
            </Button>
          )}
          <Button onClick={() => setIsConfirmModalOpen(true)} disabled={!canProcessReturn}>
            Process Return
          </Button>
        </div>
      </div>

      <RefundConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleProcessReturn}
        selectedItems={selectedItems}
        isSaving={isSaving}
      />
    </>
  );
};

export default ReturnsPage;
