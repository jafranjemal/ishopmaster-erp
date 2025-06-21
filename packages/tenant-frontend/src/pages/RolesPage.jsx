import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { tenantRoleService, adminPermissionService } from "../services/api";
import { Button, Modal } from "ui-library";
import RoleList from "../components/roles/RoleList";
import RoleForm from "../components/roles/RoleForm";

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        tenantRoleService.getAll(),
        adminPermissionService.getAll(),
      ]);
      setRoles(rolesRes.data.data);
      setAvailablePermissions(permsRes.data.data);
    } catch (error) {
      console.error("Error loading roles or permissions:", error);
      toast.error("Failed to load page data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (role) => {
    setDeleteConfirmRole(role);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirmRole(null);
  };

  const handleSave = async (formData) => {
    const isEditMode = Boolean(editingRole);
    const apiCall = isEditMode
      ? tenantRoleService.update(editingRole._id, formData)
      : tenantRoleService.create(formData);

    try {
      await toast.promise(apiCall, {
        loading: "Saving role...",
        success: `Role "${formData.name}" saved successfully!`,
        error: (err) => err.response?.data?.error || "Failed to save role.",
      });
      fetchData();
      handleCloseModals();
      return null;
    } catch (err) {
      return err.response?.data?.error || "An unexpected error occurred.";
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmRole) return;
    await toast.promise(tenantRoleService.delete(deleteConfirmRole._id), {
      loading: "Deleting role...",
      success: `Role "${deleteConfirmRole.name}" deleted.`,
      error: (err) => err.response?.data?.error || "Failed to delete role.",
    });
    fetchData();
    handleCloseModals();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="mt-1 text-slate-400">
            Manage job roles and what each role can access and do.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Role
        </Button>
      </div>

      {isLoading ? (
        <p>Loading roles...</p>
      ) : (
        <RoleList
          roles={roles}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteConfirm}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={
          editingRole ? `Edit Role: ${editingRole.name}` : "Create New Role"
        }
      >
        <RoleForm
          roleToEdit={editingRole}
          availablePermissions={availablePermissions}
          onSave={handleSave}
          onCancel={handleCloseModals}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteConfirmRole)}
        onClose={handleCloseModals}
        title="Confirm Deletion"
      >
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">Are you sure you want to delete the role?</p>
          <p className="mt-2 font-semibold text-amber-300 bg-slate-900 p-2 rounded-md">
            {deleteConfirmRole?.name}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            This action cannot be undone.
          </p>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <Button variant="outline" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Role
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RolesPage;
