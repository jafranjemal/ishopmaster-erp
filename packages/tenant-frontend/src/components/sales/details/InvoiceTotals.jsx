import { Card, CardContent } from 'ui-library';
import useAuth from '../../../context/useAuth';

const InvoiceTotals = ({ invoice }) => {
  const { formatCurrency } = useAuth();
  const balanceDue = (invoice.totalAmount || 0) - (invoice.amountPaid || 0);

  return (
    <div className='flex justify-end'>
      <div className='w-full md:w-1/2 lg:w-1/3'>
        <Card>
          <CardContent className='p-4 space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-slate-400'>Subtotal</span>
              <span className='font-mono'>{formatCurrency(invoice.subTotal)}</span>
            </div>
            {invoice.totalDiscount > 0 && (
              <div className='flex justify-between'>
                <span className='text-slate-400'>Discounts</span>
                <span className='font-mono text-green-400'>-{formatCurrency(invoice.totalDiscount)}</span>
              </div>
            )}
            {invoice.totalCharges > 0 && (
              <div className='flex justify-between'>
                <span className='text-slate-400'>Charges</span>
                <span className='font-mono'>+{formatCurrency(invoice.totalCharges)}</span>
              </div>
            )}
            {invoice.totalTax > 0 && (
              <div className='flex justify-between'>
                <span className='text-slate-400'>Tax</span>
                <span className='font-mono'>+{formatCurrency(invoice.totalTax)}</span>
              </div>
            )}
            <div className='flex justify-between font-bold text-base border-t border-slate-700 pt-2 mt-2'>
              <span className=''>Grand Total</span>
              <span className='font-mono'>{formatCurrency(invoice.totalAmount)}</span>
            </div>
            {invoice.amountPaid > 0 && (
              <div className='flex justify-between'>
                <span className='text-slate-400'>Amount Paid</span>
                <span className='font-mono'>-{formatCurrency(invoice.amountPaid)}</span>
              </div>
            )}
            <div className='flex justify-between font-bold text-lg bg-slate-800 p-2 rounded-md mt-2'>
              <span className=''>Balance Due</span>
              <span className='font-mono'>{formatCurrency(balanceDue)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default InvoiceTotals;
