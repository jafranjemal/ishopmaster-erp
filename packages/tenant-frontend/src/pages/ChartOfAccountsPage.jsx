import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";

// We will create AccountForm and use it in the modal in a future step
// import AccountForm from '../../components/accounting/AccountForm';
import AccountForm from "../components/accounting/AccountForm";
import { Button, Modal, Card } from "ui-library";
import { tenantAccountingService } from "../services/api";
import AccountList from "../components/accounting/AccountList";

/**
 * The main "smart" page for managing the Chart of Accounts.
 * This component handles all data fetching, state management, and user actions.
 */
const ChartOfAccountsPage = () => {
  // --- STATE MANAGEMENT ---
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantAccountingService.getAllAccounts();
      setAccounts(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch chart of accounts.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect hook to fetch data when the component first mounts.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLER FUNCTIONS ---
  // 2. Implement the handleSave function
  const handleSave = async (formData) => {
    const isEditMode = Boolean(editingAccount);
    const apiCall = isEditMode
      ? tenantAccountingService.updateAccount(editingAccount._id, formData)
      : tenantAccountingService.createAccount(formData);

    try {
      await toast.promise(apiCall, {
        loading: "Saving account...",
        success: `Account "${formData.name}" saved successfully!`,
        error: (err) => err.response?.data?.error || "Failed to save account.",
      });

      fetchData(); // Refetch data to show changes
      setIsModalOpen(false); // Close the modal
      return null; // Indicate success to the form
    } catch (err) {
      // Toast promise handles displaying the error, but we return it so the form can stop its saving state
      return err.response?.data?.error || "An unexpected error occurred.";
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await toast.promise(
        tenantAccountingService.deleteAccount(deleteConfirm._id),
        {
          loading: "Deleting account...",
          success: `Account "${deleteConfirm.name}" deleted successfully.`,
          error: (err) =>
            err.response?.data?.error || "Failed to delete account.",
        }
      );
      // After a successful deletion, refetch the data to update the UI.
      fetchData();
    } catch (error) {
      // Toast promise already shows the error, but we can log it.
      console.error("Deletion failed:", error);
    } finally {
      // Always close the confirmation modal.
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            Chart of Accounts
          </h1>
          <p className="mt-1 text-slate-400">
            Manage all financial accounts for your business.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAccount(null);
            setIsModalOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Account
        </Button>
      </div>

      <Card className="p-0">
        {isLoading ? (
          <p className="p-8 text-center">Loading accounts...</p>
        ) : (
          <AccountList
            accounts={accounts}
            onEdit={(account) => {
              setEditingAccount(account);
              setIsModalOpen(true);
            }}
            onDelete={setDeleteConfirm}
          />
        )}
      </Card>

      {/* 3. Integrate the form into the modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? "Edit Account" : "Create New Account"}
      >
        <AccountForm
          accountToEdit={editingAccount}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Deletion"
      >
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">
            Are you sure you want to delete account "{deleteConfirm?.name}"?
          </p>
          <p className="text-sm text-slate-400 mt-2">
            This action cannot be undone and is only possible if the account has
            no transactions.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Account
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ChartOfAccountsPage;
