import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "ui-library";

const RoleForm = ({ roleToEdit, availablePermissions, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = Boolean(roleToEdit);

  useEffect(() => {
    if (isEditMode && roleToEdit) {
      setFormData({
        name: roleToEdit.name || "",
        description: roleToEdit.description || "",
        permissions: roleToEdit.permissions || [],
      });
    } else {
      setFormData({ name: "", description: "", permissions: [] });
    }
  }, [roleToEdit, isEditMode]);

  const handlePermissionToggle = (permissionKey) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter((p) => p !== permissionKey)
        : [...prev.permissions, permissionKey],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const error = await onSave(formData);
    if (error) setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Role Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={roleToEdit?.isSystemRole}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 -mr-2">
        {Object.entries(availablePermissions).map(
          ([moduleName, permissions]) => (
            <Card key={moduleName} className="bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-base capitalize">
                  {moduleName} Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map((permission) => (
                    <label
                      key={permission.key}
                      className="flex items-center space-x-3 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-indigo-600 focus:ring-indigo-500"
                        checked={formData.permissions.includes(permission.key)}
                        onChange={() => handlePermissionToggle(permission.key)}
                      />
                      <span className="text-sm">{permission.description}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Role"}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
