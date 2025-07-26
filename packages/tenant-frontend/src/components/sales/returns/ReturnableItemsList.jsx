import { Checkbox, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import useAuth from '../../../context/useAuth';

const ReturnableItemsList = ({ items, selectedItems, onSelectionChange }) => {
  const { formatCurrency } = useAuth();

  const handleCheckboxChange = (itemId, checked) => {
    const newSelection = { ...selectedItems };
    if (checked) {
      const item = items.find((i) => i.productVariantId === itemId);
      newSelection[itemId] = { ...item, quantity: 1 }; // Default to returning 1
    } else {
      delete newSelection[itemId];
    }
    onSelectionChange(newSelection);
  };

  const handleQuantityChange = (itemId, quantity) => {
    const item = items.find((i) => i.productVariantId === itemId);
    const maxQuantity = item.quantity;
    const newQuantity = Math.max(1, Math.min(quantity, maxQuantity));

    const newSelection = { ...selectedItems };
    newSelection[itemId].quantity = newQuantity;
    onSelectionChange(newSelection);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-12'></TableHead>
          <TableHead>Item Description</TableHead>
          <TableHead>Original Qty</TableHead>
          <TableHead>Return Qty</TableHead>
          <TableHead className='text-right'>Unit Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.productVariantId}>
            <TableCell>
              <Checkbox
                checked={!!selectedItems[item.productVariantId]}
                onCheckedChange={(checked) => handleCheckboxChange(item.productVariantId, checked)}
              />
            </TableCell>
            <TableCell className='font-medium'>{item.description}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>
              {!!selectedItems[item.productVariantId] && (
                <Input
                  type='number'
                  className='w-20 h-8'
                  value={selectedItems[item.productVariantId].quantity}
                  onChange={(e) => handleQuantityChange(item.productVariantId, parseInt(e.target.value, 10))}
                  max={item.quantity}
                  min='1'
                />
              )}
            </TableCell>
            <TableCell className='text-right font-mono'>{formatCurrency(item.finalPrice)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ReturnableItemsList;
