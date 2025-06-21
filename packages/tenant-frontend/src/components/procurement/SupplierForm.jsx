import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const SupplierForm = ({ supplierToEdit, onSave, onCancel }) => {
  const initialFormData = { name: "", contactPerson: "", phone: "", email: "" };
  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(supplierToEdit);

  useEffect(() => {
    if (isEditMode && supplierToEdit) {
      setFormData({
        name: supplierToEdit.name || "",
        contactPerson: supplierToEdit.contactPerson || "",
        phone: supplierToEdit.phone || "",
        email: supplierToEdit.email || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [supplierToEdit, isEditMode]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const error = await onSave(formData);
    if (error) setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Supplier Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
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
          />
        </div>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Supplier"}
        </Button>
      </div>
    </form>
  );
};

export default SupplierForm;
