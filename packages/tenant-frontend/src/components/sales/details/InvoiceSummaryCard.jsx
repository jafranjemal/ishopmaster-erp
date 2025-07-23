import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import useAuth from '../../../context/useAuth';

/**
 * A dedicated component to display a concise summary of a SalesInvoice.
 * Used on pages like the RepairTicketDetailPage for an "at-a-glance" view.
 */
const InvoiceSummaryCard = ({ invoice }) => {
  const { formatCurrency } = useAuth();

  if (!invoice) {
    return <div>No Invoice found</div>;
  }

  const balanceDue = (invoice.totalAmount || 0) - (invoice.amountPaid || 0);

  const getPaymentStatusVariant = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partially_paid':
        return 'warning';
      case 'unpaid':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Final Invoice Summary</CardTitle>
        <Button asChild variant='outline' size='sm'>
          <Link to={`/sales/invoices/${invoice._id}`}>
            <Eye className='h-4 w-4 mr-2' />
            View Full Invoice
          </Link>
        </Button>
      </CardHeader>
      <CardContent className='space-y-3 text-sm'>
        <div className='flex justify-between items-center'>
          <span className='text-slate-400'>Invoice #</span>
          <span className='font-mono'>{invoice.invoiceId}</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-slate-400'>Payment Status</span>
          <Badge variant={getPaymentStatusVariant(invoice.paymentStatus)} className='capitalize'>
            {invoice.paymentStatus.replace('_', ' ')}
          </Badge>
        </div>
        <div className='pt-2 border-t border-slate-700 space-y-2'>
          <div className='flex justify-between'>
            <span className='text-slate-400'>Grand Total</span>
            <span className='font-mono'>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-400'>Amount Paid</span>
            <span className='font-mono'>-{formatCurrency(invoice.amountPaid)}</span>
          </div>
          <div className='flex justify-between font-bold text-base border-t border-slate-600 pt-2 mt-2'>
            <span className=''>Balance Due</span>
            <span className='font-mono'>{formatCurrency(balanceDue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceSummaryCard;
