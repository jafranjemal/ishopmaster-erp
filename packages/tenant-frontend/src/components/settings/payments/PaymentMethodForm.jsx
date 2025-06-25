import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const METHOD_TYPES = [
  "cash",
  "card",
  "bank_transfer",
  "cheque",
  "loyalty_points",
  "custom",
];

const PaymentMethodForm = ({
  methodToEdit,
  accounts,
  onSave,
  onCancel,
  isSaving,
}) => {
  const initialFormData = {
    name: "",
    type: "cash",
    linkedAccountId: "",
    holdingAccountId: null,
  };
  const [formData, setFormData] = useState(initialFormData);
  const isEditMode = Boolean(methodToEdit);

  useEffect(() => {
    if (isEditMode && methodToEdit) {
      setFormData({
        name: methodToEdit.name || "",
        type: methodToEdit.type || "cash",
        linkedAccountId: methodToEdit.linkedAccountId?._id || null,
        holdingAccountId: methodToEdit.holdingAccountId?._id || null,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [methodToEdit, isEditMode]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const assetAccounts = accounts.filter((a) => a.type === "Asset");
  const liabilityAccounts = accounts.filter((a) => a.type === "Liability");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Method Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Main Cash Drawer, AMEX Card Terminal"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Payment Type</Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full h-10 mt-1"
          >
            <option value="" disabled>
              Select Type
            </option>
            {METHOD_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="linkedAccountId">Linked Asset Account</Label>
          <select
            id="linkedAccountId"
            name="linkedAccountId"
            value={formData.linkedAccountId}
            onChange={handleChange}
            required
            className="ui-input w-full h-10 mt-1"
          >
            <option value="" disabled>
              Select Account
            </option>
            {assetAccounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            The account where funds are deposited/withdrawn from.
          </p>
        </div>
      </div>
      {formData.type === "cheque" && (
        <div>
          <Label htmlFor="holdingAccountId">Cheque Holding Account</Label>
          <select
            id="holdingAccountId"
            name="holdingAccountId"
            value={formData.holdingAccountId}
            onChange={handleChange}
            required
            className="ui-input w-full h-10 mt-1"
          >
            <option value="" disabled>
              Select Holding Account
            </option>
            {liabilityAccounts
              .filter((a) => a.subType.includes("Cheque"))
              .map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            The temporary account for pending cheques.
          </p>
        </div>
      )}
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Method"}
        </Button>
      </div>
    </form>
  );
};
export default PaymentMethodForm;
