import React, { useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';

const GlobalDiscountForm = ({ onSave, onCancel, isSaving }) => {
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0, reason: '' });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(discount);
  };
  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-2 gap-2'>
        <Select onValueChange={(val) => setDiscount((p) => ({ ...p, type: val }))} value={discount.type}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='percentage'>Percentage (%)</SelectItem>
            <SelectItem value='fixed'>Fixed Amount</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type='number'
          value={discount.value}
          onChange={(e) => setDiscount((p) => ({ ...p, value: Number(e.target.value) }))}
          required
        />
      </div>
      <div>
        <Label>Reason (Optional)</Label>
        <Input value={discount.reason} onChange={(e) => setDiscount((p) => ({ ...p, reason: e.target.value }))} />
      </div>
      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving}>
          Apply Discount
        </Button>
      </div>
    </form>
  );
};
export default GlobalDiscountForm;
