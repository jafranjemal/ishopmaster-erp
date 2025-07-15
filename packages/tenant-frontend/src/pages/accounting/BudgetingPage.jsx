import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  tenantBudgetService,
  tenantAccountingService,
  tenantClosingService,
  tenantLocationService,
  tenantDepartmentService,
} from '../../services/api';
import { Button, Card, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';
import BudgetingTable from '../../components/accounting/budgeting/BudgetingTable';
import { LoaderCircle } from 'lucide-react';

const BudgetingPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [accounts, setAccounts] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [prereqData, setPrereqData] = useState({ accounts: [], periods: [], branches: [], departments: [] });

  const [isLoading, setIsLoading] = useState(true);
  const [branchId, setBranchId] = useState('all');
  const [departmentId, setDepartmentId] = useState('all');
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [accountsRes, periodsRes, budgetsRes, branchesRes, deptsRes] = await Promise.all([
        tenantAccountingService.getAllAccounts(),
        tenantClosingService.getAllPeriods(),
        tenantBudgetService.getBudgets(year, { branchId, departmentId }), // Pass filters
        tenantLocationService.getAllBranches(),
        tenantDepartmentService.getAll(),
      ]);

      setPrereqData({
        accounts: accountsRes.data.data.filter((a) => a.type === 'Revenue' || a.type === 'Expense'),
        periods: periodsRes.data.data
          .filter((p) => new Date(p.startDate).getFullYear() === year)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
        branches: branchesRes.data.data,
        departments: deptsRes.data.data,
      });
      setBudgets(budgetsRes.data.data);

      // Filter for budgetable accounts and periods for the selected year
      // setAccounts(accountsRes.data.data.filter((a) => a.type === 'Revenue' || a.type === 'Expense'));
      // setPeriods(
      //   periodsRes.data.data
      //     .filter((p) => new Date(p.startDate).getFullYear() === year)
      //     .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
      // );
      //  setBudgets(budgetsRes.data.data);
    } catch (error) {
      toast.error('Failed to load budgeting data.');
    } finally {
      setIsLoading(false);
    }
  }, [year, branchId, departmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveBudget = async (budgetData) => {
    try {
      const payload = {
        ...budgetData,
        branchId: branchId === 'all' ? null : branchId,
        departmentId: departmentId === 'all' ? null : departmentId,
      };

      // Using a promise so we can show feedback, but not waiting for it to block UI
      toast.promise(tenantBudgetService.createOrUpdateBudget(payload), {
        loading: 'Saving...',
        success: 'Budget saved!',
        error: 'Save failed.',
      });
      fetchData();
    } catch (error) {
      // Errors are handled by the toast
    }
  };

  // Generate year options for the dropdown
  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2);

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Budgeting Workspace</h1>
      </div>
      <Card className='p-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <Label>Year</Label>
            <Select onValueChange={(val) => setYear(Number(val))} value={String(year)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Branch</Label>
            <Select onValueChange={setBranchId} value={branchId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Branches (Company-Wide)</SelectItem>
                {prereqData.branches.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Department</Label>
            <Select onValueChange={setDepartmentId} value={departmentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Departments</SelectItem>
                {prereqData.departments.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      {isLoading ? (
        <div className='flex justify-center p-8'>
          <LoaderCircle className='h-8 w-8 animate-spin' />
        </div>
      ) : (
        <BudgetingTable
          accounts={prereqData.accounts}
          periods={prereqData.periods}
          budgets={budgets}
          onSave={handleSaveBudget}
        />
      )}
    </div>
  );
};
export default BudgetingPage;
