import React, { useMemo } from "react";
import StatCard from "../dashboard/StatCard"; // Assuming we create this or reuse from a general components folder
import { DollarSign, Landmark, PiggyBank } from "lucide-react";

/**
 * A component to calculate and display key financial metrics for a customer.
 * It receives raw ledger data and credit limit and derives the values.
 */
const CustomerFinancialSummary = ({
  ledgerEntries = [],
  creditLimit = 0,
  ledgerAccountId,
}) => {
  // useMemo ensures these expensive calculations only run when ledgerEntries change.
  const financialSummary = useMemo(() => {
    let balance = 0;
    let totalSpent = 0;

    // The logic assumes a standard double-entry structure where AR is debited for invoices
    // and credited for payments.
    for (const entry of ledgerEntries) {
      if (entry.debitAccountId._id === ledgerAccountId) {
        balance += entry.amount; // Customer owes more
      }
      if (entry.creditAccountId._id === ledgerAccountId) {
        balance -= entry.amount; // Customer paid or got credit
      }

      // A simple way to calculate total spent is to sum all sale-related debits.
      // A more robust way might be to query the Sales collection directly.
      if (entry.saleId && entry.debitAccountId._id === ledgerAccountId) {
        totalSpent += entry.amount;
      }
    }

    return {
      currentBalance: balance,
      lifetimeValue: totalSpent,
    };
  }, [ledgerEntries, ledgerAccountId]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <StatCard
        title="Current Balance (Due)"
        value={formatCurrency(financialSummary.currentBalance)}
        icon={DollarSign}
        description={
          financialSummary.currentBalance > 0
            ? "Amount owed by customer"
            : "Customer has credit"
        }
        iconBgColor={
          financialSummary.currentBalance > 0
            ? "bg-amber-500/30"
            : "bg-green-600/30"
        }
      />
      <StatCard
        title="Lifetime Value"
        value={formatCurrency(financialSummary.lifetimeValue)}
        icon={Landmark}
        description="Total value of all completed sales."
      />
      <StatCard
        title="Credit Limit"
        value={formatCurrency(creditLimit)}
        icon={PiggyBank}
        description="Maximum amount of credit allowed."
      />
    </div>
  );
};

export default CustomerFinancialSummary;
