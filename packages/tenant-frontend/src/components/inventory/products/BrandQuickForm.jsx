import React, { useState } from 'react';
import { Button, Input, Label } from 'ui-library';

const BrandQuickForm = ({ onSave, onCancel, isSaving }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Explicitly stop the event from propagating
    onSave({ name });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='name'>Brand Name</Label>
        <Input id='name' value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
      </div>
      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='button' onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
export default BrandQuickForm;
