import React, { useState } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "ui-library";

import { GitCommitVertical } from "lucide-react";
import ProductVariantSearch from "../procurement/ProductVariantSearch";

const ADJUSTMENT_REASONS = [
  { value: "recount_add", label: "Stock Recount (Found)", type: "in" },
  { value: "recount_remove", label: "Stock Recount (Missing)", type: "out" },
  { value: "damaged", label: "Damaged Goods", type: "out" },
  { value: "theft_loss", label: "Theft or Loss", type: "out" },
  { value: "other_in", label: "Other (Add Stock)", type: "in" },
  { value: "other_out", label: "Other (Remove Stock)", type: "out" },
];

const StockAdjustmentForm = ({ branches, onSave, isSaving }) => {
  const initialFormState = {
    ProductVariantId: null,
    ProductVariantsName: "",
    branchId: "",
    quantityChange: "",
    reason: ADJUSTMENT_REASONS[0].value,
    notes: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleProductSelect = (variant) => {
    setFormData((prev) => ({
      ...prev,
      ProductVariantId: variant._id,
      ProductVariantsName: variant.variantName,
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedReason = ADJUSTMENT_REASONS.find((r) => r.value === formData.reason);
    const quantity = Number(formData.quantityChange);
    const quantityWithDirection = selectedReason.type === "out" ? -Math.abs(quantity) : Math.abs(quantity);

    const payload = {
      ProductVariantId: formData.ProductVariantId,
      branchId: formData.branchId,
      quantityChange: quantityWithDirection,
      notes: `[${selectedReason.label}] ${formData.notes}`,
      // costPriceInBaseCurrency will be determined by the backend service
    };

    // The onSave function (from the parent page) handles the API call
    const success = await onSave(payload);
    if (success) {
      setFormData(initialFormState); // Reset form on success
    }
  };

  const isFormInvalid = isSaving || !formData.ProductVariantId || !formData.branchId || !formData.quantityChange || !formData.notes;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Adjustment</CardTitle>
        <CardDescription>All adjustments are logged in the audit trail. Please provide clear notes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>1. Search for Product Variant</Label>
            {formData.ProductVariantsName ? (
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-md mt-1">
                <span className="font-medium">{formData.ProductVariantsName}</span>
                <Button
                  size="sm"
                  variant="link"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      ProductVariantId: null,
                      ProductVariantsName: "",
                    }))
                  }
                >
                  Change
                </Button>
              </div>
            ) : (
              <ProductVariantSearch onProductSelect={handleProductSelect} />
            )}
          </div>

          <div>
            <Label htmlFor="branchId">2. Select Branch of Adjustment</Label>
            <Select onValueChange={(val) => handleSelectChange("branchId", val)} value={formData.branchId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select branch location..." />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantityChange">3. Quantity to Adjust</Label>
              <Input
                id="quantityChange"
                name="quantityChange"
                type="number"
                min="1"
                value={formData.quantityChange}
                onChange={handleChange}
                required
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <Label htmlFor="reason">4. Reason for Adjustment</Label>
              <Select onValueChange={(val) => handleSelectChange("reason", val)} value={formData.reason} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">5. Notes for Audit Trail (Required)</Label>
            <Input
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              required
              placeholder="e.g., Found during weekly stock count in warehouse section A."
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isFormInvalid}>
              <GitCommitVertical className="h-4 w-4 mr-2" />
              {isSaving ? "Submitting..." : "Submit Adjustment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StockAdjustmentForm;
