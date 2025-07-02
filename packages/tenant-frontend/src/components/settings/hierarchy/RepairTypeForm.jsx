import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const RepairTypeForm = ({ itemToEdit, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({ name: "", defaultPrice: 0 });
  useEffect(() => {
    setFormData({ name: itemToEdit?.name || "", defaultPrice: itemToEdit?.defaultPrice || 0 });
  }, [itemToEdit]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Repair Service Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Screen Replacement" />
      </div>
      <div>
        <Label htmlFor="defaultPrice">Default Price</Label>
        <Input id="defaultPrice" name="defaultPrice" type="number" step="0.01" value={formData.defaultPrice} onChange={handleChange} required />
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};
export default RepairTypeForm;
