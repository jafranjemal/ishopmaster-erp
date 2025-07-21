import { useState } from 'react';
import { Button, Input, Label } from 'ui-library';

const FlagRequoteForm = ({ onConfirm, onCancel, isSaving }) => {
  const [notes, setNotes] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ notes });
  };
  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Reason for Re-Quote</Label>
        <Input
          as='textarea'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
          placeholder='e.g., Discovered additional damage to the logic board.'
        />
      </div>
      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving || !notes}>
          {isSaving ? 'Submitting...' : 'Flag Ticket'}
        </Button>
      </div>
    </form>
  );
};
export default FlagRequoteForm;
