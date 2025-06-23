import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "ui-library";

const CurrencyForm = ({ currencyToEdit, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({ name: "", code: "", symbol: "" });
  useEffect(() => {
    setFormData(
      currencyToEdit
        ? {
            name: currencyToEdit.name,
            code: currencyToEdit.code,
            symbol: currencyToEdit.symbol,
          }
        : { name: "", code: "", symbol: "" }
    );
  }, [currencyToEdit]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Currency Code (e.g., USD)</Label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            disabled={!!currencyToEdit}
          />
        </div>
        <div>
          <Label htmlFor="symbol">Symbol (e.g., $)</Label>
          <Input
            id="symbol"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="name">Currency Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., United States Dollar"
        />
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Currency"}
        </Button>
      </div>
    </form>
  );
};
export default CurrencyForm;
