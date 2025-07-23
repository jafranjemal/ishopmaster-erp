import { Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import useAuth from '../../../context/useAuth';

const InvoiceItemsTable = ({ items = [] }) => {
  const { formatCurrency } = useAuth();
  return (
    <Card>
      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className='text-center'>Qty</TableHead>
              <TableHead className='text-right'>Unit Price</TableHead>
              <TableHead className='text-right'>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item._id || index}>
                <TableCell className='font-medium'>
                  {item.description}
                  {(item.serialNumber || item.batchNumber) && (
                    <p className='text-xs text-slate-400 font-mono mt-1'>
                      {item.serialNumber ? `SN: ${item.serialNumber}` : `Batch: ${item.batchNumber}`}
                    </p>
                  )}
                </TableCell>
                <TableCell className='text-center'>{item.quantity}</TableCell>
                <TableCell className='text-right font-mono'>{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell className='text-right font-mono'>
                  {formatCurrency(item.finalPrice * item.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
export default InvoiceItemsTable;
