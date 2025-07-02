import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const CategoryForm = ({ itemToEdit, onSave, onCancel, isSaving }) => {
  const [name, setName] = useState("");
  useEffect(() => {
    setName(itemToEdit?.name || "");
  }, [itemToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};
export default CategoryForm;
