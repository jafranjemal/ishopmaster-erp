import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantAttendanceService, tenantHrService, tenantLocationService } from "../../services/api";
import { Button, Modal, Card, CardContent, FilterBar, Pagination } from "ui-library";
import TimesheetList from "../../components/hr/TimesheetList";
import ManualEntryForm from "../../components/hr/ManualEntryForm";
import { PlusCircle } from "lucide-react";

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [prereqData, setPrereqData] = useState({ branches: [], employees: [] });
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 25, ...filters };
      const [recordsRes, branchesRes, employeesRes] = await Promise.all([
        tenantAttendanceService.getTimesheet(params),
        tenantLocationService.getAllBranches(),
        tenantHrService.getAllEmployees({ limit: 1000 }), // Fetch all employees for filter
      ]);
      setRecords(recordsRes.data.data);
      setPaginationData(recordsRes.data.pagination);
      setPrereqData({ branches: branchesRes.data.data, employees: employeesRes.data.data.employees });
    } catch (error) {
      toast.error("Failed to load timesheet data.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (entry = null) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    const apiCall = editingEntry
      ? tenantAttendanceService.updateEntry(editingEntry._id, formData)
      : tenantAttendanceService.createManualEntry(formData);
    try {
      await toast.promise(apiCall, { loading: "Saving entry...", success: "Timesheet updated!", error: "Save failed." });
      fetchData();
      handleCloseModal();
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Timesheet Management</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Manual Entry
        </Button>
      </div>
      <FilterBar onApplyFilters={fetchData} /* ... more filter props ... */>{/* Filter dropdowns for employee and branch would go here */}</FilterBar>
      <Card>
        <CardContent className="p-0">
          {isLoading ? <p>Loading...</p> : <TimesheetList records={records} onEdit={handleOpenModal} />}
          {paginationData && <Pagination paginationData={paginationData} onPageChange={setCurrentPage} />}
        </CardContent>
      </Card>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEntry ? "Edit Attendance Entry" : "Add Manual Entry"}>
        <ManualEntryForm
          entryToEdit={editingEntry}
          employees={prereqData.employees}
          branches={prereqData.branches}
          onSave={handleSave}
          onCancel={handleCloseModal}
          isSaving={isSaving}
        />
      </Modal>
    </div>
  );
};
export default AttendancePage;
