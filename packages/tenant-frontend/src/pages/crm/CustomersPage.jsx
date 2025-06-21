import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { tenantCustomerService } from "../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import CustomerList from "../../components/crm/CustomerList";
import CustomerForm from "../../components/crm/CustomerForm";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantCustomerService.getAll();
      setCustomers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to fetch customers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    const isEditMode = Boolean(editingCustomer);
    const apiCall = isEditMode
      ? tenantCustomerService.update(editingCustomer._id, formData)
      : tenantCustomerService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: "Saving customer...",
        success: `Customer "${formData.name}" saved successfully!`,
        error: (err) => err.response?.data?.error || "Failed to save customer.",
      });
      fetchData();
      setIsModalOpen(false);
      return null; // Indicate success to form
    } catch (err) {
      return err.response?.data?.error || "An unexpected error occurred."; // Return error message
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(tenantCustomerService.delete(deleteConfirm._id), {
        loading: "Deleting customer...",
        success: `Customer "${deleteConfirm.name}" deleted.`,
        error: (err) =>
          err.response?.data?.error || "Failed to delete customer.",
      });
      fetchData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customer Management</h1>
        <Button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> New Customer
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-4 text-center">Loading customers...</p>
          ) : (
            <CustomerList
              customers={customers}
              onEdit={(c) => {
                setEditingCustomer(c);
                setIsModalOpen(true);
              }}
              onDelete={setDeleteConfirm}
            />
          )}
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? "Edit Customer" : "Create New Customer"}
      >
        <CustomerForm
          customerToEdit={editingCustomer}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete customer "{deleteConfirm?.name}"?</p>
        <p className="text-sm text-slate-400 mt-2">
          This is only possible if the customer has no transaction history.
        </p>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Customer
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CustomersPage;
