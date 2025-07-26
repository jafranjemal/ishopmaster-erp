import { ArrowLeft, DollarSign, Printer } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from 'ui-library';

import PaymentApplicationModal from '../../components/payments/PaymentApplicationModal';
import InvoiceHeader from '../../components/sales/details/InvoiceHeader';
import InvoiceItemsTable from '../../components/sales/details/InvoiceItemsTable';
import InvoiceTotals from '../../components/sales/details/InvoiceTotals';
import { tenantPaymentMethodService, tenantPaymentsService, tenantSalesService } from '../../services/api';

const SalesInvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [invoiceRes, pmRes] = await Promise.all([
        tenantSalesService.getInvoiceById(id),
        tenantPaymentMethodService.getAll(),
      ]);
      setInvoice(invoiceRes.data.data);
      setPaymentMethods(pmRes.data.data);
    } catch (error) {
      toast.error('Failed to load invoice details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Definitive Fix #1: Add the handler for recording a payment ---
  const handleRecordPayment = async (paymentData) => {
    try {
      await toast.promise(tenantPaymentsService.recordPayment(paymentData), {
        loading: 'Recording payment...',
        success: 'Payment recorded successfully!',
        error: (err) => err.response?.data?.error || 'Failed to record payment.',
      });
      setIsPaymentModalOpen(false);
      fetchData(); // Refresh the invoice data to show the new balance
    } catch (err) {
      // Error is handled by the toast promise
    }
  };

  const handleProcessExchange = async () => {
    if (
      !window.confirm(
        'This will void the current invoice and start a new transaction with the returned items as credit. Are you sure?',
      )
    )
      return;

    setIsProcessing(true);
    try {
      const res = await toast.promise(tenantSalesService.reopenInvoiceForExchange(id), {
        loading: 'Reopening original invoice...',
        success: 'Invoice reversed! Loading exchange...',
        error: (err) => err.response?.data?.error || 'Failed to process exchange.',
      });
      // Pass the original invoice data directly to the POS page
      navigate('/pos/terminal', { state: { exchangeData: res.data.data } });
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <p className='p-8 text-center'>Loading Invoice Details...</p>;
  if (!invoice) return <p className='p-8 text-center'>Invoice not found.</p>;

  const isPaid = invoice.paymentStatus === 'paid';
  const canBeExchanged = invoice.status === 'completed';
  return (
    <>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <Link to='/sales/invoices' className='flex items-center text-sm text-indigo-400 hover:underline mb-2'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to All Invoices
            </Link>
            <h1 className='text-3xl font-bold'>Invoice Details</h1>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline'>
              <Printer className='h-4 w-4 mr-2' />
              Print Invoice
            </Button>
            <Button variant='outline' onClick={handleProcessExchange} disabled={!canBeExchanged || isProcessing}>
              <Repeat className='h-4 w-4 mr-2' />
              {isProcessing ? 'Processing...' : 'Process Exchange'}
            </Button>
            {/* --- Definitive Fix #2: Add the intelligent "Record Payment" button --- */}
            <Button onClick={() => setIsPaymentModalOpen(true)} disabled={isPaid}>
              <DollarSign className='h-4 w-4 mr-2' />
              {isPaid ? 'Fully Paid' : 'Record Payment'}
            </Button>
          </div>
        </div>
        <div className='space-y-4'>
          <InvoiceHeader invoice={invoice} />
          <InvoiceItemsTable items={invoice.items} />
          <InvoiceTotals invoice={invoice} />
        </div>
      </div>
      <PaymentApplicationModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handleRecordPayment}
        invoice={invoice}
        paymentMethods={paymentMethods}
      />
    </>
  );
};

export default SalesInvoiceDetailPage;
