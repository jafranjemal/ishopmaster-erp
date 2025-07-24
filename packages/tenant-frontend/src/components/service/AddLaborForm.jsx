import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import useAuth from '../../context/useAuth';

const AddLaborForm = ({ onSave, onCancel, isSaving, technicians = [], defaultEmployeeId }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    employeeId: defaultEmployeeId || '',
    laborHours: 1,
    laborRate: 0,
    description: '',
  });

  const canOverrideRate = useMemo(() => user?.permissions?.includes('service:ticket:override_rate'), [user]);

  // Auto-fill the rate when the technician changes
  useEffect(() => {
    const selectedTech = technicians.find((t) => t._id === formData.employeeId);
    if (selectedTech) {
      setFormData((prev) => ({
        ...prev,
        laborRate: selectedTech.compensation?.billingRate || 0,
        description: prev.description || `${selectedTech.firstName}'s Labor`,
      }));
    }
  }, [formData.employeeId, technicians]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      itemType: 'labor',
      ...formData,
      quantity: formData.laborHours, // For consistency with job sheet
      unitPrice: formData.laborRate,
    };
    onSave(finalData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>Technician</Label>
        <Select
          onValueChange={(val) => setFormData((p) => ({ ...p, employeeId: val }))}
          value={formData.employeeId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder='Select Technician...' />
          </SelectTrigger>
          <SelectContent>
            {technicians.map((t) => (
              <SelectItem key={t._id} value={t._id}>
                {t.firstName}
                {t.lastName} - ({t.jobPositionId.title})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label>Hours Worked</Label>
          <Input
            type='number'
            value={formData.laborHours}
            onChange={(e) => setFormData((p) => ({ ...p, laborHours: Number(e.target.value) }))}
            min='0.25'
            step='0.25'
            required
          />
        </div>
        <div>
          <Label>Billing Rate (per hour) </Label>
          <Input
            type='number'
            value={formData.laborRate}
            onChange={(e) => setFormData((p) => ({ ...p, laborRate: Number(e.target.value) }))}
            required
            //  readOnly={!canOverrideRate}
          />
          {!canOverrideRate && <span className='text-red-500'>You dont have permisison to update price</span>}
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          required
          placeholder='e.g., Diagnostic Labor, Screen Replacement Labor'
        />
      </div>

      <div className='pt-4 flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving || !formData.employeeId}>
          {isSaving ? 'Saving...' : 'Add Labor to Job'}
        </Button>
      </div>
    </form>
  );
};

export default AddLaborForm;
