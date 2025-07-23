import { Badge, Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import useAuth from '../../../context/useAuth';

const InvoiceHeader = ({ invoice }) => {
  const { formatDate } = useAuth();

  const getPaymentStatusVariant = (status) => {
    /* ... (same as in InvoiceList) ... */
  };
  const getWorkflowStatusVariant = (status) => {
    /* ... */
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle className='text-2xl'>Invoice {invoice.invoiceId || invoice.draftId}</CardTitle>
          <div className='flex items-center gap-2'>
            <Badge variant={getWorkflowStatusVariant(invoice.workflowStatus)} className='capitalize'>
              {invoice.workflowStatus.replace('_', ' ')}
            </Badge>
            <Badge variant={getPaymentStatusVariant(invoice.paymentStatus)} className='capitalize'>
              {invoice.paymentStatus.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
        <div>
          <p className='text-slate-400'>Billed To:</p>
          <p className='font-semibold'>{invoice.customer?.name}</p>
          <p>{invoice.customer?.email}</p>
        </div>
        <div>
          <p className='text-slate-400'>Invoice Date:</p>
          <p className='font-semibold'>{formatDate(invoice.createdAt)}</p>
        </div>
        <div>
          <p className='text-slate-400'>Payment Due:</p>
          <p className='font-semibold'>{invoice.dueDate ? formatDate(invoice.dueDate) : 'Due on receipt'}</p>
        </div>
      </CardContent>
    </Card>
  );
};
export default InvoiceHeader;
