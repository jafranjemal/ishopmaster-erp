import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { tenantAccountingService } from "../services/api";
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Pagination,
} from "ui-library";
import LedgerView from "../components/accounting/LedgerView";
import useAuth from "../context/useAuth";
import { ArrowLeft, Loader2 } from "lucide-react";
import IndividualLedgerView from "../components/accounting/IndividualLedgerView";

const IndividualLedgerPage = () => {
  const { t } = useTranslation();
  const { accountId } = useParams();
  const { formatCurrency } = useAuth();

  const [account, setAccount] = useState(null);
  const [ledger, setLedger] = useState({ entries: [], pagination: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch account details and first page of ledger entries in parallel
      const [accountRes, ledgerRes] = await Promise.all([
        tenantAccountingService.getAccountById(accountId),
        tenantAccountingService.getLedgerForAccount(
          accountId,
          `page=${page}&limit=25`
        ),
      ]);

      setAccount(accountRes.data.data);
      setLedger({
        entries: ledgerRes.data.data,
        pagination: ledgerRes.data.pagination,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || t("errors.failed_to_load_ledger");
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, page, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading && !account)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-400" />
      </div>
    );

  if (error)
    return <div className="p-8 text-center text-red-400">Error: {error}</div>;
  if (!account)
    return <div className="p-8 text-center">Account not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/accounting/chart"
          className="inline-flex items-center text-sm text-indigo-400 hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("ledger_page.back_button", "Back to Chart of Accounts")}
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{account.name}</h1>
          <Badge variant="secondary">{account.type}</Badge>
        </div>
        <p className="text-slate-400 mt-1">
          {t(
            "ledger_page.subtitle",
            "Showing all transactions for this account."
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {t("ledger_page.current_balance_title", "Current Balance")}
            </CardTitle>
            <span className="text-2xl font-semibold font-mono text-white">
              {formatCurrency(account.balance)}
            </span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("ledger_page.transaction_history_title", "Transaction History")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin h-6 w-6 text-indigo-400" />
            </div>
          ) : (
            <IndividualLedgerView
              entries={ledger.entries}
              account={account}
              pagination={ledger.pagination}
            />
          )}
          {ledger.pagination && ledger.pagination.total > 0 && (
            <Pagination
              {...ledger.pagination}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualLedgerPage;
