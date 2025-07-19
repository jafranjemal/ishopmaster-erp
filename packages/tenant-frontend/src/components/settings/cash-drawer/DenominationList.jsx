import React from 'react';
import { FilePenLine, Trash2 } from 'lucide-react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import useAuth from '../../../context/useAuth';

const DenominationList = ({ denominations, onEdit, onDelete }) => {
  const { formatCurrency } = useAuth();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {denominations.map((d) => (
          <TableRow key={d._id}>
            <TableCell className='font-medium'>{d.name}</TableCell>
            <TableCell className='font-mono'>{formatCurrency(d.value)}</TableCell>
            <TableCell className='capitalize text-slate-400'>{d.type}</TableCell>
            <TableCell className='text-right space-x-1'>
              <Button variant='ghost' size='icon' onClick={() => onEdit(d)}>
                <FilePenLine className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='icon' onClick={() => onDelete(d)}>
                <Trash2 className='h-4 w-4 text-red-500' />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default DenominationList;
