import React, { useState } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";

const AssignBenefitForm = ({ benefitTypes, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({ benefitTypeId: "", amount: 0 });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Benefit</Label>
        <Select onValueChange={(val) => setFormData({ ...formData, benefitTypeId: val })} value={formData.benefitTypeId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a benefit..." />
          </SelectTrigger>
          <SelectContent>
            {benefitTypes.map((b) => (
              <SelectItem key={b._id} value={b._id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Amount (per payroll)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          required
        />
      </div>
      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Assigning..." : "Assign Benefit"}
        </Button>
      </div>
    </form>
  );
};
export default AssignBenefitForm;
