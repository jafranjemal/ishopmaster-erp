import React from 'react';
import { FilePenLine, Trash2 } from 'lucide-react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from 'ui-library';

const TaxRuleList = ({ rules, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rule Name</TableHead>
          <TableHead>Rate</TableHead>
          <TableHead>Linked Account</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((rule) => (
          <TableRow key={rule._id}>
            <TableCell className='font-medium'>{rule.name}</TableCell>
            <TableCell>{rule.rate}%</TableCell>
            <TableCell className='text-slate-400'>{rule.linkedAccountId?.name || 'N/A'}</TableCell>

            {/* --- THE DEFINITIVE FIX: ADDED ACTION BUTTONS --- */}
            <TableCell className='text-right space-x-1'>
              <Button variant='ghost' size='icon' onClick={() => onEdit(rule)} aria-label={`Edit ${rule.name}`}>
                <FilePenLine className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='icon' onClick={() => onDelete(rule)} aria-label={`Delete ${rule.name}`}>
                <Trash2 className='h-4 w-4 text-red-500' />
              </Button>
            </TableCell>
            {/* --- END OF FIX --- */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TaxRuleList;
