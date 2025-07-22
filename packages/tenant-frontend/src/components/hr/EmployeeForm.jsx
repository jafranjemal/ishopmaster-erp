import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';

const EmployeeForm = ({
  employeeToEdit,
  branches,
  unassignedUsers,
  departments,
  jobPositions,
  allEmployees,
  onSave,
  onCancel,
  isSaving,
}) => {
  const initialFormState = {
    firstName: '',
    lastName: '',
    branchId: '',
    userId: '',
    contactInfo: { phone: '', email: '' },
    compensation: {
      type: 'fixed', // enum: fixed, hourly, hybrid, commission_based
      salary: 0,
      hourlyRate: 0,
      overtimeRate: 0,
      commissionRate: 0,
      billRate: 0,
      currency: 'LKR',
    },
    departmentId: '',
    jobPositionId: '',
    reportsTo: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (employeeToEdit) {
      // Find job position to get department for pre-filling
      const position = jobPositions.find(
        (p) => p._id === employeeToEdit.jobPositionId?._id || employeeToEdit.jobPositionId,
      );

      setFormData({
        firstName: employeeToEdit.firstName || '',
        lastName: employeeToEdit.lastName || '',
        branchId: employeeToEdit.branchId?._id || employeeToEdit.branchId || '',
        userId: employeeToEdit.userId?._id || employeeToEdit.userId || '',
        contactInfo: employeeToEdit.contactInfo || initialFormState.contactInfo,
        compensation: {
          ...initialFormState.compensation,
          ...employeeToEdit.compensation,
        },
        departmentId: position?.departmentId?._id || position?.departmentId || '',
        jobPositionId: employeeToEdit.jobPositionId?._id || employeeToEdit.jobPositionId || '',
        reportsTo: employeeToEdit.reportsTo?._id || employeeToEdit.reportsTo || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [employeeToEdit, jobPositions]);

  // Handle normal input changes (text, number)
  const handleChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle Select dropdown value changes
  const handleSelectChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Reset jobPositionId when department changes
  const handleDepartmentChange = (value) => {
    setFormData((prev) => ({ ...prev, departmentId: value, jobPositionId: '' }));
  };

  // Filter job positions based on selected department
  const availablePositions = useMemo(() => {
    if (!formData.departmentId) return [];
    return jobPositions.filter((p) => (p.departmentId?._id || p.departmentId) === formData.departmentId);
  }, [formData.departmentId, jobPositions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4'>
      {/* First and Last Name */}
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='firstName'>First Name</Label>
          <Input id='firstName' name='firstName' value={formData.firstName} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor='lastName'>Last Name</Label>
          <Input id='lastName' name='lastName' value={formData.lastName} onChange={handleChange} required />
        </div>
      </div>

      {/* Department & Job Position */}
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Department</Label>
          <Select onValueChange={handleDepartmentChange} value={formData.departmentId} required>
            <SelectTrigger>
              <SelectValue placeholder='Select department...' />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d._id} value={d._id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Job Position</Label>
          <Select
            onValueChange={(val) => handleSelectChange('jobPositionId', val)}
            value={formData.jobPositionId}
            required
            disabled={!formData.departmentId}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select job position...' />
            </SelectTrigger>
            <SelectContent>
              {availablePositions.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Branch & Reports To */}
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Assigned Branch</Label>
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

        <div>
          <Label>Reports To (Manager)</Label>
          <Select onValueChange={(val) => handleSelectChange('reportsTo', val)} value={formData.reportsTo}>
            <SelectTrigger>
              <SelectValue placeholder='Select manager...' />
            </SelectTrigger>
            <SelectContent>
              {allEmployees.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.firstName} {e.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contact Info */}
      <div className='grid md:grid-cols-2 gap-4'>
        <div>
          <Label>Phone</Label>
          <Input
            name='phone'
            type='tel'
            value={formData.contactInfo.phone}
            onChange={(e) => handleChange(e, 'contactInfo')}
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            name='email'
            type='email'
            value={formData.contactInfo.email}
            onChange={(e) => handleChange(e, 'contactInfo')}
          />
        </div>
      </div>

      {/* Compensation Section */}
      <div className='border-t border-slate-700 pt-4 mt-6'>
        <h3 className='text-lg font-semibold mb-3 text-slate-200'>Compensation Details</h3>

        <div className='grid md:grid-cols-3 gap-4'>
          <div>
            <Label>Type</Label>
            <Select
              onValueChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  compensation: { ...prev.compensation, type: val },
                }))
              }
              value={formData.compensation.type}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder='Select type...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='fixed'>Fixed Salary</SelectItem>
                <SelectItem value='hourly'>Hourly</SelectItem>
                <SelectItem value='hybrid'>Hybrid</SelectItem>
                <SelectItem value='commission_based'>Commission Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Salary</Label>
            <Input
              type='number'
              min='0'
              step='0.01'
              value={formData.compensation.salary}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  compensation: {
                    ...prev.compensation,
                    salary: parseFloat(e.target.value) || 0,
                  },
                }))
              }
              placeholder='Monthly salary'
            />
          </div>

          <div>
            <Label>Hourly Rate</Label>
            <Input
              type='number'
              min='0'
              step='0.01'
              value={formData.compensation.hourlyRate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  compensation: {
                    ...prev.compensation,
                    hourlyRate: parseFloat(e.target.value) || 0,
                  },
                }))
              }
              placeholder='Hourly pay'
            />
          </div>

          <div>
            <Label>Overtime Rate</Label>
            <Input
              type='number'
              min='0'
              step='0.01'
              value={formData.compensation.overtimeRate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  compensation: {
                    ...prev.compensation,
                    overtimeRate: parseFloat(e.target.value) || 0,
                  },
                }))
              }
              placeholder='Overtime pay'
            />
          </div>

          <div>
            <Label>Commission Rate (%)</Label>
            <Input
              type='number'
              min='0'
              max='100'
              step='0.01'
              value={formData.compensation.commissionRate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  compensation: {
                    ...prev.compensation,
                    commissionRate: parseFloat(e.target.value) || 0,
                  },
                }))
              }
              placeholder='Commission %'
            />
          </div>

          <div>
            <Label>Bill Rate (Hourly to Client)</Label>
            <Input
              type='number'
              min='0'
              step='0.01'
              value={formData.compensation.billRate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  compensation: {
                    ...prev.compensation,
                    billRate: parseFloat(e.target.value) || 0,
                  },
                }))
              }
              placeholder='Billing rate'
            />
          </div>

          <div>
            <Label>Currency</Label>
            <Input
              type='text'
              maxLength={3}
              value={formData.compensation.currency}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  compensation: {
                    ...prev.compensation,
                    currency: e.target.value.toUpperCase(),
                  },
                }))
              }
              placeholder='Currency (e.g. LKR)'
            />
          </div>
        </div>
      </div>

      {/* Link to User Account */}
      <div>
        <Label>Link to System User Account (Optional)</Label>
        <Select onValueChange={(val) => handleSelectChange('userId', val)} value={formData.userId}>
          <SelectTrigger>
            <SelectValue placeholder='No system access' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>No system access</SelectItem>
            {employeeToEdit?.userId && (
              <SelectItem value={employeeToEdit.userId._id}>{employeeToEdit.userId.email}</SelectItem>
            )}
            {unassignedUsers.map((u) => (
              <SelectItem key={u._id} value={u._id}>
                {u.name} ({u.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Buttons */}
      <div className='pt-4 flex justify-end space-x-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Employee'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
