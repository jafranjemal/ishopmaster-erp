import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const PermissionForm = ({ permissionToEdit, onSave, onCancel }) => {
  const initialFormData = {
    key: "",
    description: "",
    module: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(permissionToEdit);

  useEffect(() => {
    if (isEditMode && permissionToEdit) {
      setFormData({
        key: permissionToEdit.key || "",
        description: permissionToEdit.description || "",
        module: permissionToEdit.module || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [permissionToEdit, isEditMode]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const error = await onSave(formData);
    if (error) {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="module">Module Key</Label>
          <Input
            id="module"
            name="module"
            value={formData.module}
            onChange={handleChange}
            required
            placeholder="e.g., sales"
          />
        </div>
        <div>
          <Label htmlFor="key">Permission Key</Label>
          <Input
            id="key"
            name="key"
            value={formData.key}
            onChange={handleChange}
            required
            placeholder="e.g., sales:invoice:delete"
            disabled={isEditMode}
          />
          {isEditMode && (
            <p className="text-xs text-slate-400 mt-1">
              The permission key cannot be changed after creation.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="A brief explanation of the permission."
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
            : "Create Permission"}
        </Button>
      </div>
    </form>
  );
};

export default PermissionForm;
