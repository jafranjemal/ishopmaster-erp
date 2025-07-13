import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';

const DURATION_UNITS = ['days', 'months', 'years'];

const WarrantyPolicyForm = ({ policyToEdit, onSave, onCancel, isSaving }) => {
  const initialFormState = { name: '', description: '', durationValue: 1, durationUnit: 'months' };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (policyToEdit) {
      setFormData({
        name: policyToEdit.name || '',
        description: policyToEdit.description || '',
        durationValue: policyToEdit.durationValue || 1,
        durationUnit: policyToEdit.durationUnit || 'months',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [policyToEdit]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (value) => setFormData((prev) => ({ ...prev, durationUnit: value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='name'>Policy Name</Label>
        <Input
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          required
          placeholder='e.g., 1-Year Limited Warranty'
        />
      </div>
      <div>
        <Label htmlFor='description'>Description (Optional)</Label>
        <Input id='description' name='description' value={formData.description} onChange={handleChange} />
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='durationValue'>Duration</Label>
          <Input
            id='durationValue'
            name='durationValue'
            type='number'
            min='1'
            value={formData.durationValue}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Unit</Label>
          <Select onValueChange={handleSelectChange} value={formData.durationUnit}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATION_UNITS.map((u) => (
                <SelectItem key={u} value={u} className='capitalize'>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='pt-4 flex justify-end space-x-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Policy'}
        </Button>
      </div>
    </form>
  );
};
export default WarrantyPolicyForm;
