import { PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Input, Label } from 'ui-library';

const QcTemplateForm = ({ templateToEdit, onSave, onCancel, isSaving }) => {
  const [name, setName] = useState('');
  const [items, setItems] = useState([{ task: '' }]);

  useEffect(() => {
    if (templateToEdit) {
      setName(templateToEdit.name);
      setItems(templateToEdit.items.length > 0 ? templateToEdit.items : [{ task: '' }]);
    } else {
      setName('');
      setItems([{ task: '' }]);
    }
  }, [templateToEdit]);

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index].task = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { task: '' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalItems = items.filter((item) => item.task.trim() !== '');
    if (finalItems.length === 0) {
      alert('Please add at least one checklist task.');
      return;
    }
    onSave({ name, items: finalItems });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Template Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder='e.g., iPhone Screen Replacement QC'
        />
      </div>
      <div className='space-y-2'>
        <Label>Checklist Items</Label>
        {items.map((item, index) => (
          <div key={index} className='flex items-center gap-2'>
            <Input
              value={item.task}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={`Task #${index + 1}`}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
            >
              <Trash2 className='h-4 w-4 text-red-500' />
            </Button>
          </div>
        ))}
        <Button type='button' variant='outline' size='sm' onClick={addItem}>
          <PlusCircle className='h-4 w-4 mr-2' />
          Add Task
        </Button>
      </div>
      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Template'}
        </Button>
      </div>
    </form>
  );
};
export default QcTemplateForm;
