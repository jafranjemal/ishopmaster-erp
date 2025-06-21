import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const CustomerForm = ({ customerToEdit, onSave, onCancel }) => {
  const initialFormData = {
    name: "",
    phone: "",
    email: "",
    creditLimit: 0,
    address: { street: "", city: "" },
  };
  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(customerToEdit);

  useEffect(() => {
    if (isEditMode && customerToEdit) {
      setFormData({
        name: customerToEdit.name || "",
        phone: customerToEdit.phone || "",
        email: customerToEdit.email || "",
        creditLimit: customerToEdit.creditLimit || 0,
        address: { ...initialFormData.address, ...customerToEdit.address },
      });
    } else {
      setFormData(initialFormData);
    }
  }, [customerToEdit, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // The onSave function from the parent will handle the API call and toast notifications.
    // It returns an error message on failure, which allows us to re-enable the form.
    const error = await onSave(formData);
    if (error) {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Customer Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div>
          <Label htmlFor="creditLimit">Credit Limit</Label>
          <Input
            id="creditLimit"
            name="creditLimit"
            type="number"
            min="0"
            value={formData.creditLimit}
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="address.street">Street Address</Label>
        <Input
          id="address.street"
          name="address.street"
          value={formData.address.street}
          onChange={handleChange}
        />
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Customer"}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
