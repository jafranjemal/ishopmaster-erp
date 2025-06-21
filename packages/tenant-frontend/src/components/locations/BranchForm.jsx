import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const BranchForm = ({ branchToEdit, warehouses = [], onSave, onCancel }) => {
  const initialFormData = { name: "", isPrimary: false, linkedWarehouseId: "" };
  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(branchToEdit);

  useEffect(() => {
    if (isEditMode && branchToEdit) {
      setFormData({
        name: branchToEdit.name || "",
        isPrimary: branchToEdit.isPrimary || false,
        linkedWarehouseId: branchToEdit.linkedWarehouseId?._id || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [branchToEdit, isEditMode]);

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
    const dataToSave = { ...formData };
    if (!dataToSave.linkedWarehouseId) delete dataToSave.linkedWarehouseId; // Send null if empty
    const error = await onSave("branch", dataToSave);
    if (error) setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Branch Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="linkedWarehouseId">Supplying Warehouse</Label>
        <select
          id="linkedWarehouseId"
          name="linkedWarehouseId"
          value={formData.linkedWarehouseId}
          onChange={handleChange}
          className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">None</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <input
          id="isPrimary"
          name="isPrimary"
          type="checkbox"
          checked={formData.isPrimary}
          onChange={handleChange}
          className="h-4 w-4 rounded"
        />
        <Label htmlFor="isPrimary">Set as Primary Branch</Label>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Branch"}
        </Button>
      </div>
    </form>
  );
};

export default BranchForm;
