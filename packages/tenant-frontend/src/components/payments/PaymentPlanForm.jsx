import React, { useState, useMemo } from "react";
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
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "ui-library";
import useAuth from "../../context/useAuth";

const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

/**
 * A form for configuring a new installment payment plan.
 * @param {object} props
 * @param {number} props.totalAmount - The total amount to be split into installments.
 * @param {Function} props.onSave - Callback function to execute with the plan configuration.
 * @param {Function} props.onCancel - Callback function to close the modal.
 * @param {boolean} props.isSaving - Indicates if the save operation is in progress.
 */
const PaymentPlanForm = ({ totalAmount, onSave, onCancel, isSaving }) => {
  const { formatCurrency } = useAuth();

  const [formData, setFormData] = useState({
    numberOfInstallments: 12,
    startDate: new Date().toISOString().split("T")[0],
    frequency: "monthly",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const calculatedInstallment = useMemo(() => {
    if (!formData.numberOfInstallments || formData.numberOfInstallments <= 0) {
      return 0;
    }
    return totalAmount / formData.numberOfInstallments;
  }, [totalAmount, formData.numberOfInstallments]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader className="text-center p-0">
          <CardDescription>Total Plan Amount</CardDescription>
          <CardTitle className="text-4xl font-bold font-mono">
            {formatCurrency(totalAmount)}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numberOfInstallments">Number of Installments</Label>
          <Input
            id="numberOfInstallments"
            name="numberOfInstallments"
            type="number"
            min="2"
            value={formData.numberOfInstallments}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="frequency">Payment Frequency</Label>
          <Select
            onValueChange={(val) => handleSelectChange("frequency", val)}
            value={formData.frequency}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="startDate">First Payment Due Date</Label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="p-4 bg-slate-900/50 rounded-lg text-center">
        <p className="text-sm text-slate-400">Calculated Installment Amount</p>
        <p className="text-xl font-semibold">
          {formatCurrency(calculatedInstallment)} /{" "}
          {formData.frequency.replace("ly", "")}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Note: Final installment may be slightly different due to rounding.
        </p>
      </div>

      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Creating Plan..." : "Create Installment Plan"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentPlanForm;
