import React, { useState, useMemo } from "react";
import { Button, Input, Label } from "ui-library";
import useAuth from "../../context/useAuth";

const ShiftCloseForm = ({ activeShift, onSave, onCancel, isSaving }) => {
  const [closingFloat, setClosingFloat] = useState("");
  const { formatCurrency, user } = useAuth();

  const expectedAmount = activeShift.openingFloat + activeShift.calculatedCashIn - activeShift.calculatedCashOut;
  const variance = useMemo(() => {
    if (closingFloat === "") return 0;
    return Number(closingFloat) - expectedAmount;
  }, [closingFloat, expectedAmount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ closingFloat: Number(closingFloat), userId: user.id });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-slate-900/50 rounded-lg space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Opening Float:</span>
          <span>{formatCurrency(activeShift.openingFloat)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">+ System Cash Sales:</span>
          <span>{formatCurrency(activeShift.calculatedCashIn)}</span>
        </div>
        <div className="flex justify-between border-b border-slate-700 pb-2">
          <span className="text-slate-400">- System Cash Refunds:</span>
          <span>{formatCurrency(activeShift.calculatedCashOut)}</span>
        </div>
        <div className="flex justify-between font-bold pt-2">
          <span className="text-slate-300">Expected in Drawer:</span>
          <span>{formatCurrency(expectedAmount)}</span>
        </div>
      </div>
      <div>
        <Label htmlFor="closingFloat">Actual Cash Counted</Label>
        <Input
          id="closingFloat"
          type="number"
          step="0.01"
          value={closingFloat}
          onChange={(e) => setClosingFloat(e.target.value)}
          required
          placeholder="Enter final physical cash amount"
        />
      </div>
      <div className="flex justify-between p-4 rounded-lg bg-slate-800">
        <span className="font-bold">Variance</span>
        <span className={`font-bold font-mono ${variance > 0 ? "text-green-400" : variance < 0 ? "text-red-400" : ""}`}>
          {formatCurrency(variance)}
        </span>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Closing..." : "Close Shift & Reconcile"}
        </Button>
      </div>
    </form>
  );
};
export default ShiftCloseForm;
