import React, { useState } from "react";
import { Button, Input, Label } from "ui-library";

const ShiftOpenForm = ({ onSave, onCancel, isSaving }) => {
  const [openingFloat, setOpeningFloat] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ openingFloat: Number(openingFloat) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="openingFloat">Opening Cash Float</Label>
        <Input
          id="openingFloat"
          type="number"
          step="0.01"
          value={openingFloat}
          onChange={(e) => setOpeningFloat(e.target.value)}
          required
          placeholder="Enter starting cash amount"
        />
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Starting..." : "Start Shift"}
        </Button>
      </div>
    </form>
  );
};
export default ShiftOpenForm;
