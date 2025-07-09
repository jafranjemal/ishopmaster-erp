import React, { useState, useEffect } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";

const ManualEntryForm = ({ entryToEdit, employees, branches, onSave, onCancel, isSaving }) => {
  const initialFormState = { employeeId: "", branchId: "", checkInTime: "", checkOutTime: "", notes: "" };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (entryToEdit) {
      setFormData({
        employeeId: entryToEdit.employeeId?._id || "",
        branchId: entryToEdit.branchId?._id || "",
        checkInTime: entryToEdit.checkInTime ? new Date(entryToEdit.checkInTime).toISOString().slice(0, 16) : "",
        checkOutTime: entryToEdit.checkOutTime ? new Date(entryToEdit.checkOutTime).toISOString().slice(0, 16) : "",
        notes: entryToEdit.notes || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [entryToEdit]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Employee</Label>
          <Select onValueChange={(val) => handleSelectChange("employeeId", val)} value={formData.employeeId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select employee..." />
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
        <div>
          <Label>Branch</Label>
          <Select onValueChange={(val) => handleSelectChange("branchId", val)} value={formData.branchId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select branch..." />
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
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="checkInTime">Check-In Time</Label>
          <Input id="checkInTime" name="checkInTime" type="datetime-local" value={formData.checkInTime} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="checkOutTime">Check-Out Time</Label>
          <Input id="checkOutTime" name="checkOutTime" type="datetime-local" value={formData.checkOutTime} onChange={handleChange} />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes (Reason for manual entry)</Label>
        <Input id="notes" name="notes" value={formData.notes} onChange={handleChange} required />
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Entry"}
        </Button>
      </div>
    </form>
  );
};
export default ManualEntryForm;
