import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const LeadForm = ({ leadToEdit, onSave, onCancel, isSaving }) => {
  const initialFormState = { name: "", company: "", email: "", phone: "", source: "", notes: "" };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (leadToEdit) {
      setFormData(leadToEdit);
    } else {
      setFormData(initialFormState);
    }
  }, [leadToEdit]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Lead Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="company">Company Name (Optional)</Label>
          <Input id="company" name="company" value={formData.company} onChange={handleChange} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
        </div>
      </div>
      <div>
        <Label htmlFor="source">Lead Source</Label>
        <Input id="source" name="source" value={formData.source} onChange={handleChange} placeholder="e.g., Website, Referral, Walk-in" />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input as="textarea" id="notes" name="notes" value={formData.notes} onChange={handleChange} />
      </div>
      <div className="pt-4 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Lead"}
        </Button>
      </div>
    </form>
  );
};
export default LeadForm;
