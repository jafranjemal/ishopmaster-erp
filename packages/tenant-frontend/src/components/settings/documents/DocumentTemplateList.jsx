import { Brush, FilePenLine, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';

const DocumentTemplateList = ({ templates, onEdit, onDelete }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Template Name</TableHead>
        <TableHead>Applies To</TableHead>
        <TableHead>Paper Size</TableHead>
        <TableHead className='text-right'>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {templates.map((template) => (
        <TableRow key={template._id}>
          <TableCell className='font-medium'>
            {template.name} {template.isDefault && <Badge>Default</Badge>}
          </TableCell>
          <TableCell>
            <Badge variant='outline'>{template.documentType}</Badge>
          </TableCell>
          <TableCell className='text-slate-400'>{template.paperSize}</TableCell>
          <TableCell className='text-right space-x-1'>
            <Button asChild variant='outline' size='sm'>
              <Link to={`/settings/document-templates/${template._id}/design`}>
                <Brush className='h-4 w-4 mr-2' />
                Design
              </Link>
            </Button>
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
export default DocumentTemplateList;
