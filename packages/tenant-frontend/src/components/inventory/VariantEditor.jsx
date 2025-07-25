import React, { useState, useEffect } from 'react';
import { Badge, Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import { toast } from 'react-hot-toast';
import { tenantProductService } from '../../services/api';
import { Barcode, Trash2, Wrench, ImageIcon } from 'lucide-react';
import VariantImageManager from './VariantImageManager';

const VariantEditor = ({ variants, onPrint, onDelete, onDataRefetch, onManageParts }) => {
  const [editedVariants, setEditedVariants] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedVariantForImage, setSelectedVariantForImage] = useState(null);

  useEffect(() => {
    setEditedVariants({});
  }, [variants]);

  const handleChange = (variantId, field, value) => {
    setEditedVariants((prev) => ({
      ...prev,
      [variantId]: {
        ...variants.find((v) => v._id === variantId), // Start with original data
        ...prev[variantId], // Apply previous edits for this variant
        [field]: value, // Apply the new change
      },
    }));
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    const variantsToUpdate = Object.values(editedVariants).map((v) => ({
      _id: v._id,
      sku: v.sku,
      sellingPrice: v.sellingPrice,
      costPrice: v.costPrice,
    }));

    // This is a placeholder until we build the bulk update API
    await toast.promise(tenantProductService.bulkUpdateVariants(variantsToUpdate), {
      loading: 'Saving changes...',
      success: 'Variants updated successfully!',
      error: 'Could not save changes.',
    });

    setIsSaving(false);
    setEditedVariants({}); // Clear changes after saving
  };

  const handleOpenImageModal = (variant) => {
    setSelectedVariantForImage(variant);
    setIsImageModalOpen(true);
  };

  const handleUploadSuccess = () => {
    setIsImageModalOpen(false);
    // ✅ 3. Call the refetch function passed from the parent page
    // This is the best practice to ensure the data is always fresh.
    if (onDataRefetch) {
      onDataRefetch();
    }
  };

  return (
    <div className='space-y-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-20 text-center'>Image</TableHead>
            <TableHead>Variant Name </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Cost Price</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead className='text-center'>Qty in Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant._id}>
              <TableCell className='p-2'>
                <div
                  className='w-16 h-16 bg-slate-700/50 rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-600'
                  onClick={() => handleOpenImageModal(variant)}
                >
                  {/* ✅ 4. Display the FIRST image from the new `images` array */}
                  {variant.images && variant.images[0] ? (
                    <img
                      src={variant.images[0].url}
                      alt={variant.name}
                      className='w-full h-full object-cover rounded-md'
                    />
                  ) : (
                    <ImageIcon className='h-6 w-6 text-slate-400' />
                  )}
                </div>
              </TableCell>
              <TableCell className='font-medium text-slate-300'>
                {variant.variantName &&
                  variant.variantName.length > 0 &&
                  variant.variantName.split(' - ').map((name, index) => {
                    if (index === 0) {
                      return (
                        <span key={index} className='mr-2 text-slate-100 font-semibold'>
                          {name}
                        </span>
                      );
                    }
                    return (
                      <Badge key={index} className='mr-1 mb-1 bg-slate-700 text-slate-100 border-slate-500'>
                        {name}
                      </Badge>
                    );
                  })}

                {variant.templateId?.type === 'service' && variant.templateId?.requiredParts?.length > 0 && (
                  <Badge onClick={() => onManageParts(variant)} variant='info' className='cursor-pointer ml-2'>
                    Includes {variant.templateId.requiredParts.length} Parts
                  </Badge>
                )}
              </TableCell>

              <TableCell>
                <Input
                  value={variant.sku}
                  onChange={(e) => handleChange(variant._id, 'sku', e.target.value)}
                  className='h-8'
                />
              </TableCell>
              <TableCell>
                <Input
                  type='number'
                  value={variant.costPrice}
                  onChange={(e) => handleChange(variant._id, 'costPrice', e.target.value)}
                  className='h-8'
                />
              </TableCell>
              <TableCell>
                <Input
                  type='number'
                  value={variant.sellingPrice}
                  onChange={(e) => handleChange(variant._id, 'sellingPrice', e.target.value)}
                  className='h-8'
                />
              </TableCell>
              <TableCell className='text-center font-bold'>{variant.quantityInStock || 0}</TableCell>

              <TableCell className='text-right'>
                {/* --- THE DEFINITIVE FIX --- */}

                {variant.templateId?.type === 'service' && (
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => onManageParts(variant)}
                    title='Manage Required Parts'
                  >
                    <Wrench className='h-4 w-4' />
                  </Button>
                )}

                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => onDelete(variant._id)}
                  aria-label='Deactivate Variant'
                  // Disable if variant is already inactive or has stock
                  disabled={!variant.isActive || (variant.quantityInStock && variant.quantityInStock > 0)}
                  title={!variant.isActive ? 'Variant is already inactive' : 'Deactivate Variant'}
                >
                  <Trash2 className='h-4 w-4 text-slate-500 hover:text-red-500' />
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => onPrint(variant)}
                  aria-label='Print Barcode'
                  disabled={!variant.quantityInStock || variant.quantityInStock <= 0} // Button is disabled if stock is 0
                >
                  <Barcode className='h-4 w-4' />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className='pt-4 text-right'>
        <Button onClick={handleSaveClick} disabled={isSaving || Object.keys(editedVariants).length === 0}>
          {isSaving ? 'Saving Changes...' : 'Save All Variant Changes'}
        </Button>
      </div>

      {selectedVariantForImage && isImageModalOpen && (
        <VariantImageManager
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          variant={selectedVariantForImage}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default VariantEditor;
