import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";

const DeductionRuleForm = ({ ruleToEdit, accounts, onSave, onCancel, isSaving }) => {
  const initialFormState = { name: "", type: "percentage", value: 0, linkedAccountId: "" };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (ruleToEdit) {
      setFormData({
        name: ruleToEdit.name || "",
        type: ruleToEdit.type || "percentage",
        value: ruleToEdit.value || 0,
        linkedAccountId: ruleToEdit.linkedAccountId?._id || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [ruleToEdit]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const liabilityAccounts = useMemo(() => accounts.filter((a) => a.type === "Liability"), [accounts]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Rule Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., Employee EPF Contribution" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select onValueChange={(val) => handleSelectChange("type", val)} value={formData.type}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="value">Value</Label>
          <Input id="value" name="value" type="number" step="0.01" value={formData.value} onChange={handleChange} required />
        </div>
      </div>
      <div>
        <Label>Linked Liability Account</Label>
        <Select onValueChange={(val) => handleSelectChange("linkedAccountId", val)} value={formData.linkedAccountId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select liability account..." />
          </SelectTrigger>
          <SelectContent>
            {liabilityAccounts.map((a) => (
              <SelectItem key={a._id} value={a._id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-400 mt-1">The account where deducted funds are held before payment.</p>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Rule"}
        </Button>
      </div>
    </form>
  );
};
export default DeductionRuleForm;
