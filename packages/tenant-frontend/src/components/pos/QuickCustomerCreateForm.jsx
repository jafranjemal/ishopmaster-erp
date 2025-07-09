import React, { useState } from "react";
import { Button, Input, Label } from "ui-library";

const QuickCustomerCreateForm = ({ onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Customer Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
      </div>
      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Creating..." : "Create Customer"}
        </Button>
      </div>
    </form>
  );
};
export default QuickCustomerCreateForm;
