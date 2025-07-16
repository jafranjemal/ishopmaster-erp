import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import useAuth from '../../context/useAuth';

const JobSheetEditorModal = ({ isOpen, onClose, onSave, item }) => {
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [discount, setDiscount] = useState({ type: 'fixed', value: 0 });
  const { user } = useAuth();
  const canApplyDiscount = user?.permissions?.includes('sales:pos:apply_discount');

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
      setDiscount(item.lineDiscount || { type: 'fixed', value: 0 });
    }
  }, [item]);

  const handleSave = () => {
    onSave(item.cartId, { quantity, lineDiscount: discount });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit: ${item?.description}`}>
      <div className='space-y-4'>
        <div>
          <Label>Quantity</Label>
          <Input type='number' value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        </div>
        {canApplyDiscount && (
          <div className='border-t border-slate-700 pt-4 space-y-2'>
            <Label>Apply Line-Item Discount</Label>
            <div className='grid grid-cols-2 gap-2'>
              <Select onValueChange={(val) => setDiscount((prev) => ({ ...prev, type: val }))} value={discount.type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='fixed'>Fixed</SelectItem>
                  <SelectItem value='percentage'>Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type='number'
                value={discount.value}
                onChange={(e) => setDiscount((prev) => ({ ...prev, value: Number(e.target.value) }))}
              />
            </div>
          </div>
        )}
        <div className='pt-4 flex justify-end'>
          <Button onClick={handleSave}>Update Item</Button>
        </div>
      </div>
    </Modal>
  );
};
export default JobSheetEditorModal;
