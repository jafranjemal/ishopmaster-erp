import React, { useState, useEffect } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";

const PromotionForm = ({ promotionToEdit, onSave, onCancel, isSaving }) => {
  const initialFormState = { name: "", startDate: "", endDate: "", discount: { type: "percentage", value: 0 } };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (promotionToEdit) {
      setFormData({
        name: promotionToEdit.name || "",
        startDate: promotionToEdit.startDate ? new Date(promotionToEdit.startDate).toISOString().split("T")[0] : "",
        endDate: promotionToEdit.endDate ? new Date(promotionToEdit.endDate).toISOString().split("T")[0] : "",
        discount: promotionToEdit.discount || { type: "percentage", value: 0 },
      });
    } else {
      setFormData(initialFormState);
    }
  }, [promotionToEdit]);

  // ... handlers similar to PricingRuleForm ...

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Promotion Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Weekend Flash Sale"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Discount Type</Label>
          <Select
            onValueChange={(val) => setFormData((prev) => ({ ...prev, discount: { ...prev.discount, type: val } }))}
            value={formData.discount.type}
          >
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
          <Label>Discount Value</Label>
          <Input
            name="value"
            type="number"
            step="0.01"
            value={formData.discount.value}
            onChange={(e) => setFormData((prev) => ({ ...prev, discount: { ...prev.discount, value: Number(e.target.value) } }))}
            required
          />
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Promotion"}
        </Button>
      </div>
    </form>
  );
};
export default PromotionForm;
