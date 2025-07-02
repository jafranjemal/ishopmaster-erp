import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { Button } from "ui-library";
import { FileText } from "lucide-react";

const PayslipHistoryTable = ({ data }) => {
  const { formatCurrency, formatDate } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-slate-400 uppercase">
          <tr>
            <th className="px-4 py-2 text-left">Payslip ID</th>
            <th className="px-4 py-2 text-left">Pay Period</th>
            <th className="px-4 py-2 text-right">Net Pay</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-slate-300">
          {(data || []).map((slip) => (
            <tr key={slip._id} className="border-b border-slate-700">
              <td className="px-4 py-3 font-mono text-cyan-400">{slip.payslipId}</td>
              <td className="px-4 py-3">{`${formatDate(slip.payPeriod.startDate)} - ${formatDate(slip.payPeriod.endDate)}`}</td>
              <td className="px-4 py-3 text-right font-semibold font-mono">{formatCurrency(slip.netPay)}</td>
              <td className="px-4 py-3 text-center">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/accounting/payslips/${slip._id}`)}>
                  <FileText size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayslipHistoryTable;
