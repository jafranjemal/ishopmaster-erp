import React from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import { Ticket, FilePenLine } from 'lucide-react';
import { Link } from 'react-router-dom';

const CouponBatchList = ({ batches, onGenerate, onEdit }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Campaign Name</TableHead>
        <TableHead>Prefix</TableHead>
        <TableHead>Discount</TableHead>
        <TableHead className='text-right'>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {batches.map((b) => (
        <TableRow key={b._id}>
          <TableCell className='font-medium'>
            <Link to={`/settings/coupons/${b._id}`} className='hover:underline'>
              {b.name}
            </Link>
          </TableCell>
          <TableCell className='font-mono'>{b.prefix}</TableCell>
          <TableCell>
            {b.discount.value}
            {b.discount.type === 'percentage' ? '%' : ' Fixed'}
          </TableCell>
          <TableCell className='text-right space-x-1'>
            <Button size='sm' onClick={() => onGenerate(b)}>
              <Ticket className='h-4 w-4 mr-2' />
              Generate Codes
            </Button>
            <Button size='icon' variant='ghost' onClick={() => onEdit(b)}>
              <FilePenLine className='h-4 w-4' />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
export default CouponBatchList;
