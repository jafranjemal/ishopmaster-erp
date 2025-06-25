import React from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";
import useAuth from "../../context/useAuth";
import { Library } from "lucide-react";

const IndividualLedgerView = ({ entries = [], account, pagination }) => {
  const { t } = useTranslation();
  const { formatDate, formatCurrency } = useAuth();

  // Starting balance (same note: you'd ideally fetch this from the API)
  const getStartingBalance = () => {
    return account.balance;
  };

  let runningBalance = getStartingBalance();

  // Reverse for oldest-first display (if needed)
  const displayedEntries = [...entries].reverse();

  if (!displayedEntries || displayedEntries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Library className="mx-auto h-12 w-12" />
        <h3 className="mt-2 text-lg font-semibold">
          {t("ledger_page.no_transaction_history_title")}
        </h3>
        <p className="mt-1 text-sm">
          {t(
            "ledger_page.no_transaction_history_subtitle",
            "Get started by creating a new financial account."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("ledger_view.header_date", "Date")}</TableHead>
            <TableHead>
              {t("ledger_view.header_description", "Description")}
            </TableHead>
            <TableHead className="text-right">
              {t("ledger_view.header_debit", "Debit")}
            </TableHead>
            <TableHead className="text-right">
              {t("ledger_view.header_credit", "Credit")}
            </TableHead>
            <TableHead className="text-right">
              {t("ledger_view.header_balance", "Balance")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedEntries.map((entry) => {
            const isDebit = entry.debitAccountId === account._id;
            const isCredit = entry.creditAccountId === account._id;

            let debitAmount = isDebit ? entry.amount : 0;
            let creditAmount = isCredit ? entry.amount : 0;

            // Adjust running balance
            runningBalance += debitAmount - creditAmount;

            return (
              <TableRow key={entry._id}>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-right font-mono text-green-400">
                  {debitAmount > 0 ? formatCurrency(debitAmount) : ""}
                </TableCell>
                <TableCell className="text-right font-mono text-red-400">
                  {creditAmount > 0 ? formatCurrency(creditAmount) : ""}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(runningBalance)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default IndividualLedgerView;
