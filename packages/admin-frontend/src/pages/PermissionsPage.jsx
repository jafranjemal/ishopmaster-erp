import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";
import PermissionList from "../components/permissions/PermissionList";
import PermissionForm from "../components/permissions/PermissionForm";
import { adminPermissionService } from "../services/api";
import { Button, Modal } from "ui-library";

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [deleteConfirmPermission, setDeleteConfirmPermission] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminPermissionService.getAll();
      setPermissions(response.data);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      toast.error("Failed to fetch permissions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModuleWiseAdd = (moduleName) => {
    if (moduleName) {
      setEditingPermission({
        key: `${moduleName}:`,
        module: moduleName,
        description: "",
      });
    } else {
      // fallback: allow full user input
      setEditingPermission(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (permission) => {
    setEditingPermission(permission);
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (permission) => {
    setDeleteConfirmPermission(permission);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirmPermission(null);
  };

  const handleSave = async (formData) => {
    try {
      if (editingPermission && editingPermission._id) {
        await toast.promise(
          adminPermissionService.update(editingPermission._id, formData),
          {
            loading: "Saving...",
            success: "Permission updated!",
            error: "Failed to update.",
          }
        );
      } else {
        await toast.promise(adminPermissionService.create(formData), {
          loading: "Creating...",
          success: "Permission created!",
          error: "Failed to create.",
        });
      }
      fetchData();
      handleCloseModals();
      return null;
    } catch (err) {
      return err.response?.data?.error || "An unexpected error occurred.";
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmPermission) return;
    await toast.promise(
      adminPermissionService.delete(deleteConfirmPermission._id),
      {
        loading: "Deleting permission...",
        success: `Permission \\"${deleteConfirmPermission.key}\\" deleted.`,
        error: "Failed to delete permission.",
      }
    );
    fetchData();
    handleCloseModals();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            System Permissions
          </h1>
          <p className="mt-1 text-slate-400">
            Define all possible actions that can be assigned to roles.
          </p>
        </div>
        <Button onClick={() => handleModuleWiseAdd("")}>
          {" "}
          {/* fallback generic */}
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Permission
        </Button>
      </div>

      {isLoading ? (
        <p>Loading permissions...</p>
      ) : (
        <PermissionList
          groupedPermissions={permissions}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteConfirm}
          onModuleAdd={handleModuleWiseAdd}
        />
      )}

      <Modal
        size="xs"
        isOpen={isModalOpen}
        onClose={handleCloseModals}
        title={
          editingPermission?._id ? "Edit Permission" : "Create New Permission"
        }
      >
        <PermissionForm
          permissionToEdit={editingPermission}
          onSave={handleSave}
          onCancel={handleCloseModals}
        />
      </Modal>

      <Modal
        isOpen={Boolean(deleteConfirmPermission)}
        onClose={handleCloseModals}
        title="Confirm Deletion"
      >
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">
            Are you sure you want to delete the permission?
          </p>
          <p className="mt-2 font-mono text-amber-300 bg-slate-900 p-2 rounded-md">
            {deleteConfirmPermission?.key}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            This action is irreversible. Deleting a permission may affect
            existing roles.
          </p>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <Button variant="outline" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Permission
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionsPage;
