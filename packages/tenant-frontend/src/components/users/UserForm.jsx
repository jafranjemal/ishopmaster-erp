import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const UserForm = ({ userToEdit, roles, branches, onSave, onCancel }) => {
  const initialFormData = {
    name: "",
    email: "",
    password: "",
    role: "",
    assignedBranchId: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(userToEdit);

  useEffect(() => {
    if (isEditMode && userToEdit) {
      setFormData({
        name: userToEdit.name || "",
        email: userToEdit.email || "",
        password: "", // Password is not edited here
        role: userToEdit.role?._id || "",
        assignedBranchId: userToEdit.assignedBranchId?._id || "",
        isActive: userToEdit.isActive,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [userToEdit, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const dataToSend = { ...formData };
    if (isEditMode) delete dataToSend.password; // Don't send empty password on update
    const error = await onSave(dataToSend);
    if (error) setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm"
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="assignedBranchId">Assigned Branch</Label>
          <select
            id="assignedBranchId"
            name="assignedBranchId"
            value={formData.assignedBranchId}
            onChange={handleChange}
            required
            className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm"
          >
            <option value="" disabled>
              Select a branch
            </option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {!isEditMode && (
        <div>
          <Label htmlFor="password">Initial Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 rounded"
        />
        <Label htmlFor="isActive">User is Active</Label>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save User"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
