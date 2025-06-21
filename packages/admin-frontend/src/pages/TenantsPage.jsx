import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle } from "lucide-react";

import TenantForm from "../components/tenants/TenantForm";
import { tenantService, adminModuleService } from "../services/api";
import { Button, Modal } from "ui-library";
import TenantList from "../components/tenants/TenantList";

const TenantsPage = () => {
  const [tenants, setTenants] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [deleteConfirmTenant, setDeleteConfirmTenant] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch tenants and modules in parallel for better performance
      const [tenantsResponse, modulesResponse] = await Promise.all([
        tenantService.getAll(),
        adminModuleService.getAll(),
      ]);
      setTenants(tenantsResponse.data);
      setAvailableModules(modulesResponse.data);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error("Failed to fetch initial data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreateModal = () => {
    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (tenant) => {
    setDeleteConfirmTenant(tenant);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirmTenant(null);
  };

  const handleSave = async (formData) => {
    try {
      if (editingTenant) {
        // Edit logic now uses Promise.all to save both details and modules
        await toast.promise(
          Promise.all([
            tenantService.updateDetails(editingTenant._id, formData),
            tenantService.updateModules(
              editingTenant._id,
              formData.enabledModules
            ),
          ]),
          {
            loading: "Saving tenant...",
            success: `Tenant "${formData.companyName}" updated successfully!`,
            error: "Failed to update tenant.",
          }
        );
      } else {
        // Create logic sends the full object including modules
        await toast.promise(tenantService.create(formData), {
          loading: "Creating tenant...",
          success: `Tenant "${formData.companyName}" created successfully!`,
          error: (err) =>
            err.response?.data?.error || "Failed to create tenant.",
        });
      }
      fetchData(); // Refetch all data on success
      handleCloseModals();
      return null; // Indicate success
    } catch (err) {
      // The toast promise handles displaying the error
      return err.response?.data?.error || "An unexpected error occurred.";
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmTenant) return;
    await toast.promise(tenantService.delete(deleteConfirmTenant._id), {
      loading: "Deleting tenant...",
      success: `Tenant "${deleteConfirmTenant.companyName}" deleted.`,
      error: "Failed to delete tenant.",
    });
    fetchData();
    handleCloseModals();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            Tenant Management
          </h1>
          <p className="mt-1 text-slate-400">
            Create, view, and manage all client accounts and their module
            access.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Tenant
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <TenantList
          tenants={tenants}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteConfirm}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={editingTenant ? "Edit Tenant" : "Create New Tenant"}
      >
        <TenantForm
          tenantToEdit={editingTenant}
          availableModules={availableModules}
          onSave={handleSave}
          onCancel={handleCloseModals}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteConfirmTenant)}
        onClose={handleCloseModals}
        title="Confirm Deletion"
      >
        <p>
          Are you sure you want to delete the tenant "
          {deleteConfirmTenant?.companyName}"?
        </p>
        <div className="mt-4 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Tenant
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TenantsPage;
