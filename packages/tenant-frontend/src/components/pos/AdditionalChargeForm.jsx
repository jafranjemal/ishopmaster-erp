import React, { useState } from 'react';
import { Button, Input, Label } from 'ui-library';

const AdditionalChargeForm = ({ onSave, onCancel }) => {
  const [charge, setCharge] = useState({ description: '', amount: 0 });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(charge);
  };
  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Description</Label>
        <Input
          value={charge.description}
          onChange={(e) => setCharge((p) => ({ ...p, description: e.target.value }))}
          required
          placeholder='e.g., Delivery Fee'
        />
      </div>
      <div>
        <Label>Amount</Label>
        <Input
          type='number'
          value={charge.amount}
          onChange={(e) => setCharge((p) => ({ ...p, amount: Number(e.target.value) }))}
          required
        />
      </div>
      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>Add Charge</Button>
      </div>
    </form>
  );
};
export default AdditionalChargeForm;
