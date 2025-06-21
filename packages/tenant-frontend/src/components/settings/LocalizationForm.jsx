import React, { useState, useEffect } from "react";
import { Button, Label, Badge } from "ui-library";
import { X, PlusCircle } from "lucide-react";

// In a real app, these would be in a shared constants file
const ALL_CURRENCIES = ["USD", "LKR", "INR", "EUR", "GBP", "AUD"];
const ALL_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ta", name: "தமிழ்" },
  { code: "si", name: "සිංහල" },
  { code: "ar", name: "العربية" },
];
const ALL_TIMEZONES = [
  "UTC",
  "Asia/Colombo",
  "Asia/Kolkata",
  "Europe/London",
  "America/New_York",
];

const LocalizationForm = ({ currentSettings, onSave, isSaving }) => {
  const [formData, setFormData] = useState(currentSettings);
  const [newCurrency, setNewCurrency] = useState("");

  useEffect(() => {
    setFormData(currentSettings);
  }, [currentSettings]);

  const isChanged =
    JSON.stringify(formData) !== JSON.stringify(currentSettings);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddCurrency = () => {
    if (newCurrency && !formData.supportedCurrencies.includes(newCurrency)) {
      setFormData((prev) => ({
        ...prev,
        supportedCurrencies: [...prev.supportedCurrencies, newCurrency],
      }));
      setNewCurrency("");
    }
  };

  const handleRemoveCurrency = (currencyToRemove) => {
    if (currencyToRemove === formData.baseCurrency) return; // Prevent removing base currency
    setFormData((prev) => ({
      ...prev,
      supportedCurrencies: prev.supportedCurrencies.filter(
        (c) => c !== currencyToRemove
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="baseCurrency">Base Currency (for Accounting)</Label>
          <select
            id="baseCurrency"
            name="baseCurrency"
            value={formData?.baseCurrency}
            onChange={handleChange}
            className="w-full h-10 mt-1 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm"
          >
            {ALL_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            All financial reports will be calculated in this currency.
          </p>
        </div>
        <div>
          <Label htmlFor="defaultLanguage">Default Language</Label>
          <select
            id="defaultLanguage"
            name="defaultLanguage"
            value={formData?.defaultLanguage}
            onChange={handleChange}
            className="w-full h-10 mt-1 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm"
          >
            {ALL_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          name="timezone"
          value={formData?.timezone}
          onChange={handleChange}
          className="w-full h-10 mt-1 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm"
        >
          {ALL_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400 mt-1">
          This determines the time for all sales and reports.
        </p>
      </div>
      <div>
        <Label>Supported Currencies (for POS Transactions)</Label>
        <div className="mt-2 flex flex-wrap gap-2 p-4 border border-slate-700 rounded-lg">
          {formData?.supportedCurrencies.map((currency) => (
            <Badge
              key={currency}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {currency}
              {currency !== formData?.baseCurrency && (
                <button
                  type="button"
                  onClick={() => handleRemoveCurrency(currency)}
                  className="rounded-full hover:bg-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <select
            value={newCurrency}
            onChange={(e) => setNewCurrency(e.target.value)}
            className="flex-grow h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm"
          >
            <option value="" disabled>
              Add a currency...
            </option>
            {ALL_CURRENCIES.filter(
              (c) => !formData?.supportedCurrencies.includes(c)
            ).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddCurrency}
            disabled={!newCurrency}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isSaving || !isChanged}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default LocalizationForm;
