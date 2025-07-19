import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';

const DenominationForm = ({ itemToEdit, onSave, onCancel, isSaving }) => {
  const initial = { name: '', value: '', type: 'bill' };
  const [formData, setFormData] = useState(initial);
  useEffect(() => {
    if (itemToEdit) setFormData(itemToEdit);
    else setFormData(initial);
  }, [itemToEdit]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, value: Number(formData.value) });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Denomination Name</Label>
        <Input name='name' value={formData.name} onChange={handleChange} required placeholder='e.g., 5000 LKR Note' />
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Value</Label>
          <Input
            name='value'
            type='number'
            value={formData.value}
            onChange={handleChange}
            required
            placeholder='e.g., 5000'
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select onValueChange={(val) => setFormData((prev) => ({ ...prev, type: val }))} value={formData.type}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='bill'>Bill</SelectItem>
              <SelectItem value='coin'>Coin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};
export default DenominationForm;
