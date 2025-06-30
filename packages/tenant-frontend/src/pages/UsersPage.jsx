import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";

// Import all necessary services
import { tenantUserService, tenantRoleService, tenantLocationService } from "./../services/api";

// Import UI library and local components
import { Button, Modal, Card, CardContent } from "ui-library";
import PasswordResetForm from "../components/settings/users/PasswordResetForm";
import UserList from "../components/users/UserList";
import UserForm from "../components/users/UserForm";
/**
 * The definitive "smart" container page for managing users.
 * It orchestrates all data fetching, state management, and actions for
 * creating, editing, deleting, and resetting passwords for users.
 */
const UsersPage = () => {
  // --- STATE MANAGEMENT ---
  // Data state
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);

  // UI control state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resettingUser, setResettingUser] = useState(null);

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch all prerequisite data in parallel for performance
      const [usersRes, rolesRes, branchesRes] = await Promise.all([
        tenantUserService.getAll(),
        tenantRoleService.getAll(),
        tenantLocationService.getAllBranches(),
      ]);
      setUsers(usersRes.data.data);
      setRoles(rolesRes.data.data);
      setBranches(branchesRes.data.data);
    } catch (error) {
      toast.error("Failed to load user management data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLER FUNCTIONS ---
  const handleOpenCreateModal = () => {
    setEditingUser(null); // Ensure we are in "create" mode
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setIsUserModalOpen(true);
  };

  const handleOpenResetModal = (userToReset) => {
    setResettingUser(userToReset);
    setIsResetModalOpen(true);
  };

  // A single function to close all possible modals and reset state
  const handleCloseModals = () => {
    setIsUserModalOpen(false);
    setIsResetModalOpen(false);
    setDeleteConfirm(null);
    setEditingUser(null);
    setResettingUser(null);
  };

  const handleSaveUser = async (formData) => {
    setIsSaving(true);
    const isEditMode = Boolean(editingUser);
    const apiCall = isEditMode ? tenantUserService.update(editingUser._id, formData) : tenantUserService.create(formData);

    try {
      await toast.promise(apiCall, {
        loading: isEditMode ? "Updating user..." : "Creating user...",
        success: `User "${formData.name}" saved successfully!`,
        error: (err) => err.response?.data?.error || "Failed to save user.",
      });
      fetchData(); // Refresh list on success
      handleCloseModals();
    } catch (error) {
      // Error is handled by the toast promise
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    try {
      await toast.promise(tenantUserService.delete(deleteConfirm._id), {
        loading: `Deleting user "${deleteConfirm.name}"...`,
        success: "User deleted successfully.",
        error: (err) => err.response?.data?.error || "Failed to delete user.",
      });
      fetchData(); // Refresh list on success
      handleCloseModals();
    } catch (error) {
      // Error is handled by toast
    }
  };

  const handlePasswordReset = async (passwordData) => {
    if (!resettingUser) return;
    setIsSaving(true);
    try {
      await toast.promise(tenantUserService.adminResetPassword(resettingUser._id, passwordData), {
        loading: `Resetting password for ${resettingUser.name}...`,
        success: "Password has been reset successfully.",
        error: (err) => err.response?.data?.error || "Failed to reset password.",
      });
      handleCloseModals();
    } catch (error) {
      // Error is handled by toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="mt-1 text-slate-400">Manage employee accounts, roles, and permissions.</p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> New User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-slate-400">Loading users...</p>
          ) : (
            <UserList users={users} onEdit={handleOpenEditModal} onDelete={setDeleteConfirm} onResetPassword={handleOpenResetModal} />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={handleCloseModals} title={editingUser ? "Edit User" : "Create New User"}>
        <UserForm
          userToEdit={editingUser}
          roles={roles}
          branches={branches}
          onSave={handleSaveUser}
          onCancel={handleCloseModals}
          isSaving={isSaving}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={Boolean(deleteConfirm)} onClose={handleCloseModals} title="Confirm Deletion">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">Are you sure you want to delete the user "{deleteConfirm?.name}"?</p>
          <p className="text-sm text-slate-400 mt-2">This action cannot be undone.</p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </div>
      </Modal>

      {/* Password Reset Modal */}
      <Modal isOpen={isResetModalOpen} onClose={handleCloseModals} title={`Reset Password for ${resettingUser?.name}`}>
        <PasswordResetForm onSave={handlePasswordReset} onCancel={handleCloseModals} isSaving={isSaving} />
      </Modal>
    </div>
  );
};

export default UsersPage;
