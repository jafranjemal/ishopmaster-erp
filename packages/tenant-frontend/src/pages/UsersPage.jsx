import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert } from "lucide-react";
import {
  tenantUserService,
  tenantRoleService,
  tenantLocationService,
} from "../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import UserList from "../components/users/UserList";
import UserForm from "../components/users/UserForm";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usersRes, rolesRes, branchesRes] = await Promise.all([
        tenantUserService.getAll(),
        tenantRoleService.getAll(),
        tenantLocationService.getAllBranches(),
      ]);
      setUsers(usersRes.data.data);
      setRoles(rolesRes.data.data);
      setBranches(branchesRes.data.data);
    } catch (error) {
      console.error("Error loading user management data:", error);
      toast.error("Failed to load user management data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData) => {
    const isEditMode = Boolean(editingUser);
    const apiCall = isEditMode
      ? tenantUserService.update(editingUser._id, formData)
      : tenantUserService.create(formData);
    try {
      await toast.promise(apiCall, {
        loading: "Saving user...",
        success: `User "${formData.name}" saved successfully!`,
        error: (err) => err.response?.data?.error || "Failed to save user.",
      });
      fetchData();
      setIsModalOpen(false);
      return null;
    } catch (err) {
      return err.response?.data?.error;
    }
  };

  const handleToggleActive = async () => {
    if (!confirmDeactivate) return;
    const dataToUpdate = { isActive: !confirmDeactivate.isActive };
    await toast.promise(
      tenantUserService.update(confirmDeactivate._id, dataToUpdate),
      {
        loading: "Updating status...",
        success: `User "${confirmDeactivate.name}" has been ${
          dataToUpdate.isActive ? "activated" : "deactivated"
        }.`,
        error: "Failed to update status.",
      }
    );
    fetchData();
    setConfirmDeactivate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-4">Loading users...</p>
          ) : (
            <UserList
              users={users}
              onEdit={(user) => {
                setEditingUser(user);
                setIsModalOpen(true);
              }}
              onToggleActive={setConfirmDeactivate}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Create New User"}
      >
        <UserForm
          userToEdit={editingUser}
          roles={roles}
          branches={branches}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={Boolean(confirmDeactivate)}
        onClose={() => setConfirmDeactivate(null)}
        title="Confirm Status Change"
      >
        <p>
          Are you sure you want to{" "}
          {confirmDeactivate?.isActive ? "deactivate" : "activate"} the user "
          {confirmDeactivate?.name}"?
        </p>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setConfirmDeactivate(null)}>
            Cancel
          </Button>
          <Button
            variant={confirmDeactivate?.isActive ? "destructive" : "success"}
            onClick={handleToggleActive}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
