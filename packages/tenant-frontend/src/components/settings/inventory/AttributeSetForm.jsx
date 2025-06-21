import React, { useState, useEffect } from "react";
import { Button, Input, Label, Badge } from "ui-library";
import { X } from "lucide-react";

const AttributeSetForm = ({
  setToEdit,
  allAttributes = [],
  onSave,
  onCancel,
  isSaving,
}) => {
  const [name, setName] = useState("");
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);
  const isEditMode = Boolean(setToEdit);

  useEffect(() => {
    if (isEditMode && setToEdit) {
      setName(setToEdit.name || "");
      // The `attributes` array on the set contains populated objects, so we map to get their IDs.
      setSelectedAttributeIds(
        setToEdit.attributes?.map((attr) => attr._id) || []
      );
    } else {
      setName("");
      setSelectedAttributeIds([]);
    }
  }, [setToEdit, isEditMode]);

  const handleAttributeToggle = (attributeId) => {
    setSelectedAttributeIds((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({ name, attributes: selectedAttributeIds });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Attribute Set Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Smartphone Specifications"
        />
      </div>
      <div>
        <Label>Assign Attributes</Label>
        <div className="mt-2 p-4 max-h-60 overflow-y-auto border border-slate-700 rounded-lg space-y-2">
          {allAttributes.map((attr) => (
            <label
              key={attr._id}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-500 bg-slate-600 text-indigo-600 focus:ring-indigo-500"
                checked={selectedAttributeIds.includes(attr._id)}
                onChange={() => handleAttributeToggle(attr._id)}
              />
              <span className="text-sm text-slate-100">{attr.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Set"}
        </Button>
      </div>
    </form>
  );
};

export default AttributeSetForm;
