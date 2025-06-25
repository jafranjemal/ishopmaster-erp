import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const generateDescription = (module, key) => {
  if (!module || !key) return "";
  const parts = key.replace(`${module}:`, "").split(":");
  if (parts.length < 2) return "";
  const [entity, action] = parts;
  return `Allows the user to ${action.replace(/_/g, " ")} ${entity.replace(
    /_/g,
    " "
  )}s in the ${module} module.`;
};

const PermissionForm = ({ permissionToEdit, onSave, onCancel }) => {
  const initialFormData = {
    key: "",
    description: "",
    module: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUserEditedDescription, setHasUserEditedDescription] =
    useState(false);

  const isEditMode = Boolean(permissionToEdit && permissionToEdit._id);

  useEffect(() => {
    if (permissionToEdit) {
      setFormData({
        key: permissionToEdit.key || "",
        description: permissionToEdit.description || "",
        module: permissionToEdit.module || "",
      });
      setHasUserEditedDescription(true);
    } else {
      setFormData({
        key: permissionToEdit?.key || "",
        description: "",
        module: permissionToEdit?.module || "",
      });
    }
  }, [permissionToEdit]);

  useEffect(() => {
    if (
      !isEditMode &&
      formData.module &&
      formData.key &&
      !hasUserEditedDescription
    ) {
      const autoDesc = generateDescription(formData.module, formData.key);
      setFormData((prev) => ({ ...prev, description: autoDesc }));
    }
  }, [formData.key, formData.module]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "description") {
      setHasUserEditedDescription(true);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const error = await onSave(formData);
        if (error) setIsSaving(false);
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="module">Module Key</Label>
          <Input
            id="module"
            name="module"
            value={formData.module}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                module: `${e.target.value}`,
              }))
            }
          />
        </div>
        <div>
          <Label htmlFor="key">Permission Key</Label>
          <div className="flex">
            <span className="inline-flex items-center px-2 bg-slate-800 text-slate-400 rounded-l-md text-sm border border-r-0 border-slate-600">
              {formData.module}:
            </span>
            <Input
              id="key"
              name="key"
              value={formData.key.replace(`${formData.module}:`, "")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  key: `${prev.module}:${e.target.value}`,
                }))
              }
              placeholder="e.g., invoice:delete"
              className="rounded-l-none"
              required
              disabled={isEditMode}
            />
          </div>
          {isEditMode && (
            <p className="text-xs text-slate-400 mt-1">
              The permission key cannot be changed after creation.
            </p>
          )}
        </div>
        <div>
          <Label
            htmlFor="description"
            className="flex justify-between items-center"
          >
            <span>Description</span>
            {!isEditMode && (
              <button
                type="button"
                className="text-xs text-blue-400 underline"
                onClick={() => {
                  const autoDesc = generateDescription(
                    formData.module,
                    formData.key
                  );
                  setFormData((prev) => ({ ...prev, description: autoDesc }));
                  setHasUserEditedDescription(false);
                }}
              >
                Generate Description
              </button>
            )}
          </Label>

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
