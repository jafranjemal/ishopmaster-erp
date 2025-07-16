import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from 'ui-library';

/**
 * The definitive form for creating or editing a Tax Rule.
 * It correctly links to a TaxCategory, not a ProductCategory.
 */
const TaxRuleForm = ({ isOpen, ruleToEdit, accounts, branches, taxCategories, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    isCompound: false,
    priority: 10,
    taxCategoryId: null,
    branchId: null,
    linkedAccountId: '',
  });

  const isFormReady = accounts.length > 0 && branches.length > 0 && taxCategories.length > 0;

  useEffect(() => {
    if (!isOpen) return;
    if (ruleToEdit === undefined) return;
    if (!isOpen || !isFormReady) return;
    if (isOpen && ruleToEdit?._id) {
      setFormData({
        name: ruleToEdit.name || '',
        rate: ruleToEdit.rate || 0,
        isCompound: ruleToEdit.isCompound || false,
        priority: ruleToEdit.priority || 10,
        taxCategoryId: ruleToEdit.taxCategoryId?._id || '',
        branchId: ruleToEdit.branchId?._id || '',
        linkedAccountId: ruleToEdit.linkedAccountId?._id || '',
      });
    } else if (isOpen && !ruleToEdit) {
      setFormData({
        name: '',
        rate: 0,
        isCompound: false,
        priority: 10,
        taxCategoryId: null,
        branchId: null,
        linkedAccountId: null,
      });
    }
  }, [ruleToEdit, ruleToEdit?._id, isFormReady, isOpen]);

  const liabilityAccounts = useMemo(() => accounts.filter((a) => a.type === 'Liability'), [accounts]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => {
    if (!isFormReady) {
      console.warn(`⏳ Skipped setting ${name} — form data not fully loaded.`);
      return;
    }
    console.log('name, value ', name, typeof value, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label htmlFor='name'>Rule Name</Label>
        <Input
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          required
          placeholder='e.g., VAT 15%'
        />
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Rate (%)</Label>
          <Input type='number' name='rate' value={formData.rate} onChange={handleChange} required />
        </div>
        <div>
          <Label>Priority</Label>
          <Input type='number' name='priority' value={formData.priority} onChange={handleChange} required />
        </div>
      </div>

      {/* --- THE DEFINITIVE FIX: Dropdown now populates from taxCategories --- */}
      <div>
        <Label>Target Tax Category (Optional)</Label>
        <Select
          disabled={!isFormReady}
          onValueChange={(val) => val !== '' && handleSelectChange('taxCategoryId', val)}
          value={formData.taxCategoryId}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Tax Categories' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Categories</SelectItem>
            {taxCategories.map((tc) => (
              <SelectItem key={tc._id} value={tc._id}>
                {tc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className='text-xs text-slate-400 mt-1'>Leave blank to apply to all products.</p>
      </div>
      {/* --- END OF FIX --- */}

      <div>
        <Label>Target Branch (Optional)</Label>
        <Select
          disabled={!isFormReady}
          onValueChange={(val) => val !== '' && handleSelectChange('branchId', val)}
          value={formData.branchId}
        >
          <SelectTrigger>
            <SelectValue placeholder='All Branches' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b._id} value={b._id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {accounts.length > 0 && liabilityAccounts.length > 0 && (
        <div>
          <Label>Linked Liability Account</Label>
          <Select
            disabled={!isFormReady}
            onValueChange={(val) => val !== '' && handleSelectChange('linkedAccountId', val)}
            value={formData.linkedAccountId}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder='Select account...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='__none__'>None (No Liability Account)</SelectItem>
              {liabilityAccounts.map((a) => (
                <SelectItem key={a._id} value={a._id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className='flex items-center space-x-2'>
        <Checkbox
          id='isCompound'
          checked={formData.isCompound}
          onCheckedChange={(checked) => setFormData({ ...formData, isCompound: checked })}
        />
        <Label htmlFor='isCompound'>Is this a compound tax? (Calculated on top of other taxes)</Label>
      </div>

      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Rule'}
        </Button>
      </div>
    </form>
  );
};

export default TaxRuleForm;
