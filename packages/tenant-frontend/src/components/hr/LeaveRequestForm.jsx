import React, { useState } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "ui-library";

const LEAVE_TYPES = ["annual", "casual", "sick", "unpaid"];

const LeaveRequestForm = ({ onSave, isSaving, employees = null }) => {
  const initialFormState = {
    employeeId: "",
    leaveType: "annual",
    startDate: "",
    endDate: "",
    reason: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (value) => setFormData((prev) => ({ ...prev, leaveType: value }));
  const handleSelectEmployeeChange = (value) => setFormData((prev) => ({ ...prev, employeeId: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) {
      setFormData(initialFormState);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Leave Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {employees && (
            <div>
              <Label htmlFor="employeeId">Select Employee</Label>
              <Select name="employeeId" onValueChange={(val) => handleSelectEmployeeChange(val)} value={formData.employeeId} required>
                <SelectTrigger id="employeeId">
                  <SelectValue placeholder="Select an employee..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select onValueChange={handleSelectChange} value={formData.leaveType} required>
              <SelectTrigger id="leaveType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <Label htmlFor="reason">Reason for Leave</Label>
            <Input as="textarea" id="reason" name="reason" value={formData.reason} onChange={handleChange} required />
          </div>
          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
export default LeaveRequestForm;
