import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

const AccountForm = ({ accountToEdit, onSave, onCancel }) => {
  const initialFormData = {
    name: "",
    type: "Expense", // A safe default
    subType: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(accountToEdit);

  useEffect(() => {
    if (isEditMode && accountToEdit) {
      setFormData({
        name: accountToEdit.name || "",
        type: accountToEdit.type || "Expense",
        subType: accountToEdit.subType || "",
        description: accountToEdit.description || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [accountToEdit, isEditMode]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const error = await onSave(formData);
    if (error) {
      setIsSaving(false); // Re-enable form only if there was an error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Account Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Office Rent Expense"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Account Type</Label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm"
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="subType">Sub-Type (Optional)</Label>
            <Input
              id="subType"
              name="subType"
              value={formData.subType}
              onChange={handleChange}
              placeholder="e.g., Operating Expense"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? "Saving..."
            : isEditMode
            ? "Save Changes"
            : "Create Account"}
        </Button>
      </div>
    </form>
  );
};

export default AccountForm;
