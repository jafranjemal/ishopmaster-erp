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

const DEVICE_TYPES = ['printer', 'cash_drawer', 'customer_display', 'scanner'];
const DRIVER_TYPES = ['escpos', 'cups', 'windows_native', 'serial'];
const CONNECTION_TYPES = ['ip', 'usb', 'serial'];

const HardwareDeviceForm = ({ deviceToEdit, onSave, onCancel, isSaving, branches = [] }) => {
  const initial = {
    name: '',
    type: 'printer',
    branchId: '',
    driverType: 'escpos',
    connectionType: 'ip',
    ipAddress: '',
    isDefault: false,
  };
  const [formData, setFormData] = useState(initial);

  useEffect(() => {
    if (deviceToEdit) {
      setFormData({ ...initial, ...deviceToEdit, branchId: deviceToEdit.branchId?._id || '' });
    } else {
      setFormData(initial);
    }
  }, [deviceToEdit]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Device Name</Label>
        <Input
          name='name'
          value={formData.name}
          onChange={handleChange}
          required
          placeholder='e.g., Front Desk Receipt Printer'
        />
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Device Type</Label>
          <Select onValueChange={(val) => handleSelectChange('type', val)} value={formData.type} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEVICE_TYPES.map((t) => (
                <SelectItem key={t} value={t} className='capitalize'>
                  {t.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Branch</Label>
          <Select onValueChange={(val) => handleSelectChange('branchId', val)} value={formData.branchId} required>
            <SelectTrigger>
              <SelectValue placeholder='Select branch...' />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b._id} value={b._id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Driver</Label>
          <Select onValueChange={(val) => handleSelectChange('driverType', val)} value={formData.driverType} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DRIVER_TYPES.map((t) => (
                <SelectItem key={t} value={t} className='capitalize'>
                  {t.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Connection</Label>
          <Select
            onValueChange={(val) => handleSelectChange('connectionType', val)}
            value={formData.connectionType}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONNECTION_TYPES.map((c) => (
                <SelectItem key={c} value={c} className='capitalize'>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- Definitive Fix #1: Conditional connection fields --- */}
      {formData.connectionType === 'ip' && (
        <div>
          <Label>IP Address</Label>
          <Input
            name='ipAddress'
            value={formData.ipAddress || ''}
            onChange={handleChange}
            required
            placeholder='e.g., 192.168.1.100'
          />
        </div>
      )}
      {formData.connectionType === 'usb' && (
        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <Label>Vendor ID (VID)</Label>
            <Input
              name='vendorId'
              value={formData.vendorId || ''}
              onChange={handleChange}
              required
              placeholder='e.g., 0x04b8'
            />
          </div>
          <div>
            <Label>Product ID (PID)</Label>
            <Input
              name='productId'
              value={formData.productId || ''}
              onChange={handleChange}
              required
              placeholder='e.g., 0x0202'
            />
          </div>
        </div>
      )}

      <div className='flex items-center space-x-2'>
        <Checkbox
          id='isDefault'
          checked={formData.isDefault}
          onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
        />
        <Label htmlFor='isDefault'>Make this the default device of its type for the selected branch?</Label>
      </div>
      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Device'}
        </Button>
      </div>
    </form>
  );
};
export default HardwareDeviceForm;
