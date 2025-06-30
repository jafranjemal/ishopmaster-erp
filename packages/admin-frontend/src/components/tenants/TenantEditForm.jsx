import React, { useState, useEffect } from "react";
import { Button, Input, Label, Checkbox } from "ui-library";

const TenantEditForm = ({ tenant, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({ licenseExpiry: "", isActive: true });

  useEffect(() => {
    if (tenant) {
      setFormData({
        licenseExpiry: tenant.licenseExpiry ? new Date(tenant.licenseExpiry).toISOString().split("T")[0] : "",
        isActive: tenant.isActive,
      });
    }
  }, [tenant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="licenseExpiry">License Expiry Date</Label>
        <Input id="licenseExpiry" name="licenseExpiry" type="date" value={formData.licenseExpiry} onChange={handleChange} required />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Tenant Account is Active
        </Label>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
export default TenantEditForm;
