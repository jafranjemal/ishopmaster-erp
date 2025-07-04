import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantHrService } from "../../services/api";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft } from "lucide-react";
import EmployeeDetailHeader from "../../components/hr/EmployeeDetailHeader";
import PayslipHistoryList from "../../components/hr/PayslipHistoryList";
import PayslipHistoryTable from "../../components/hr/PayslipHistoryTable";
import LeaveHistoryTable from "../../components/hr/LeaveHistoryTable";
import CommissionsHistoryTable from "../../components/hr/CommissionsHistoryTable";
import AttendanceHistoryTable from "../../components/hr/AttendanceHistoryTable";

const EmployeeDetailPage = () => {
  const { id: employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      const response = await tenantHrService.getEmployeeById(employeeId);
      setEmployee(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load employee details.");
      navigate("/hr/employees");
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, navigate]);

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
          <Tabs.Content value="attendance">
            <AttendanceHistoryTable data={employee.history?.attendance} />
          </Tabs.Content>
          <Tabs.Content value="leave">
            <LeaveHistoryTable data={employee.history?.leave} />
          </Tabs.Content>
          <Tabs.Content value="Commissions">
            <CommissionsHistoryTable data={employee.history?.commissions} />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
};
export default EmployeeDetailPage;
