import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import useAuth from '../../context/useAuth';

const JobSheetViewer = ({ items = [] }) => {
  const { formatCurrency } = useAuth();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item/Service</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead className='text-right'>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className='text-center h-24'>
              No parts or services added yet.
            </TableCell>
          </TableRow>
        )}
        {items.map((item, index) => (
          <TableRow key={index}>
            <TableCell className='font-medium'>{item.description}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell className='text-right font-mono'>{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default JobSheetViewer;
