import React, { useState, useEffect } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";

const PricingRuleForm = ({ ruleToEdit, customerGroups, categories, onSave, onCancel, isSaving }) => {
  const initialFormState = { name: "", customerGroupId: "", productCategoryId: "", discount: { type: "percentage", value: 0 } };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (ruleToEdit) {
      setFormData({
        name: ruleToEdit.name || "",
        customerGroupId: ruleToEdit.customerGroupId?._id || "",
        productCategoryId: ruleToEdit.productCategoryId?._id || "",
        discount: ruleToEdit.discount || { type: "percentage", value: 0 },
      });
    } else {
      setFormData(initialFormState);
    }
  }, [ruleToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "discountType") {
      setFormData((prev) => ({ ...prev, discount: { ...prev.discount, type: value } }));
    } else if (name === "discountValue") {
      setFormData((prev) => ({ ...prev, discount: { ...prev.discount, value: Number(value) } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Rule Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., VIP Customer Discount" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Target Customer Group (Optional)</Label>
          <Select onValueChange={(val) => handleSelectChange("customerGroupId", val)} value={formData.customerGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              {customerGroups.map((g) => (
                <SelectItem key={g._id} value={g._id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Target Category (Optional)</Label>
          <Select onValueChange={(val) => handleSelectChange("productCategoryId", val)} value={formData.productCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Discount Type</Label>
          <Select onValueChange={(val) => handleChange({ target: { name: "discountType", value: val } })} value={formData.discount.type}>
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
          <Input name="discountValue" type="number" step="0.01" value={formData.discount.value} onChange={handleChange} required />
        </div>
      </div>
      <div className="pt-4 flex justify-end">
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
export default PricingRuleForm;
