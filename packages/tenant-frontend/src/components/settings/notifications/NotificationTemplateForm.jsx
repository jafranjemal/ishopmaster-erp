import { useEffect, useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';

// In a real ERP, this list would be dynamically generated and managed centrally
const EVENT_NAMES = [
  'repair.status_changed.diagnosing',
  'repair.status_changed.quote_pending',
  'repair.status_changed.approval_pending',
  'repair.status_changed.repair_active',
  'repair.status_changed.qc_pending',
  'repair.status_changed.pickup_pending',
  'repair.status_changed.closed',
];

const RECIPIENT_TYPES = ['customer', 'assigned_technician', 'branch_manager'];
const CHANNELS = ['email', 'sms'];

const NotificationTemplateForm = ({ templateToEdit, onSave, onCancel, isSaving }) => {
  const initial = {
    name: '',
    eventName: '',
    channel: 'email',
    recipientType: 'customer',
    subject: '',
    body: '',
    isActive: true,
  };
  const [formData, setFormData] = useState(initial);

  useEffect(() => {
    if (templateToEdit) setFormData({ ...initial, ...templateToEdit });
    else setFormData(initial);
  }, [templateToEdit]);

  const handleSelectChange = (name, value) => {
    if (value === formData[name]) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
          placeholder='e.g., Customer Quote Ready (Email)'
        />
      </div>
      <div className='grid md:grid-cols-3 gap-4'>
        <div>
          <Label>Event Trigger</Label>
          <Select onValueChange={(val) => handleSelectChange('eventName', val)} value={formData.eventName} required>
            <SelectTrigger>
              <SelectValue placeholder='Select event...' />
            </SelectTrigger>
            <SelectContent>
              {EVENT_NAMES.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Channel</Label>
          <Select onValueChange={(val) => handleSelectChange('channel', val)} value={formData.channel} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNELS.map((c) => (
                <SelectItem key={c} value={c} className='capitalize'>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Recipient</Label>
          <Select
            onValueChange={(val) => handleSelectChange('recipientType', val)}
            value={formData.recipientType}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECIPIENT_TYPES.map((r) => (
                <SelectItem key={r} value={r} className='capitalize'>
                  {r.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {formData.channel === 'email' && (
        <div>
          <Label>Email Subject</Label>
          <Input
            name='subject'
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder='e.g., Update on your Repair #{{ticket.ticketNumber}}'
          />
        </div>
      )}
      <div>
        <Label>Message Body</Label>
        <Input
          as='textarea'
          name='body'
          value={formData.body}
          onChange={handleChange}
          required
          rows={8}
          placeholder='Use {{variableName}} for dynamic content.'
        />
      </div>
      <div className='text-xs text-slate-400'>
        Available variables: {'{{ticket.ticketNumber}}'}, {'{{customer.name}}'}, {'{{asset.name}}'}
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
export default NotificationTemplateForm;
