import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";

const BenefitTypeForm = ({ itemToEdit, accounts, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({ name: "", type: "deduction", linkedLiabilityAccountId: "" });
  useEffect(() => {
    if (itemToEdit)
      setFormData({ name: itemToEdit.name, type: itemToEdit.type, linkedLiabilityAccountId: itemToEdit.linkedLiabilityAccountId?._id || "" });
  }, [itemToEdit]);

  const liabilityAccounts = useMemo(() => accounts.filter((a) => a.type === "Liability"), [accounts]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Benefit Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Premium Health Insurance"
        />
      </div>
      <div>
        <Label>Type</Label>
        <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deduction">Deduction</SelectItem>
            <SelectItem value="contribution">Contribution</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Linked Liability Account</Label>
        <Select
          value={formData.linkedLiabilityAccountId}
          onValueChange={(val) => setFormData({ ...formData, linkedLiabilityAccountId: val })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account..." />
          </SelectTrigger>
          <SelectContent>
            {liabilityAccounts.map((a) => (
              <SelectItem key={a._id} value={a._id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="pt-4 flex justify-end gap-2">
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
export default BenefitTypeForm;
