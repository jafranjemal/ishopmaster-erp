import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import * as Tabs from "@radix-ui/react-tabs";
import { tenantHrService } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle, Pagination } from "ui-library";
import LeaveList from "../../components/hr/LeaveList";
import LeaveRequestForm from "../../components/hr/LeaveRequestForm";

const LeaveManagementPage = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [pendingRes, historyRes, employeesRes] = await Promise.all([
        tenantHrService.getLeaveHistory({ status: "pending", limit: 1000 }),
        tenantHrService.getLeaveHistory({ status: { $in: ["approved", "rejected"] }, limit: 50 }),
        tenantHrService.getAllEmployees({ limit: 1000 }),
      ]);
      setPendingRequests(pendingRes.data.data);
      setHistoryRecords(historyRes.data.data);
      setEmployees(employeesRes.data.data.employees);
    } catch (error) {
      toast.error("Failed to load leave management data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (leaveId, status) => {
    try {
      await toast.promise(tenantHrService.updateLeaveStatus(leaveId, { status }), {
        loading: "Processing request...",
        success: `Leave request ${status}.`,
        error: "Action failed.",
      });
      fetchData(); // Refresh both lists
    } catch (err) {
      /* handled by toast */
    }
  };

  const handleLogLeave = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantHrService.requestLeave(formData), {
        loading: "Submitting request...",
        success: "Leave request logged successfully!",
        error: (err) => err.response?.data?.error || "Failed to log leave.",
      });
      fetchData(); // Refresh lists to show the new pending request
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Leave Management</h1>
      <Tabs.Root defaultValue="approvals" className="w-full">
        <Tabs.List className="flex border-b border-slate-700">
          <Tabs.Trigger value="approvals" className="px-4 py-2 ui-tabs-trigger">
            Pending Approvals ({pendingRequests.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="history" className="px-4 py-2 ui-tabs-trigger">
            Approval History
          </Tabs.Trigger>
          <Tabs.Trigger value="log" className="px-4 py-2 ui-tabs-trigger">
            Log Leave for Employee
          </Tabs.Trigger>
        </Tabs.List>
        <div className="pt-6">
          <Tabs.Content value="approvals">
            <Card>
              <CardHeader>
                <CardTitle>Leave Approval Inbox</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <p className="p-8 text-center">Loading...</p>
                ) : (
                  <LeaveList
                    requests={pendingRequests}
                    onApprove={(id) => handleUpdateStatus(id, "approved")}
                    onReject={(id) => handleUpdateStatus(id, "rejected")}
                  />
                )}
              </CardContent>
            </Card>
          </Tabs.Content>
          <Tabs.Content value="history">
            <Card>
              <CardHeader>
                <CardTitle>Processed Requests</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? <p className="p-8 text-center">Loading...</p> : <LeaveList requests={historyRecords} />}
              </CardContent>
            </Card>
          </Tabs.Content>
          <Tabs.Content value="log">
            <div className="max-w-2xl mx-auto">
              <LeaveRequestForm onSave={handleLogLeave} isSaving={isSaving} employees={employees} />
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
};
export default LeaveManagementPage;
