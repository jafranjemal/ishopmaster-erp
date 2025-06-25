import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Button,
  Modal,
  FilterBar,
  Pagination,
  AlertModal,
  Select,
  Label,
} from "ui-library";
import { PlusCircle, Loader2 } from "lucide-react";

import { tenantAccountingService } from "../services/api";
import AccountList from "../components/accounting/AccountList";
import AccountForm from "../components/accounting/AccountForm";

// A custom hook to parse query params from the URL
const useQuery = () => new URLSearchParams(useLocation().search);

const ChartOfAccountsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const query = useQuery();

  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: parseInt(query.get("page")) || 1,
    limit: 50, // Let's show more accounts by default
    searchTerm: query.get("searchTerm") || "",
    type: query.get("type") || "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteAlert, setDeleteAlert] = useState({
    isOpen: false,
    accountId: null,
  });

  // The core data fetching logic. It is wrapped in useCallback for optimization.
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Create a URL-friendly query string from the filters state
      const queryParams = new URLSearchParams(filters).toString();
      const res = await tenantAccountingService.getChartOfAccounts(queryParams);

      setAccounts(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error(t("errors.failed_to_load_accounts"));
    } finally {
      setIsLoading(false);
    }
  }, [filters, t]);

  // This effect synchronizes the URL with the filter state and triggers a refetch.
  useEffect(() => {
    const queryParams = new URLSearchParams(filters).toString();
    navigate(`?${queryParams}`, { replace: true });
    fetchData();
  }, [filters, navigate, fetchData]);

  // Handler for your new controlled FilterBar component
  const handleFilterChange = (key, value) => {
    // When a filter changes, we reset to page 1
    setFilters((prev) => ({ ...prev, page: 1, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 50, searchTerm: "", type: "" });
  };

  // Handler for the Pagination component
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAlert.accountId) return;
    const promise = tenantAccountingService.deleteAccount(
      deleteAlert.accountId
    );
    await toast.promise(promise, {
      loading: t("common.buttons.deleting"),
      success: t("accounts_page.delete_success"),
      error: (err) =>
        err.response?.data?.error || t("errors.failed_to_delete_account"),
    });
    setDeleteAlert({ isOpen: false, accountId: null });
    fetchData(); // Refresh the list
  };

  const handleSave = async (formData) => {
    const promise = editingAccount
      ? tenantAccountingService.updateAccount(editingAccount._id, formData)
      : tenantAccountingService.createAccount(formData);

    await toast.promise(promise, {
      loading: t("common.buttons.saving"),
      success: editingAccount
        ? t("accounts_page.update_success")
        : t("accounts_page.create_success"),
      error: (err) =>
        err.response?.data?.error || t("errors.failed_to_save_account"),
    });
    setIsModalOpen(false);
    setEditingAccount(null);
    fetchData();
  };

  // Options for the custom filter dropdown
  const accountTypeOptions = [
    { value: "", label: "All Types" },
    { value: "Asset", label: "Asset" },
    { value: "Liability", label: "Liability" },
    { value: "Equity", label: "Equity" },
    { value: "Revenue", label: "Revenue" },
    { value: "Expense", label: "Expense" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("accounts_page.title")}</h1>
          <p className="mt-1 text-slate-400">{t("accounts_page.subtitle")}</p>
        </div>
        <Button
          onClick={() => {
            setEditingAccount(null);
            setIsModalOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("accounts_page.new_account_button")}
        </Button>
      </div>

      <FilterBar
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        // The onApplyFilters prop is not needed if we filter on every change
      >
        {/* We inject our custom dropdown into the FilterBar via its children prop */}
        <div className="flex-grow min-w-[150px]">
          <Label>{t("account_list.header_type")}</Label>
          <Select
            name="type"
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            options={accountTypeOptions}
          />
        </div>
      </FilterBar>

      <div className="bg-slate-800 rounded-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-400" />
          </div>
        ) : (
          <AccountList
            accounts={accounts}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteAlert({ isOpen: true, accountId: id })}
          />
        )}
        {pagination && pagination.total > 0 && (
          <Pagination {...pagination} onPageChange={handlePageChange} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? "Edit Account" : "Create New Account"}
      >
        <AccountForm
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          accountToEdit={editingAccount}
          parentAccounts={accounts}
        />
      </Modal>

      <AlertModal
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false, accountId: null })}
        onConfirm={handleDeleteConfirm}
        title={t("accounts_page.delete_title")}
        message={t("accounts_page.delete_message")}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
};

export default ChartOfAccountsPage;
