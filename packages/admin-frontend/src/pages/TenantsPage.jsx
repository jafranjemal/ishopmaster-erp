import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

// Import all necessary services
import { adminTenantService, adminModuleService, tenantService } from "../services/api";

// Import UI library and local components
import { Button, Modal, Card, CardContent, FilterBar, Pagination } from "ui-library";
import TenantList from "../components/tenants/TenantList";
import TenantEditForm from "../components/tenants/TenantEditForm"; // We will use this single form for both create and edit
import TenantForm from "../components/tenants/TenantForm";

const TenantsPage = () => {
  // Data State
  const [tenants, setTenants] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);

  // UI & Workflow State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Pagination & Filtering State
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({ searchTerm: "", isActive: "" });
  const [currentPage, setCurrentPage] = useState(1);

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 15, ...filters };
      if (!params.isActive) delete params.isActive;
      if (!params.searchTerm) delete params.searchTerm;

      const [tenantsResponse, modulesResponse] = await Promise.all([
        adminTenantService.getAll(params),
        adminModuleService.getAll(), // Modules are not paginated, usually a small list
      ]);

      setTenants(tenantsResponse.data.data);
      setPaginationData(tenantsResponse.data.pagination);
      setAvailableModules(modulesResponse.data);
    } catch (error) {
      toast.error("Failed to fetch tenant data.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLER FUNCTIONS ---
  const handleOpenCreateModal = () => {
    setEditingTenant(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingTenant ? adminTenantService.update(editingTenant._id, formData) : tenantService.create(formData); // Note: Your backend create might need refactoring to handle the full object

    try {
      await toast.promise(apiCall, {
        loading: isSaving ? "Updating tenant..." : "Creating tenant...",
        success: `Tenant "${formData.companyName || editingTenant.companyName}" saved successfully!`,
        error: (err) => err.response?.data?.error || "Failed to save tenant.",
      });
      fetchData();
      handleCloseModals();
    } catch (error) {
      // Error is handled by the toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(
        adminTenantService.delete(deleteConfirm._id), // Assuming this service exists
        {
          loading: `Deleting tenant "${deleteConfirm.companyName}"...`,
          success: "Tenant deleted.",
          error: "Failed to delete tenant.",
        }
      );
      fetchData();
      handleCloseModals();
    } catch (err) {
      /* handled by toast */
    }
  };

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const handleApplyFilters = () => {
    if (currentPage !== 1) setCurrentPage(1);
    else fetchData();
  };
  const handleClearFilters = () => {
    setFilters({ searchTerm: "", isActive: "" });
    if (currentPage !== 1) setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <p className="mt-1 text-slate-400">Create, view, and manage all client accounts.</p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Tenant
        </Button>
      </div>

      <FilterBar filterValues={filters} onFilterChange={handleFilterChange} onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters}>
        <select
          name="isActive"
          value={filters.isActive}
          onChange={(e) => handleFilterChange("isActive", e.target.value)}
          className="ui-input h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Disabled</option>
        </select>
      </FilterBar>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center">Loading tenants...</p>
          ) : (
            <TenantList tenants={tenants} onEdit={handleOpenEditModal} onDelete={setDeleteConfirm} />
          )}
          {paginationData && <Pagination paginationData={paginationData} onPageChange={setCurrentPage} />}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={editingTenant ? `Edit Tenant: ${editingTenant.companyName}` : "Create New Tenant"}
      >
        {editingTenant ? (
          <TenantEditForm
            tenant={editingTenant}
            onSave={handleSave}
            onCancel={handleCloseModals}
            isSaving={isSaving}
            availableModules={availableModules}
          />
        ) : (
          <TenantForm
            tenant={editingTenant}
            onSave={handleSave}
            onCancel={handleCloseModals}
            isSaving={isSaving}
            availableModules={availableModules}
          />
        )}
      </Modal>

      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModals} title="Confirm Deletion">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">Are you sure you want to delete the tenant "{deleteConfirm?.companyName}"?</p>
          <p className="text-sm text-slate-400 mt-2">This action will permanently delete their database and cannot be undone.</p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
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
