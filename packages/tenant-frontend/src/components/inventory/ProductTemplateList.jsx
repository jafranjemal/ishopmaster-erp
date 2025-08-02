import { FilePenLine, Library, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';

const ProductTemplateList = ({ templates, onEdit, onDelete }) => {
  if (!templates || templates.length === 0) {
    return (
      <div className='text-center py-12 text-slate-400'>
        <Library className='mx-auto h-12 w-12' />
        <h3 className='mt-2 text-lg font-semibold'>No Templates Found</h3>
        <p className='mt-1 text-sm'>Get started by creating a new templates or change the search filters</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Template Name</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Default Warranty</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Variants</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template._id}>
            <TableCell className='font-medium'>
              {/* The name links to the future detail page where we'll generate variants */}
              <Link to={`templates/${template._id}`} className='hover:text-indigo-300 hover:underline'>
                {template.baseName}
              </Link>
            </TableCell>
            <TableCell className='text-slate-400'>{template.brandId?.name || 'N/A'}</TableCell>
            <TableCell className='text-slate-400'>{template.categoryId?.name || 'N/A'}</TableCell>
            <TableCell>
              {template.defaultWarrantyPolicyId ? (
                <Badge variant='outline' className='flex items-center w-fit'>
                  <ShieldCheck className='h-3 w-3 mr-1.5 text-green-400' />
                  {template.defaultWarrantyPolicyId.name}
                </Badge>
              ) : (
                <span className='text-xs text-slate-500'>—</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant='secondary' className='capitalize'>
                {template.type}
              </Badge>
            </TableCell>
            <TableCell className='text-center'>
              <Badge variant='outline'>{template.variantCount}</Badge>
            </TableCell>
            <TableCell className='text-right space-x-2'>
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
};

export default ProductTemplateList;
