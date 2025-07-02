import React, { useState, useEffect } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";
import { DollarSign, Percent, Loader2 } from "lucide-react";

/**
 * @desc The definitive, reusable form for creating and editing employee records.
 * This version includes robust state management to prevent re-rendering issues
 * and provides a clean, professional user experience.
 *
 * @param {object|null} employeeToEdit - The full employee object if editing, otherwise null.
 * @param {Array} branches - The list of available branches for the dropdown.
 * @param {Array} unassignedUsers - The list of system users not yet linked to an employee.
 * @param {Function} onSave - The callback function to execute on form submission.
 * @param {Function} onCancel - The callback function to close the form/modal.
 * @param {boolean} isSaving - A flag to show a loading state on the save button.
 */
const EmployeeForm = ({ employeeToEdit, branches, unassignedUsers, onSave, onCancel, isSaving }) => {
  const initialFormState = React.useMemo(
    () => ({
      name: "",
      designation: "",
      branchId: "",
      userId: "",
      compensation: {
        type: "fixed",
        baseSalary: 0,
        commissionRate: 0,
      },
      contactInfo: {
        phone: "",
        email: "",
      },
      isActive: true,
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormState);
  const [_branches, setBranches] = useState([]);

  useEffect(() => {
    setBranches(branches);
  }, [branches]);

  // ✅ DEFINITIVE FIX: The useEffect hook now depends on ALL relevant props.
  // This ensures that if the employeeToEdit data arrives before the branches
  // list, the effect will re-run and correctly set the branchId once it's available.
  useEffect(() => {
    if (employeeToEdit && branches && branches.length > 0) {
      setFormData({
        name: employeeToEdit.name || "",
        designation: employeeToEdit.designation || "",
        branchId: employeeToEdit.branchId?._id || "",
        userId: employeeToEdit.userId?._id || "",
        // Use ?? to safely fall back to the initial state for nested objects
        compensation: employeeToEdit.compensation ?? initialFormState.compensation,
        contactInfo: employeeToEdit.contactInfo ?? initialFormState.contactInfo,
        isActive: employeeToEdit.isActive !== undefined ? employeeToEdit.isActive : true,
      });
    } else {
      // If creating a new employee, reset to the initial state.
      setFormData(initialFormState);
    }
  }, [employeeToEdit, branches, unassignedUsers, initialFormState]); // Dependency array is key

  // A single, robust handler for all standard input changes.
  const handleChange = (e, section = null) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? parseFloat(value) || 0 : value;

    setFormData((prev) => {
      if (section) {
        // Handle nested state updates (e.g., for 'compensation' or 'contactInfo')
        return { ...prev, [section]: { ...prev[section], [name]: parsedValue } };
      }
      return { ...prev, [name]: parsedValue };
    });
  };

  // A dedicated handler for our Select components for cleaner code.
  const handleSelectChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
      {/* Personal Info */}
      <div>
        <Label htmlFor="name">Employee Full Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      {/* Job Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
            placeholder="e.g., Senior Technician"
          />
        </div>
        {_branches.length > 0 && (
          <div>
            <Label>Assigned Branch</Label>
            <Select onValueChange={(val) => handleSelectChange("branchId", val)} value={formData.branchId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select branch..." />
              </SelectTrigger>
              <SelectContent>
                {_branches.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Contact Info */}
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

      {/* Compensation Section */}
      <div className="space-y-4 rounded-lg border border-slate-700 p-4">
        <h4 className="font-semibold text-white">Compensation</h4>
        <div>
          <Label>Compensation Type</Label>
          <Select onValueChange={(val) => handleSelectChange("compensation.type", val)} value={formData.compensation.type}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Salary</SelectItem>
              <SelectItem value="commission_based">Commission Only</SelectItem>
              <SelectItem value="hybrid">Fixed + Commission</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(formData.compensation.type === "fixed" || formData.compensation.type === "hybrid") && (
            <div>
              <Label htmlFor="baseSalary">Base Salary</Label>
              <Input
                icon={DollarSign}
                id="baseSalary"
                name="baseSalary"
                type="number"
                value={formData.compensation.baseSalary}
                onChange={(e) => handleChange(e, "compensation")}
              />
            </div>
          )}
          {(formData.compensation.type === "commission_based" || formData.compensation.type === "hybrid") && (
            <div>
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                icon={Percent}
                id="commissionRate"
                name="commissionRate"
                type="number"
                value={formData.compensation.commissionRate}
                onChange={(e) => handleChange(e, "compensation")}
              />
            </div>
          )}
        </div>
      </div>

      {/* User Account Linking */}
      <div>
        <Label>Link to System User Account (Optional)</Label>
        <Select onValueChange={(val) => handleSelectChange("userId", val)} value={formData.userId}>
          <SelectTrigger>
            <SelectValue placeholder="No system access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No system access</SelectItem>
            {/* If editing, ensure the currently linked user is always in the list */}
            {employeeToEdit?.userId && <SelectItem value={employeeToEdit.userId._id}>{employeeToEdit.userId.email}</SelectItem>}
            {/* Filter the unassigned list to prevent showing the already-linked user */}
            {(unassignedUsers || [])
              .filter((u) => u._id !== employeeToEdit?.userId?._id)
              .map((u) => (
                <SelectItem key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
          {isSaving ? "Saving..." : "Save Employee"}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
