import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";

const EmployeeForm = ({ employeeToEdit, branches, unassignedUsers, departments, jobPositions, allEmployees, onSave, onCancel, isSaving }) => {
  const initialFormState = {
    name: "",
    branchId: "",
    userId: "",
    contactInfo: { phone: "", email: "" },
    compensation: { type: "fixed", baseSalary: 0, commissionRate: 0 },
    // New fields for hierarchy
    departmentId: "",
    designation: "", // This will now hold the jobPositionId
    reportsTo: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (employeeToEdit) {
      // To pre-fill the form, we need to find the department of the employee's current job position
      const position = jobPositions.find((p) => p._id === employeeToEdit.designation?._id);
      setFormData({
        name: employeeToEdit.name || "",
        branchId: employeeToEdit.branchId?._id || "",
        userId: employeeToEdit.userId?._id || "",
        contactInfo: employeeToEdit.contactInfo || initialFormState.contactInfo,
        compensation: employeeToEdit.compensation || initialFormState.compensation,
        departmentId: position?.departmentId?._id || "",
        designation: employeeToEdit.designation?._id || "",
        reportsTo: employeeToEdit.reportsTo?._id || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [employeeToEdit, jobPositions]);

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    if (section) {
      setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // When department changes, reset the selected job position
  const handleDepartmentChange = (value) => {
    setFormData((prev) => ({ ...prev, departmentId: value, designation: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Memoized calculation for the dependent job position dropdown
  const availablePositions = useMemo(() => {
    if (!formData.departmentId) return [];
    return jobPositions.filter((p) => p.departmentId?._id === formData.departmentId);
  }, [formData.departmentId, jobPositions]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
      <div>
        <Label htmlFor="name">Employee Full Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Department</Label>
          <Select onValueChange={handleDepartmentChange} value={formData.departmentId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select department..." />
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
            onValueChange={(val) => handleSelectChange("designation", val)}
            value={formData.designation}
            required
            disabled={!formData.departmentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select position..." />
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

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Assigned Branch</Label>
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
        <div>
          <Label>Reports To (Manager)</Label>
          <Select onValueChange={(val) => handleSelectChange("reportsTo", val)} value={formData.reportsTo}>
            <SelectTrigger>
              <SelectValue placeholder="Select manager..." />
            </SelectTrigger>
            <SelectContent>
              {allEmployees.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Phone</Label>
          <Input name="phone" type="tel" value={formData.contactInfo.phone} onChange={(e) => handleChange(e, "contactInfo")} />
        </div>
        <div>
          <Label>Email</Label>
          <Input name="email" type="email" value={formData.contactInfo.email} onChange={(e) => handleChange(e, "contactInfo")} />
        </div>
      </div>

      <div>
        <Label>Link to System User Account (Optional)</Label>
        <Select onValueChange={(val) => handleSelectChange("userId", val)} value={formData.userId}>
          <SelectTrigger>
            <SelectValue placeholder="No system access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No system access</SelectItem>
            {employeeToEdit?.userId && <SelectItem value={employeeToEdit.userId._id}>{employeeToEdit.userId.email}</SelectItem>}
            {unassignedUsers.map((u) => (
              <SelectItem key={u._id} value={u._id}>
                {u.name} ({u.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Employee"}
        </Button>
      </div>
    </form>
  );
};
export default EmployeeForm;
