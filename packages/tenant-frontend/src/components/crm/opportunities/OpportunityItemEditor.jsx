import React, { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input, Modal } from 'ui-library';
import { PlusCircle, Trash2 } from 'lucide-react';

import useAuth from '../../../context/useAuth';
import ProductVariantSearch from '../../procurement/ProductVariantSearch';

const OpportunityItemEditor = ({ items = [], onAddItem, onRemoveItem, onUpdateItem }) => {
  const { formatCurrency } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleProductSelect = (variant) => {
    onAddItem({
      productVariantId: variant._id,
      description: variant.variantName,
      quantity: 1,
      unitPrice: variant.sellingPrice,
      finalPrice: variant.sellingPrice,
    });
    setIsSearchModalOpen(false);
  };

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-semibold'>Deal Items</h3>
        <Button size='sm' onClick={() => setIsSearchModalOpen(true)}>
          <PlusCircle className='h-4 w-4 mr-2' />
          Add Product/Service
        </Button>
      </div>
      <div className='border border-slate-700 rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Final Price</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-slate-400'>
                  No items added to this opportunity yet.
                </TableCell>
              </TableRow>
            )}
            {items.map((item, index) => (
              <TableRow key={item.productVariantId}>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <Input
                    type='number'
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(index, 'quantity', Number(e.target.value))}
                    className='w-20 h-8'
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type='number'
                    value={item.unitPrice}
                    onChange={(e) => onUpdateItem(index, 'unitPrice', Number(e.target.value))}
                    className='w-24 h-8'
                  />
                </TableCell>
                <TableCell className='font-mono'>{formatCurrency(item.finalPrice)}</TableCell>
                <TableCell className='text-right'>
                  <Button variant='ghost' size='icon' onClick={() => onRemoveItem(index)}>
                    <Trash2 className='h-4 w-4 text-red-500' />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Modal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} title='Add Product or Service'>
        <ProductVariantSearch onProductSelect={handleProductSelect} />
      </Modal>
    </div>
  );
};
export default OpportunityItemEditor;
