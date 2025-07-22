import { CheckCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from 'ui-library';
import { VariantRow } from './VariantRow';
import { createSubmissionPayload, getInitialState, isFormFullyValid } from './grnUtils';

const GoodsReceivingForm = ({ purchaseOrder, onReceive, isSaving }) => {
  const itemsToReceive = useMemo(
    () => purchaseOrder.items.filter((item) => item.quantityOrdered > item.quantityReceived),
    [purchaseOrder.items],
  );

  const [receivedItems, setReceivedItems] = useState(() => getInitialState(itemsToReceive));

  const handleItemChange = useCallback((variantId, field, value) => {
    setReceivedItems((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [field]: value },
    }));
  }, []);

  const handleQuantityChange = useCallback((variantId, newQuantity) => {
    setReceivedItems((prev) => {
      const item = prev[variantId];
      const validatedQty = Math.max(0, Math.min(newQuantity, item.maxQty));

      const updatedItem = { ...item, quantity: validatedQty };

      if (item.type === 'serialized') {
        const currentSerials = item.serials;
        const newSerials = Array(validatedQty)
          .fill(null)
          .map((_, i) => currentSerials[i] || { number: '', sellingPrice: '' });
        updatedItem.serials = newSerials;
      }
      return { ...prev, [variantId]: updatedItem };
    });
  }, []);

  const isFormValid = useMemo(() => isFormFullyValid(receivedItems), [receivedItems]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const payload = createSubmissionPayload(receivedItems);
    if (payload.receivedItems.length === 0) {
      alert('No items have been marked for receipt.');
      return;
    }
    onReceive(payload);
  };

  return (
    <Card className='mt-8'>
      <CardHeader>
        <CardTitle>Receive Items into Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='border rounded-lg'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[45%]'>Product / Variant</TableHead>
                  <TableHead className='w-[15%] text-center'>Ordered</TableHead>
                  <TableHead className='w-[15%] text-center'>Received</TableHead>
                  <TableHead className='w-[25%]'>Quantity to Receive</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsToReceive.map((poItem) => (
                  <VariantRow
                    key={poItem.productVariantId._id}
                    poItem={poItem}
                    itemState={receivedItems[poItem.productVariantId._id]}
                    onItemChange={handleItemChange}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className='pt-4 flex justify-end'>
            <Button type='submit' disabled={isSaving || !isFormValid}>
              <CheckCircle className='mr-2 h-4 w-4' />
              {isSaving ? 'Processing...' : 'Confirm Receipt & Add to Stock'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoodsReceivingForm;
