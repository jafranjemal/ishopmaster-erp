import { CheckCircle, Printer, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import useAuth from '../../context/useAuth';
import { tenantRepairService } from '../../services/api';
import PrintModal from '../shared/PrintModal';

const PostTransactionScreen = ({ invoice, onNewSale }) => {
  const { formatCurrency } = useAuth();
  const [isClosingJob, setIsClosingJob] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const isServiceInvoice = !!invoice.repairTicketId;
  const changeDue =
    (invoice.amountPaid || 0) > (invoice.totalAmount || 0) ? invoice.amountPaid - invoice.totalAmount : 0;

  const handleConfirmPickup = async () => {
    setIsClosingJob(true);
    try {
      await toast.promise(tenantRepairService.confirmDevicePickup(invoice.repairTicketId), {
        loading: 'Closing repair job...',
        success: 'Repair job closed successfully!',
        error: (err) => err.response?.data?.error || 'Failed to close job.',
      });
      onNewSale(); // Go to next sale after closing
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsClosingJob(false);
    }
  };

  return (
    <div className='flex items-center justify-center h-full bg-slate-900'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader>
          <CheckCircle className='mx-auto h-16 w-16 text-green-500' />
          <CardTitle className='mt-4 text-2xl'>Sale Completed!</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='p-4 bg-slate-800 rounded-lg'>
            <p className='text-sm text-slate-400'>Total Amount</p>
            <p className='text-3xl font-bold'>{formatCurrency(invoice.totalAmount)}</p>
            {changeDue > 0 && <p className='mt-2 text-lg text-amber-400'>Change Due: {formatCurrency(changeDue)}</p>}
          </div>

          {/* --- Definitive Fix #1: Conditional Action Buttons --- */}
          {isServiceInvoice ? (
            <div className='space-y-2'>
              <p className='text-sm text-slate-400'>Please hand the repaired device(s) to the customer.</p>
              <Button size='lg' className='w-full h-14 text-lg' onClick={handleConfirmPickup} disabled={isClosingJob}>
                <ShoppingBag className='h-6 w-6 mr-3' />
                {isClosingJob ? 'Closing Job...' : 'Confirm Device Pickup & Close Job'}
              </Button>
            </div>
          ) : (
            <Button size='lg' className='w-full h-14 text-lg' onClick={onNewSale}>
              Next Sale
            </Button>
          )}
          {/* --- End of Fix --- */}

          <Button variant='outline' className='w-full' onClick={() => setIsPrintModalOpen(true)}>
            <Printer className='h-4 w-4 mr-2' /> Print Receipt
          </Button>
        </CardContent>
      </Card>

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        documentType='SalesInvoice'
        documentId={invoice._id}
      />
    </div>
  );
};

export default PostTransactionScreen;
