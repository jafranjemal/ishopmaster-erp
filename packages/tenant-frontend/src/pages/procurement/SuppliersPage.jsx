import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { tenantSupplierService } from "../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import SupplierList from "../../components/procurement/SupplierList";
import SupplierForm from "../../components/procurement/SupplierForm";

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // State for delete confirmation

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantSupplierService.getAll();
      setSuppliers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      toast.error("Failed to fetch suppliers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreateModal = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    const isEditMode = Boolean(editingSupplier);
    const apiCall = isEditMode
      ? tenantSupplierService.update(editingSupplier._id, formData)
      : tenantSupplierService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: "Saving supplier...",
        success: `Supplier "${formData.name}" saved successfully!`,
        error: (err) => err.response?.data?.error || "Failed to save supplier.",
      });
      fetchData();
      handleCloseModals();
      return null;
    } catch (err) {
      return err.response?.data?.error || "An unexpected error occurred.";
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(tenantSupplierService.delete(deleteConfirm._id), {
        loading: "Deleting supplier...",
        success: `Supplier "${deleteConfirm.name}" deleted.`,
        error: (err) =>
          err.response?.data?.error || "Failed to delete supplier.",
      });
      fetchData();
      handleCloseModals();
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Supplier Management</h1>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Supplier
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-4 text-center">Loading suppliers...</p>
          ) : (
            <SupplierList
              suppliers={suppliers}
              onEdit={handleOpenEditModal}
              onDelete={setDeleteConfirm}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={editingSupplier ? "Edit Supplier" : "Create New Supplier"}
      >
        <SupplierForm
          supplierToEdit={editingSupplier}
          onSave={handleSave}
          onCancel={handleCloseModals}
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
            Are you sure you want to delete supplier "{deleteConfirm?.name}"?
          </p>
          <p className="text-sm text-slate-400 mt-2">
            This is only possible if the supplier has no transaction history.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Supplier
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
