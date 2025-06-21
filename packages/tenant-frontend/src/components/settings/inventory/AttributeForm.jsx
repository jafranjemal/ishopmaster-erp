import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const AttributeForm = ({ attributeToEdit, onSave, onCancel, isSaving }) => {
  const initialFormData = { name: "", values: [] };
  const [formData, setFormData] = useState(initialFormData);
  const [newValue, setNewValue] = useState("");
  const isEditMode = Boolean(attributeToEdit);

  useEffect(() => {
    if (isEditMode && attributeToEdit) {
      setFormData({
        name: attributeToEdit.name || "",
        values: attributeToEdit.values || [],
      });
    } else {
      setFormData(initialFormData);
    }
  }, [attributeToEdit, isEditMode]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Attribute Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Color, Storage, RAM"
        />
      </div>
      <div>
        <Label>Predefined Values (Optional)</Label>
        <p className="text-xs text-slate-400 mb-2">
          Add options if you want this attribute to be a dropdown selector.
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
            Add
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
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Attribute"}
        </Button>
      </div>
    </form>
  );
};

export default AttributeForm;
