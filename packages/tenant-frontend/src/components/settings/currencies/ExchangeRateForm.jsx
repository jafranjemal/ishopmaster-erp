import React, { useState } from "react";
import { Button, Input, Label } from "ui-library";
import useAuth from "../../../context/useAuth";

const ExchangeRateForm = ({ currencies, onSave, isSaving }) => {
  const { tenantProfile } = useAuth();
  const baseCurrency =
    tenantProfile?.settings?.localization?.baseCurrency || "USD";
  const otherCurrencies = currencies.filter((c) => c.code !== baseCurrency);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    fromCurrency: otherCurrencies[0]?.code || "",
    toCurrency: baseCurrency,
    rate: "",
  });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700"
    >
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="fromCurrency">From Currency</Label>
        <select
          id="fromCurrency"
          name="fromCurrency"
          value={formData.fromCurrency}
          onChange={handleChange}
          className="ui-input w-full h-10 mt-1"
        >
          {otherCurrencies.map((c) => (
            <option key={c._id} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="toCurrency">To Currency</Label>
        <Input
          id="toCurrency"
          name="toCurrency"
          value={formData.toCurrency}
          disabled
        />
      </div>
      <div>
        <Label htmlFor="rate">Rate</Label>
        <Input
          id="rate"
          name="rate"
          type="number"
          step="any"
          value={formData.rate}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Adding..." : "Add Rate"}
      </Button>
    </form>
  );
};
export default ExchangeRateForm;
