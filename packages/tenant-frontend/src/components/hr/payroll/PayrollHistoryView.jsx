import React from "react";
import { Button } from "ui-library"; // Assuming a shared Button component
import { Calendar, Users, DollarSign, Eye, Archive, Loader2 } from "lucide-react";
import useAuth from "../../../context/useAuth"; // ✅ 1. Import the useAuth hook

/**
 * A reusable UI component to display a list of historical payroll runs.
 *
 * @param {Array} historyData - An array of past payroll run objects.
 * @param {boolean} isLoading - Flag to show a loading state.
 * @param {Function} onViewDetails - Callback function when a user clicks 'View Details'.
 */
const PayrollHistoryView = ({ historyData, isLoading, onViewDetails }) => {
  // ✅ 2. Get the context-aware formatCurrency function from the hook
  const { formatCurrency } = useAuth();

  // ✅ 3. The local helper function has been removed.

  // State for when data is being fetched
  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 mt-6 text-center text-slate-400 flex flex-col items-center justify-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-cyan-400 mb-4" />
        <span>Loading Payroll History...</span>
      </div>
    );
  }

  // State for when there are no past payroll runs
  if (!historyData || historyData.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 mt-6 text-center border-2 border-dashed border-slate-700">
        <Archive size={48} className="mx-auto text-slate-500 mb-4" />
        <h3 className="text-xl font-semibold text-white">No Payroll History</h3>
        <p className="text-slate-400 mt-2">Once you run your first payroll, its summary will appear here.</p>
      </div>
    );
  }

  // The main table view for displaying the history
  return (
    <div className="bg-slate-800 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Payroll History</h3>
      <div className="overflow-x-auto relative">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 rounded-l-lg">
                Period
              </th>
              <th scope="col" className="px-6 py-3">
                Run Date
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Employees Paid
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Total Payout
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right rounded-r-lg">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((run) => (
              <tr key={run._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors duration-150">
                <td className="px-6 py-4 font-medium text-white">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-cyan-400" />
                    <span>{run.period || "N/A"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{new Date(run.runDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    <span>{run.employeeCount || run.employeesProcessed}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign size={16} className="text-green-400" />
                    {/* This now uses the function from useAuth */}
                    <span>{formatCurrency(run.totalAmount || run.totalPayout)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-green-500/20 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full">{run.status || "Completed"}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => onViewDetails(run._id)}>
                    <Eye size={14} className="mr-2" />
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollHistoryView;
