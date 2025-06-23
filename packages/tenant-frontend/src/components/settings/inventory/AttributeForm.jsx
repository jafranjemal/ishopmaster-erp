import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, Label } from "ui-library";

const AttributeForm = ({ attributeToEdit, onSave, onCancel, isSaving }) => {
  const { t } = useTranslation();

  const getInitialFormData = () => ({
    name: "",
    key: "", // Add the key field
    values: [],
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [newValue, setNewValue] = useState("");
  // State to track if the user has manually edited the key
  const [isKeyManuallyEdited, setIsKeyManuallyEdited] = useState(false);
  const isEditMode = Boolean(attributeToEdit);

  // Effect to populate form when editing
  useEffect(() => {
    if (isEditMode && attributeToEdit) {
      setFormData({
        name: attributeToEdit.name || "",
        key: attributeToEdit.key || "",
        values: attributeToEdit.values || [],
      });
      // If editing, assume the key is final and don't auto-generate
      setIsKeyManuallyEdited(true);
    } else {
      setFormData(getInitialFormData());
      setIsKeyManuallyEdited(false);
    }
  }, [attributeToEdit, isEditMode]);

  // Effect to auto-generate the key from the name
  useEffect(() => {
    if (!isKeyManuallyEdited && !isEditMode) {
      const newKey = formData.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/[^a-z0-9_]/g, ""); // Remove special characters
      setFormData((prev) => ({ ...prev, key: newKey }));
    }
  }, [formData.name, isKeyManuallyEdited, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If the user starts editing the key field, disable auto-generation
    if (name === "key") {
      setIsKeyManuallyEdited(true);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleValueAdd = () => {
    if (newValue && !formData.values.includes(newValue)) {
      setFormData((prev) => ({ ...prev, values: [...prev.values, newValue] }));
      setNewValue("");
    }
  };

  const handleValueRemove = (valueToRemove) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((v) => v !== valueToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">
            {t("attribute_form.name_label", "Attribute Name")}
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Color, Storage"
          />
        </div>
        <div>
          <Label htmlFor="key">
            {t("attribute_form.key_label", "Attribute Key")}
          </Label>
          <Input
            id="key"
            name="key"
            value={formData.key}
            onChange={handleChange}
            required
            placeholder="e.g., color, storage"
          />
        </div>
      </div>
      <div>
        <Label>
          {t("attribute_form.values_label", "Predefined Values (Optional)")}
        </Label>
        <p className="text-xs text-slate-400 mb-2">
          {t(
            "attribute_form.values_subtitle",
            "Add options if you want this to be a dropdown selector."
          )}
        </p>
        <div className="flex items-center gap-2">
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="e.g., Red"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleValueAdd();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={handleValueAdd}>
            {t("attribute_form.add_button", "Add")}
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.values.map((val) => (
            <span
              key={val}
              className="flex items-center gap-1 bg-slate-700 text-sm px-2 py-1 rounded"
            >
              {val}
              <button
                type="button"
                onClick={() => handleValueRemove(val)}
                className="text-slate-400 hover:text-white"
                aria-label={`Remove ${val}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.buttons.cancel")}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? t("common.buttons.saving")
            : t("attribute_form.save_button", "Save Attribute")}
        </Button>
      </div>
    </form>
  );
};

export default AttributeForm;
