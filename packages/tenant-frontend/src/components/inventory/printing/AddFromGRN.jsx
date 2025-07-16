import React, { useState } from 'react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import { tenantGrnService } from '../../../services/api';
import { toast } from 'react-hot-toast';

const AddFromGRN = ({ grns = [], onAddItems }) => {
  const [selectedGrnId, setSelectedGrnId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!selectedGrnId) return;
    setIsLoading(true);
    try {
      const response = await tenantGrnService.getById(selectedGrnId);
      const grn = response.data.data;

      // Transform the GRN items into the format our print queue expects
      const itemsToAdd = grn.items.map((item) => ({
        productVariantId: item.productVariantId._id,
        variantName: item.productVariantId.variantName,
        sku: item.productVariantId.sku,
        quantity: item.quantityReceived,
        // Pass along the serials if they exist
        isSerialized: item.receivedSerials && item.receivedSerials.length > 0,
        serials: item.receivedSerials || [],
        batchNumber: grn.purchaseOrderId?.poNumber || 'N/A',
      }));
      onAddItems(itemsToAdd);
      toast.success(`${itemsToAdd.length} item(s) from GRN #${grn.grnNumber} added to queue.`);
      setSelectedGrnId(''); // Reset dropdown
    } catch (error) {
      console.log(error);
      toast.error('Could not fetch GRN details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-end gap-2'>
      <div className='flex-grow'>
        <Select onValueChange={setSelectedGrnId} value={selectedGrnId}>
          <SelectTrigger>
            <SelectValue placeholder='Choose a recent delivery...' />
          </SelectTrigger>
          <SelectContent>
            {grns.map((g) => (
              <SelectItem key={g._id} value={g._id}>
                {g.grnNumber} - {g.supplierId.name} ({new Date(g.receivedDate).toLocaleDateString()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleAdd} disabled={!selectedGrnId || isLoading}>
        {isLoading ? 'Loading...' : 'Add Items to Queue'}
      </Button>
    </div>
  );
};

export default AddFromGRN;
