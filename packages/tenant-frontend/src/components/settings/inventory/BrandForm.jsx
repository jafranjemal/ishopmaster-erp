import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const BrandForm = ({ brandToEdit, onSave, onCancel, isSaving }) => {
  const [name, setName] = useState("");
  const isEditMode = Boolean(brandToEdit);

  useEffect(() => {
    setName(isEditMode ? brandToEdit.name : "");
  }, [brandToEdit, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Brand Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Brand"}
        </Button>
      </div>
    </form>
  );
};

export default BrandForm;
