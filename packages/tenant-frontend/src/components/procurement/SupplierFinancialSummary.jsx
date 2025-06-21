import React, { useMemo } from "react";
import StatCard from "../dashboard/StatCard";
import { DollarSign, Landmark } from "lucide-react";

const SupplierFinancialSummary = ({ ledgerEntries = [], ledgerAccountId }) => {
  const financialSummary = useMemo(() => {
    let balance = 0;
    let totalPurchases = 0;

    for (const entry of ledgerEntries) {
      if (entry.creditAccountId._id === ledgerAccountId)
        balance += entry.amount; // We owe them more
      if (entry.debitAccountId._id === ledgerAccountId) balance -= entry.amount; // We paid them

      if (entry.purchaseId && entry.creditAccountId._id === ledgerAccountId) {
        totalPurchases += entry.amount;
      }
    }
    return { currentBalance: balance, totalPurchaseValue: totalPurchases };
  }, [ledgerEntries, ledgerAccountId]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <StatCard
        title="Current Balance (Payable)"
        value={formatCurrency(financialSummary.currentBalance)}
        icon={DollarSign}
        description={
          financialSummary.currentBalance > 0
            ? "Amount owed to supplier"
            : "Account is settled or in credit"
        }
        iconBgColor={
          financialSummary.currentBalance > 0
            ? "bg-red-600/30"
            : "bg-green-600/30"
        }
      />
      <StatCard
        title="Lifetime Purchase Value"
        value={formatCurrency(financialSummary.totalPurchaseValue)}
        icon={Landmark}
        description="Total value of all completed purchase orders."
      />
    </div>
  );
};

export default SupplierFinancialSummary;
