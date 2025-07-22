import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { Button } from 'ui-library';
import useAuth from '../../context/useAuth';
import { tenantPayrollService } from '../../services/api';

const PayslipDetailPage = () => {
  const { id: payslipId } = useParams();
  const { tenantProfile, formatCurrency, formatDate } = useAuth();
  const [payslip, setPayslip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const printComponentRef = useRef();

  useEffect(() => {
    const fetchPayslipDetails = async () => {
      setIsLoading(true);
      try {
        const response = await tenantPayrollService.getPayslipById(payslipId);
        setPayslip(response.data.data);
      } catch (error) {
        toast.error('Failed to load payslip details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayslipDetails();
  }, [payslipId]);

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    content: () => printComponentRef.current,
    documentTitle: `Payslip-${payslip?.payslipId}`,
  });

  if (isLoading) {
    return (
      <div className='p-8 text-center flex items-center justify-center h-64'>
        <Loader2 className='animate-spin h-8 w-8' />
      </div>
    );
  }

  if (!payslip) {
    return <div className='p-8 text-center text-red-400'>Could not find payslip data.</div>;
  }

  const { employeeId, payPeriod, baseSalary, totalCommissions, deductions, netPay } = payslip;
  const totalEarnings = baseSalary + totalCommissions;

  return (
    <div className='space-y-6'>
      {/* Page Header with Actions */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link to='/accounting/payroll' className='p-2 rounded-md hover:bg-slate-700'>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Payslip</h1>
            <p className='text-slate-400'>
              Payslip ID: <span className='font-mono text-cyan-400'>{payslip.payslipId}</span>
            </p>
          </div>
        </div>
        <Button onClick={handlePrint}>
          <Printer size={16} className='mr-2' />
          Print Payslip
        </Button>
      </div>

      {/* A4-style container for the printable payslip */}
      <div
        ref={printComponentRef}
        className='bg-white text-black p-12 shadow-lg rounded-md max-w-4xl mx-auto printable-area'
      >
        {/* Document Header */}
        <div className='flex justify-between items-start pb-8 border-b-2 border-slate-200'>
          <div>
            <h2 className='text-3xl font-bold text-slate-800'>{tenantProfile?.companyName || 'Your Company'}</h2>
            <p className='text-sm text-slate-500'>
              {tenantProfile?.contactInfo?.address || '123 Main Street, Colombo'}
            </p>
          </div>
          <h1 className='text-4xl font-bold text-slate-400 tracking-wider uppercase'>Payslip</h1>
        </div>

        {/* Employee & Period Details */}
        <div className='grid grid-cols-2 gap-8 my-8'>
          <div>
            <p className='text-sm text-slate-500'>Employee</p>
            <p className='font-bold text-lg text-slate-800'>{`${employeeId?.name}`}</p>
            <p className='text-slate-600'>{employeeId.jobPositionId}</p>
            <p className='text-slate-600'>{employeeId.branchId.name}</p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-slate-500'>Pay Period</p>
            <p className='font-semibold text-slate-700'>{`${formatDate(payPeriod.startDate)} - ${formatDate(payPeriod.endDate)}`}</p>
            <p className='text-sm text-slate-500 mt-2'>Issue Date</p>
            <p className='font-semibold text-slate-700'>{formatDate(payslip.createdAt)}</p>
          </div>
        </div>

        {/* Earnings & Deductions Table */}
        <table className='w-full'>
          <thead>
            <tr className='bg-slate-100 text-left text-slate-600 text-sm uppercase'>
              <th className='p-3 font-semibold'>Earnings</th>
              <th className='p-3 font-semibold text-right'>Amount</th>
              <th className='p-3 font-semibold'>Deductions</th>
              <th className='p-3 font-semibold text-right'>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className='border-b border-slate-200'>
              <td className='p-3'>Base Salary</td>
              <td className='p-3 text-right font-mono'>{formatCurrency(baseSalary)}</td>
              <td className='p-3'>Advances / Other</td>
              <td className='p-3 text-right font-mono'>{formatCurrency(deductions)}</td>
            </tr>
            <tr className='border-b border-slate-200'>
              <td className='p-3'>Commissions</td>
              <td className='p-3 text-right font-mono'>{formatCurrency(totalCommissions)}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
          <tfoot>
            <tr className='font-bold text-slate-800'>
              <td className='p-3'>Total Earnings</td>
              <td className='p-3 text-right font-mono'>{formatCurrency(totalEarnings)}</td>
              <td className='p-3'>Total Deductions</td>
              <td className='p-3 text-right font-mono'>{formatCurrency(deductions)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Net Pay Summary */}
        <div className='flex justify-end mt-8'>
          <div className='bg-slate-100 p-6 rounded-lg w-1/2'>
            <div className='flex justify-between items-center'>
              <p className='text-lg font-bold text-slate-800'>Net Pay</p>
              <p className='text-2xl font-bold font-mono text-slate-900'>{formatCurrency(netPay)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='text-center text-xs text-slate-400 mt-12 pt-4 border-t border-slate-200'>
          <p>This is a computer-generated document and does not require a signature.</p>
          <p>
            {tenantProfile?.companyName} | Generated on {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetailPage;
