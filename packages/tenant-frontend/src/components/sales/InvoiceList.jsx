import { Link } from 'react-router-dom';
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import useAuth from '../../context/useAuth';

const InvoiceList = ({ invoices }) => {
  const { formatCurrency, formatDate } = useAuth();

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead className='text-right'>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className='text-center h-24'>
              No invoices found.
            </TableCell>
          </TableRow>
        )}
        {invoices.map((invoice) => (
          <TableRow key={invoice._id}>
            <TableCell>
              <Link to={`/sales/invoices/${invoice._id}`} className='font-mono hover:underline text-indigo-400'>
                {invoice.invoiceId || invoice.draftId || 'N/A'}
              </Link>
            </TableCell>
            <TableCell>{invoice.customer?.name || 'N/A'}</TableCell>
            <TableCell>{formatDate(invoice.createdAt)}</TableCell>
            <TableCell>
              <Badge variant={getPaymentStatusVariant(invoice.paymentStatus)} className='capitalize'>
                {invoice.paymentStatus.replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell className='text-right font-mono'>{formatCurrency(invoice.totalAmount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default InvoiceList;
