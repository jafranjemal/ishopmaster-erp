import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';

/**
 * The definitive, intelligent form for creating categories and sub-categories on the fly.
 * It uses a recursive function to display the full hierarchy in the dropdown and
 * provides a dynamic label to give the user clear context.
 */
const CategoryQuickForm = ({ categories, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({ name: '', parent: null });
  const [parentName, setParentName] = useState('Top-Level');

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Explicitly stop the event from propagating
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleParentSelect = (value) => {
    // Find the selected category object to get its name for the dynamic label

    const findCategoryName = (nodes, id, path = []) => {
      for (const node of nodes) {
        const currentPath = [...path, node.name];
        if (node._id === id) return currentPath.join(' > ');
        if (node.children) {
          const found = findCategoryName(node.children, id, currentPath);
          if (found) return found;
        }
      }

      return null;
    };

    const name = findCategoryName(categories, value) || 'Top-Level';
    setParentName(name);
    setFormData({ ...formData, parent: value });
  };

  // Your brilliant recursive function to generate indented options
  const generateCategoryOptions = (categories, level = 0) => {
    let options = [];
    for (const category of categories) {
      options.push(
        <SelectItem key={category._id} value={category._id}>
          {/* Using non-breaking spaces for indentation */}
          {'\u00A0'.repeat(level * 4)} {level > 0 ? '↳ ' : ''}
          {category.name}
        </SelectItem>,
      );
      if (category.children && category.children.length > 0) {
        options = options.concat(generateCategoryOptions(category.children, level + 1));
      }
    }
    return options;
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Parent Category (Optional)</Label>
        <Select onValueChange={handleParentSelect} value={formData.parent}>
          <SelectTrigger>
            <SelectValue placeholder='Select to create a sub-category...' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>-- Create as Top-Level Category --</SelectItem>
            {generateCategoryOptions(categories)}
          </SelectContent>
        </Select>
      </div>

      <div>
        {/* --- THE DEFINITIVE FIX: DYNAMIC LABEL --- */}
        <Label htmlFor='name'>New Category Name (under "{parentName}")</Label>
        <Input id='name' name='name' value={formData.name} onChange={handleChange} required autoFocus />
      </div>

      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='button' onClick={handleSubmit} disabled={isSaving || !formData.name}>
          {isSaving ? 'Saving...' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryQuickForm;
