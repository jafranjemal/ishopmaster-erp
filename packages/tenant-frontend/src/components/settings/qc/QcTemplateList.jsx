import { FilePenLine, Trash2 } from 'lucide-react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';

const QcTemplateList = ({ templates, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Template Name</TableHead>
        <TableHead># of Items</TableHead>
        <TableHead className='text-right'>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {templates.map((template) => (
        <TableRow key={template._id}>
          <TableCell className='font-medium'>{template.name}</TableCell>
          <TableCell>{template.items.length}</TableCell>
          <TableCell className='text-right space-x-1'>
            <Button variant='ghost' size='icon' onClick={() => onEdit(template)}>
              <FilePenLine className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='icon' onClick={() => onDelete(template)}>
              <Trash2 className='h-4 w-4 text-red-500' />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
export default QcTemplateList;
