import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantBenefitTypeService, tenantEmployeeBenefitService, tenantHrService } from "../../services/api";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft, PlusCircle } from "lucide-react";
import EmployeeDetailHeader from "../../components/hr/EmployeeDetailHeader";
import PayslipHistoryList from "../../components/hr/PayslipHistoryList";
import PayslipHistoryTable from "../../components/hr/PayslipHistoryTable";
import LeaveHistoryTable from "../../components/hr/LeaveHistoryTable";
import CommissionsHistoryTable from "../../components/hr/CommissionsHistoryTable";
import AttendanceHistoryTable from "../../components/hr/AttendanceHistoryTable";
import LeaveRequestForm from "../../components/hr/LeaveRequestForm";
import LeaveHistoryList from "../../components/hr/LeaveHistoryList";
import EmployeeDocumentManager from "../../components/hr/employee/document/EmployeeDocumentManager";
import AssignBenefitForm from "../../components/hr/benefits/AssignBenefitForm";
import AssignedBenefitList from "../../components/hr/benefits/AssignedBenefitList";
import { Button, Modal } from "ui-library";

const EmployeeDetailPage = () => {
  const { id: employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [benefitTypes, setBenefitTypes] = useState([]);
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false);
  const [assignedBenefits, setAssignedBenefits] = useState([]);
  const [documents, setDocuments] = useState(employee?.documents || []);

  const memoizedDocuments = useMemo(() => employee?.documents, [employee?.documents]);

  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      const [employeeRes, typesRes, assignedRes] = await Promise.all([
        tenantHrService.getEmployeeById(employeeId),
        tenantBenefitTypeService.getAll(),
        tenantEmployeeBenefitService.getForEmployee(employeeId),
      ]);
      setEmployee(employeeRes.data.data);
      setBenefitTypes(typesRes.data.data);
      setAssignedBenefits(assignedRes.data.data);
    } catch (error) {
      toast.error("Failed to load employee details.");
      navigate("/hr/employees");
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- THE DEFINITIVE FIX: FULLY IMPLEMENTED HANDLER ---
  const handleAssignBenefit = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantEmployeeBenefitService.assignToEmployee(employeeId, formData), {
        loading: "Assigning benefit...",
        success: "Benefit assigned successfully!",
        error: (err) => err.response?.data?.error || "Failed to assign benefit.",
      });
      fetchData(); // Refresh data to show the new benefit
      setIsBenefitModalOpen(false);
    } catch (err) {
      // The toast promise handles displaying the error
    } finally {
      setIsSaving(false);
    }
  };
  const handleRemoveBenefit = async (benefitAssignmentId) => {
    if (!window.confirm("Are you sure you want to remove this benefit from the employee?")) return;
    try {
      await toast.promise(tenantEmployeeBenefitService.delete(benefitAssignmentId), {
        loading: "Removing benefit...",
        success: "Benefit removed.",
        error: "Removal failed.",
      });
      fetchData(); // Refresh the list
    } catch (err) {
      /* handled by toast */
    }
  };

  // --- END OF FIX ---

  const handleRequestLeave = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantHrService.requestLeave(formData), {
        loading: "Submitting leave request...",
        success: "Request submitted successfully!",
        error: (err) => err.response?.data?.error || "Failed to submit request.",
      });
      fetchData(); // Refresh history after submission
      return true; // Indicate success to reset form
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDocumentsOld = async (documentData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantHrService.updateEmployee(employee._id, documentData), {
        loading: "Saving documents...",
        success: "Documents updated!",
        error: "Save failed.",
      });
      fetchData(); // Refresh data on success
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDocuments = async (documentData) => {
    setIsSaving(true);
    console.log({ documentData });
    try {
      await toast.promise(tenantHrService.updateEmployee(employee._id, documentData), {
        loading: "Saving documents...",
        success: "Documents updated!",
        error: "Save failed.",
      });
      fetchData(); // Refresh data on success
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading || !employee) return <div className="p-8 text-center">Loading Employee Profile...</div>;

  return (
    <div className="space-y-6">
      <Link to="/hr/employees" className="flex items-center text-sm text-indigo-400 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to All Employees
      </Link>

      <EmployeeDetailHeader employee={employee} />

      <Tabs.Root defaultValue="payslips" className="space-y-4">
        <Tabs.List className="flex border-b border-slate-700">
          <Tabs.Trigger value="payslips" className="px-4 py-2 ui-tabs-trigger">
            Payslip History
          </Tabs.Trigger>
          <Tabs.Trigger value="benefits" className="px-4 py-2 ui-tabs-trigger">
            Benefits
          </Tabs.Trigger>
          <Tabs.Trigger value="documents" className="px-4 py-2 ui-tabs-trigger">
            Documents
          </Tabs.Trigger>{" "}
          {/* <-- 3. ADD NEW TAB */}
          <Tabs.Trigger value="attendance" className="px-4 py-2 ui-tabs-trigger">
            Attendance
          </Tabs.Trigger>
          <Tabs.Trigger value="leave" className="px-4 py-2 ui-tabs-trigger">
            Leave
          </Tabs.Trigger>
          <Tabs.Trigger value="Commissions" className="px-4 py-2 ui-tabs-trigger">
            Commissions
          </Tabs.Trigger>
        </Tabs.List>
        <div className="pt-4">
          <Tabs.Content value="payslips">
            <PayslipHistoryList payslips={employee.history?.payslips} />
          </Tabs.Content>
          <Tabs.Content value="benefits">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setIsBenefitModalOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Assign New Benefit
                </Button>
              </div>
              <AssignedBenefitList assignedBenefits={assignedBenefits} onRemove={handleRemoveBenefit} />
            </div>
          </Tabs.Content>
          <Tabs.Content value="documents">
            <EmployeeDocumentManager documents={employee?.documents} onChange={setDocuments} onSave={handleSaveDocuments} isSaving={isSaving} />
          </Tabs.Content>
          <Tabs.Content value="attendance">
            <AttendanceHistoryTable data={employee.history?.attendance} />
          </Tabs.Content>
          <Tabs.Content value="leave">
            <div className="space-y-8">
              <LeaveRequestForm onSave={handleRequestLeave} isSaving={isSaving} />
              <LeaveHistoryList leaveRecords={employee.history.leave} />
            </div>
          </Tabs.Content>
          <Tabs.Content value="Commissions">
            <CommissionsHistoryTable data={employee.history?.commissions} />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      <Modal isOpen={isBenefitModalOpen} onClose={() => setIsBenefitModalOpen(false)} title="Assign Benefit to Employee">
        <AssignBenefitForm
          benefitTypes={benefitTypes}
          onSave={handleAssignBenefit}
          onCancel={() => setIsBenefitModalOpen(false)}
          isSaving={isSaving}
        />
      </Modal>
    </div>
  );
};
export default EmployeeDetailPage;
