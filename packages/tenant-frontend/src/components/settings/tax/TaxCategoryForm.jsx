import React, { useState, useEffect } from 'react';
import { Button, Input, Label } from 'ui-library';

const TaxCategoryForm = ({ categoryToEdit, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  useEffect(() => {
    if (categoryToEdit) setFormData({ name: categoryToEdit.name, description: categoryToEdit.description || '' });
    else setFormData({ name: '', description: '' });
  }, [categoryToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='name'>Tax Category Name</Label>
        <Input
          id='name'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder='e.g., Standard Rate, Zero-Rated'
        />
      </div>
      <div>
        <Label htmlFor='description'>Description (Optional)</Label>
        <Input
          id='description'
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
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
export default TaxCategoryForm;
