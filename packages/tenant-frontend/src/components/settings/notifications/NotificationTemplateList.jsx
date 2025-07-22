import { FilePenLine, Trash2 } from 'lucide-react';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';

const NotificationTemplateList = ({ templates, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Template Name</TableHead>
        <TableHead>Event</TableHead>
        <TableHead>Channel</TableHead>
        <TableHead>Recipient</TableHead>
        <TableHead className='text-right'>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {templates.map((template) => (
        <TableRow key={template._id}>
          <TableCell className='font-medium'>{template.name}</TableCell>
          <TableCell className='font-mono text-xs'>{template.eventName}</TableCell>
          <TableCell>
            <Badge variant='outline' className='capitalize'>
              {template.channel}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge variant='secondary' className='capitalize'>
              {template.recipientType.replace('_', ' ')}
            </Badge>
          </TableCell>
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
export default NotificationTemplateList;
