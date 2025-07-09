import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PlusCircle, ShieldAlert, Loader2 } from "lucide-react";
import { tenantDepartmentService, tenantHrService, tenantJobPositionService, tenantLocationService } from "../../services/api";
import { Button, Modal, Card, CardContent, Pagination } from "ui-library";
import EmployeeList from "../../components/hr/EmployeeList";
import EmployeeForm from "../../components/hr/EmployeeForm";

/**
 * @desc The main page for managing all employees. It orchestrates fetching data,
 * handling modals for create/edit, and processing delete confirmations.
 * This is the definitive implementation for Sub-Chapter 66.2.
 */
const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const [prereqData, setPrereqData] = useState({
    branches: [], // Assuming branches are fetched elsewhere or added here
    unassignedUsers: [],
    departments: [],
    jobPositions: [],
    allEmployees: [],
  });
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 15 };

      // --- THE FIX: Fetch all data in parallel ---
      const [empResponse, deptsRes, positionsRes, branchResponse] = await Promise.all([
        tenantHrService.getAllEmployees(params),
        tenantDepartmentService.getAll(),
        tenantJobPositionService.getAll(),
        tenantLocationService.getAllBranches(),
      ]);

      setPrereqData({
        allEmployees: empResponse.data.data.employees,
        unassignedUsers: empResponse.data.data.unassignedUsers,
        departments: deptsRes.data.data,
        jobPositions: positionsRes.data.data,
        branches: branchResponse.data.data, // In a real app, this would come from tenantLocationService
      });

      // Fetch all necessary data in parallel for better performance

      setEmployees(empResponse.data.data.employees);
      setUnassignedUsers(empResponse.data.data.unassignedUsers);
      setPaginationData(empResponse.data.pagination);
      setBranches(branchResponse.data.data);
    } catch (error) {
      toast.error("Failed to load employee data.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsModalOpen(false);
    setDeleteConfirm(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingEmployee ? tenantHrService.updateEmployee(editingEmployee._id, formData) : tenantHrService.createEmployee(formData);

    try {
      await toast.promise(apiCall, {
        loading: "Saving employee...",
        success: "Employee saved successfully!",
        error: (err) => err.response?.data?.error || "Failed to save employee.",
      });
      fetchData(); // Refresh the list after saving
      handleCloseModals();
    } catch (error) {
      // Error is handled by the toast notification
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsSaving(true); // Use the same saving state for the delete button
    try {
      await toast.promise(tenantHrService.deleteEmployee(deleteConfirm._id), {
        loading: "Deleting employee...",
        success: "Employee deleted successfully.",
        error: (err) => err.response?.data?.error || "Failed to delete employee.",
      });
      fetchData(); // Refresh the list
      handleCloseModals();
    } catch (err) {
      // Error is handled by the toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="mt-1 text-slate-400">Manage all staff records, roles, and system access.</p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Employee
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <EmployeeList
              employees={employees}
              onEdit={handleOpenEditModal}
              onDelete={setDeleteConfirm}
              onView={(id) => navigate(`/hr/employees/${id}`)}
            />
          )}
          {paginationData && paginationData.totalPages > 1 && <Pagination paginationData={paginationData} onPageChange={setCurrentPage} />}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={editingEmployee ? "Edit Employee" : "Create New Employee"}>
        <EmployeeForm
          {...prereqData}
          employeeToEdit={editingEmployee}
          branches={branches}
          unassignedUsers={unassignedUsers}
          onSave={handleSave}
          onCancel={handleCloseModals}
          isSaving={isSaving}
        />
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={handleCloseModals} title="Confirm Deletion">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4">Are you sure you want to delete employee "{deleteConfirm?.name}"?</p>
          <p className="text-sm text-slate-400 mt-1">This action cannot be undone.</p>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
