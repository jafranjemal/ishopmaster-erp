import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Input,
  Label,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui-library';

import { PlusCircle, Trash2 } from 'lucide-react';
import ProductVariantSearch from '../../procurement/ProductVariantSearch';

const RequiredPartsModal = ({ isOpen, onClose, onSave, isSaving, initialParts = [], serviceName }) => {
  const [parts, setParts] = useState(initialParts);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setParts(initialParts);
  }, [initialParts]);

  const handleAddPart = (variant) => {
    if (parts.some((p) => p.productVariantId === variant._id)) return; // Prevent duplicates
    const newPart = {
      productVariantId: variant._id,
      variantName: variant.variantName, // For display
      quantity: 1,
    };
    setParts((prev) => [...prev, newPart]);
    setIsSearchOpen(false);
  };

  const handleQuantityChange = (variantId, newQty) => {
    setParts((prev) =>
      prev.map((p) => (p.productVariantId === variantId ? { ...p, quantity: Math.max(1, Number(newQty)) } : p)),
    );
  };

  const handleRemovePart = (variantId) => {
    setParts((prev) => prev.filter((p) => p.productVariantId !== variantId));
  };

  const handleSaveChanges = () => {
    onSave(parts);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Required Parts for "${serviceName}"`} size='2xl'>
      <div className='space-y-4'>
        <div className='flex justify-end'>
          <Button size='sm' onClick={() => setIsSearchOpen(true)}>
            <PlusCircle className='h-4 w-4 mr-2' />
            Add Part
          </Button>
        </div>
        <div className='border border-slate-700 rounded-lg max-h-[400px] overflow-y-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead className='w-24'>Quantity</TableHead>
                <TableHead className='w-12'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className='text-center h-24 text-slate-400'>
                    No required parts added.
                  </TableCell>
                </TableRow>
              )}

              {parts.map((part) => (
                <TableRow key={part.productVariantId}>
                  <TableCell className='font-medium'>{part?.productVariant?.variantName || part.variantName}</TableCell>
                  <TableCell>
                    <Input
                      type='number'
                      value={part.quantity}
                      onChange={(e) => handleQuantityChange(part.productVariantId, e.target.value)}
                      className='h-8 w-20'
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant='ghost' size='icon' onClick={() => handleRemovePart(part.productVariantId)}>
                      <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className='pt-4 flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      <Modal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} title='Search for Spare Part to Add'>
        <Card className='min-h-[50vh] overflow-y-auto'>
          <ProductVariantSearch onProductSelect={handleAddPart} />
        </Card>
      </Modal>
    </Modal>
  );
};
export default RequiredPartsModal;
