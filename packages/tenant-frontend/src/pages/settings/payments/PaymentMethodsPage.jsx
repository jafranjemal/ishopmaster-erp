import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";

// Import all necessary services and components
import {
  tenantPaymentMethodService,
  tenantAccountingService,
} from "../../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import PaymentMethodForm from "../../../components/settings/payments/PaymentMethodForm";
import PaymentMethodList from "../../../components/settings/payments/PaymentMethodList";

const PaymentMethodsPage = () => {
  // --- STATE MANAGEMENT ---
  const [methods, setMethods] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // State for the delete confirmation modal
  const [isSaving, setIsSaving] = useState(false);

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [methodsRes, accountsRes] = await Promise.all([
        tenantPaymentMethodService.getAll(),
        tenantAccountingService.getAllAccounts(),
      ]);
      setMethods(methodsRes.data.data);
      setAccounts(accountsRes.data.data);
    } catch (error) {
      toast.error("Failed to load data for payment methods.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLER FUNCTIONS ---
  const handleOpenCreateModal = () => {
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (method) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null); // Ensure delete confirmation is also closed
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingMethod
      ? tenantPaymentMethodService.update(editingMethod._id, formData)
      : tenantPaymentMethodService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: "Saving payment method...",
        success: `Method "${formData.name}" saved successfully!`,
        error: (err) => err.response?.data?.error || "Failed to save method.",
      });
      fetchData();
      handleCloseModals();
    } catch (error) {
      /* error is handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(
        tenantPaymentMethodService.delete(deleteConfirm._id),
        {
          loading: `Deleting "${deleteConfirm.name}"...`,
          success: "Payment method deleted successfully.",
          error: (err) =>
            err.response?.data?.error || "Failed to delete method.",
        }
      );
      fetchData();
      handleCloseModals();
    } catch (error) {
      // Error is handled by the toast promise, but we can log it for debugging
      console.error("Delete operation failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="mt-1 text-slate-400">
            Configure how your business accepts and makes payments.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Payment Method
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center">Loading payment methods...</p>
          ) : (
            <PaymentMethodList
              methods={methods}
              onEdit={handleOpenEditModal}
              onDelete={setDeleteConfirm} // Pass the handler to open the confirmation modal
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={editingMethod ? "Edit Payment Method" : "Create New Method"}
      >
        <PaymentMethodForm
          methodToEdit={editingMethod}
          accounts={accounts}
          onSave={handleSave}
          onCancel={handleCloseModals}
          isSaving={isSaving}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={handleCloseModals}
        title="Confirm Deletion"
      >
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">
            Are you sure you want to delete the payment method "
            {deleteConfirm?.name}"?
          </p>
          <p className="text-sm text-slate-400 mt-2">
            This action cannot be undone.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentMethodsPage;
