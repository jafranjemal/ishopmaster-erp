import { useEffect, useRef, useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import { tenantNotificationTemplateService } from '../../../services/api';
import PlaceholderToolbox from './PlaceholderToolbox';

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
  const [allEvents, setAllEvents] = useState([]);
  const bodyRef = useRef(null);

  useEffect(() => {
    tenantNotificationTemplateService.getNotificationEvents().then((res) => setAllEvents(res.data.data));
  }, []);

  useEffect(() => {
    if (templateToEdit) setFormData({ ...initial, ...templateToEdit });
    else setFormData(initial);
  }, [templateToEdit]);

  const handleInsertPlaceholder = (placeholder) => {
    const textarea = bodyRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      setFormData((prev) => ({ ...prev, body: newText }));
      // Focus and move cursor after the inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      }, 0);
    }
  };

  const selectedEvent = allEvents.find((e) => e.eventName === formData.eventName);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => {
    if (value === formData[name]) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Template Name</Label>
        <Input name='name' value={formData.name} onChange={handleChange} required />
      </div>
      <div className='grid md:grid-cols-3 gap-4'>
        <div>
          <Label>Event Trigger</Label>
          <Select onValueChange={(val) => handleSelectChange('eventName', val)} value={formData.eventName} required>
            <SelectTrigger>
              <SelectValue placeholder='Select event...' />
            </SelectTrigger>
            <SelectContent>
              {allEvents.map((e) => (
                <SelectItem key={e.eventName} value={e.eventName}>
                  {e.eventName}
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
          <Input name='subject' value={formData.subject} onChange={handleChange} required />
        </div>
      )}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-start'>
        <div className='md:col-span-2'>
          <Label>Message Body</Label>
          <Input
            as='textarea'
            ref={bodyRef}
            name='body'
            value={formData.body}
            onChange={handleChange}
            required
            rows={10}
          />
        </div>
        <div>
          <PlaceholderToolbox variables={selectedEvent?.variables} onInsert={handleInsertPlaceholder} />
        </div>
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
