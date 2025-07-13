import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';

const CouponBatchForm = ({ batchToEdit, onSave, onCancel, isSaving }) => {
  const initial = {
    name: '',
    prefix: '',
    discount: { type: 'percentage', value: 10 },
    usageLimit: 1,
    validForDays: 30,
  };
  const [formData, setFormData] = useState(initial);
  useEffect(() => {
    if (batchToEdit) setFormData(batchToEdit);
    else setFormData(initial);
  }, [batchToEdit]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDiscountChange = (e) =>
    setFormData((prev) => ({ ...prev, discount: { ...prev.discount, [e.target.name]: e.target.value } }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className='space-y-4'
    >
      <div>
        <Label>Campaign Name</Label>
        <Input
          name='name'
          value={formData.name}
          onChange={handleChange}
          required
          placeholder='e.g., New Customer Welcome Offer'
        />
      </div>
      <div>
        <Label>Coupon Prefix</Label>
        <Input name='prefix' value={formData.prefix} onChange={handleChange} required placeholder='e.g., WELCOME10' />
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Discount Type</Label>
          <Select
            onValueChange={(val) => setFormData((prev) => ({ ...prev, discount: { ...prev.discount, type: val } }))}
            value={formData.discount.type}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='percentage'>Percentage</SelectItem>
              <SelectItem value='fixed_amount'>Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Discount Value</Label>
          <Input name='value' type='number' value={formData.discount.value} onChange={handleDiscountChange} required />
        </div>
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Usage Limit (per coupon)</Label>
          <Input name='usageLimit' type='number' min='1' value={formData.usageLimit} onChange={handleChange} />
        </div>
        <div>
          <Label>Valid For (Days)</Label>
          <Input
            name='validForDays'
            type='number'
            min='1'
            value={formData.validForDays}
            onChange={handleChange}
            placeholder='Leave blank for no expiry'
          />
        </div>
      </div>
      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Campaign'}
        </Button>
      </div>
    </form>
  );
};
export default CouponBatchForm;
