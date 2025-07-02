import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { toast } from "react-hot-toast";
import { tenantPayrollService } from "../../services/api";
import PayrollRunForm from "../../components/hr/payroll/PayrollRunForm";
import PayrollHistoryView from "../../components/hr/payroll/PayrollHistoryView";

const PayrollPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastRunResult, setLastRunResult] = useState(null);

  // --- NEW: State for the payroll history ---
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const navigate = useNavigate();

  // --- NEW: useEffect to fetch payroll history on component mount ---
  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
        // We assume a getHistory method exists in your service.
        // You would add pagination controls here in a real app.
        const response = await tenantPayrollService.getHistory({ page: 1, limit: 25 });
        setHistory(response.data.data);
      } catch (error) {
        toast.error("Could not fetch payroll history.");
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []); // The empty dependency array means this runs once on mount.

  const handleRunPayroll = async (dateRange) => {
    setIsSaving(true);
    setLastRunResult(null);
    try {
      const response = await toast.promise(tenantPayrollService.runPayroll(dateRange), {
        loading: "Running payroll... This may take a moment.",
        success: (res) => res.data.data.message,
        error: (err) => err.response?.data?.error || "Payroll run failed.",
      });
      setLastRunResult(response.data.data);

      // --- NEW: Refresh the history after a new run is successful ---
      const freshHistory = await tenantPayrollService.getHistory({ page: 1, limit: 25 });
      setHistory(freshHistory.data.data);
    } catch (error) {
      // Error is handled by the toast
    } finally {
      setIsSaving(false);
    }
  };

  // --- NEW: Handler for the "View Details" button in the history table ---
  const handleViewDetails = (payrollRunId) => {
    // This will navigate the user to a detailed page for that specific payroll run.
    // We will build this page in a later chapter.
    navigate(`/accounting/payroll/${payrollRunId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll Processing</h1>
        <p className="mt-1 text-slate-400">Calculate and process payroll for all employees.</p>
      </div>

      {/* The form for running a new payroll */}
      <PayrollRunForm onRun={handleRunPayroll} isRunning={isSaving} runResult={lastRunResult} />

      {/* The Payroll History table is now fully implemented */}
      <div className="mt-8">
        <PayrollHistoryView historyData={history} isLoading={isHistoryLoading} onViewDetails={handleViewDetails} />
      </div>
    </div>
  );
};

export default PayrollPage;
