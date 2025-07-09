import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const JobPositionForm = ({ itemToEdit, onSave, onCancel, isSaving }) => {
  const [title, setTitle] = useState("");
  useEffect(() => {
    setTitle(itemToEdit?.title || "");
  }, [itemToEdit]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Job Title (e.g., Senior Technician)</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
export default JobPositionForm;
