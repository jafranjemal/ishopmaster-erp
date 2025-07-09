import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const CustomerGroupForm = ({ groupToEdit, onSave, onCancel, isSaving }) => {
  const [name, setName] = useState("");
  useEffect(() => {
    setName(groupToEdit?.name || "");
  }, [groupToEdit]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Group Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., VIP Clients" />
      </div>
      <div className="pt-4 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Group"}
        </Button>
      </div>
    </form>
  );
};
export default CustomerGroupForm;
