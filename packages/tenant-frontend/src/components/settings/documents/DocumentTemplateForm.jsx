import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui-library';

const DOCUMENT_TYPES = ['SalesInvoice', 'RepairTicket', 'PurchaseOrder'];
const PAPER_SIZES = ['A4', 'A5', 'Letter', 'Thermal-80mm'];

const DocumentTemplateForm = ({ templateToEdit, onSave, onCancel, isSaving }) => {
  const initial = { name: '', documentType: 'SalesInvoice', paperSize: 'A4', isDefault: false };
  const [formData, setFormData] = useState(initial);

  useEffect(() => {
    if (templateToEdit) setFormData({ ...initial, ...templateToEdit });
    else setFormData(initial);
  }, [templateToEdit]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Template Name</Label>
        <Input
          name='name'
          value={formData.name}
          onChange={handleChange}
          required
          placeholder='e.g., Standard A4 Invoice'
        />
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Document Type</Label>
          <Select
            onValueChange={(val) => handleSelectChange('documentType', val)}
            value={formData.documentType}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Paper Size</Label>
          <Select onValueChange={(val) => handleSelectChange('paperSize', val)} value={formData.paperSize} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAPER_SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        <Checkbox
          id='isDefault'
          checked={formData.isDefault}
          onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
        />
        <Label htmlFor='isDefault'>Make this the default template for this document type?</Label>
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
export default DocumentTemplateForm;
