import React from 'react';
import { FilePenLine, Trash2 } from 'lucide-react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';

const WarrantyPolicyList = ({ policies, onEdit, onDelete }) => {
  const formatDuration = (value, unit) => {
    if (!value || !unit) return 'N/A';
    const unitText = value === 1 ? unit.slice(0, -1) : unit;
    return `${value} ${unitText}`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Policy Name</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {policies.map((policy) => (
          <TableRow key={policy._id}>
            <TableCell className='font-medium'>{policy.name}</TableCell>
            <TableCell className='font-bold'>{formatDuration(policy.durationValue, policy.durationUnit)}</TableCell>
            <TableCell className='text-slate-400'>{policy.description}</TableCell>
            <TableCell className='text-right space-x-1'>
              <Button variant='ghost' size='icon' onClick={() => onEdit(policy)} aria-label='Edit Policy'>
                <FilePenLine className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='icon' onClick={() => onDelete(policy)} aria-label='Delete Policy'>
                <Trash2 className='h-4 w-4 text-red-500' />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default WarrantyPolicyList;
