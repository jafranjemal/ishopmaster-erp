import React from "react";
import { Button } from "ui-library";
import useAuth from "../../context/useAuth";
import { CreditCard } from "lucide-react";

const TotalsPanel = ({ totals, onPay }) => {
  const { formatCurrency } = useAuth();
  return (
    <div className="bg-slate-900 rounded-lg p-4 space-y-3">
      <div className="flex justify-between text-slate-300">
        <p>Subtotal</p>
        <p className="font-mono">{formatCurrency(totals.subTotal)}</p>
      </div>
      <div className="flex justify-between text-slate-300">
        <p>Tax (VAT 15%)</p>
        <p className="font-mono">{formatCurrency(totals.totalTax)}</p>
      </div>
      <div className="flex justify-between items-center text-white font-bold text-2xl border-t border-slate-700 pt-3">
        <p>Total</p>
        <p className="font-mono">{formatCurrency(totals.totalAmount)}</p>
      </div>
      <Button onClick={onPay} size="lg" className="w-full h-14 text-lg mt-2">
        <CreditCard className="h-6 w-6 mr-3" /> Pay
      </Button>
    </div>
  );
};
export default TotalsPanel;
