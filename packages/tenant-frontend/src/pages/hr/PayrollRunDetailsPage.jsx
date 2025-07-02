import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantPayrollService } from "../../services/api";
import useAuth from "../../context/useAuth";
// ✅ CORRECTED: Import the reusable Table components from the UI library
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";
import { ArrowLeft, Printer, Users, DollarSign, Calendar, Hash, User, Eye, Loader2 } from "lucide-react";

// A small, reusable component for displaying summary stats
const StatCard = ({ icon, label, value }) => (
  <div className="bg-slate-800 p-4 rounded-lg flex items-center gap-4">
    <div className="bg-slate-700 p-3 rounded-md">{icon}</div>
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const PayrollRunDetailsPage = () => {
  const { id: runId } = useParams();
  const { formatCurrency } = useAuth();
  const navigate = useNavigate();
  const [runDetails, setRunDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const fetchRunDetails = async () => {
      setIsLoading(true);
      try {
        const response = await tenantPayrollService.getRunById(runId);
        setRunDetails(response.data.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load payroll run details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRunDetails();
  }, [runId]);

  const handlePrintAll = async () => {
    setIsPrinting(true);
    await toast.promise(tenantPayrollService.printRunById(runId), {
      loading: "Generating consolidated PDF...",
      success: (res) => res.data.message || "Print job sent to backend!",
      error: "Failed to generate PDF.",
    });
    setIsPrinting(false);
  };

  const handleViewPayslip = (payslipId) => {
    navigate(`/accounting/payslips/${payslipId}`);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!runDetails) {
    return <div className="p-8 text-center text-red-400">Could not find payroll run data.</div>;
  }

  const { period, runDate, employeeCount, totalPayout, payslips } = runDetails;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/accounting/payroll" className="p-2 rounded-md hover:bg-slate-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold">Payroll Details</h1>
          </div>
          <p className="mt-1 text-slate-400">
            Detailed breakdown for payroll period: <span className="font-semibold text-cyan-400">{period}</span>
          </p>
        </div>
        <div>
          <Button onClick={handlePrintAll} disabled={isPrinting}>
            {isPrinting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Printer size={16} className="mr-2" />}
            {isPrinting ? "Generating..." : "Print All Payslips"}
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Calendar size={24} className="text-cyan-400" />} label="Run Date" value={new Date(runDate).toLocaleDateString()} />
        <StatCard icon={<Users size={24} className="text-purple-400" />} label="Employees Paid" value={employeeCount} />
        <StatCard icon={<DollarSign size={24} className="text-green-400" />} label="Total Payout" value={formatCurrency(totalPayout)} />
        <StatCard icon={<Hash size={24} className="text-amber-400" />} label="Run ID" value={runDetails.runId} />
      </div>

      {/* Detailed Payslip Table */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-white">Generated Payslips</h3>
        {/* ✅ FIX: Using the reusable <Table> component from ui-library */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead className="text-right">Base Salary</TableHead>
              <TableHead className="text-right">Commissions</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right font-semibold">Net Pay</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(payslips || []).map((payslip) => (
              <TableRow key={payslip._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-slate-400" />
                    <div>
                      <p className="text-white">{payslip.employeeId?.name || "N/A"}</p>
                      <p className="text-xs text-slate-500">{payslip.employeeId?.employeeId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(payslip.baseSalary)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(payslip.totalCommissions)}</TableCell>
                <TableCell className="text-right font-mono text-red-400">{formatCurrency(payslip.deductions)}</TableCell>
                <TableCell className="text-right font-mono font-bold text-white">{formatCurrency(payslip.netPay)}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" onClick={() => handleViewPayslip(payslip._id)}>
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PayrollRunDetailsPage;
