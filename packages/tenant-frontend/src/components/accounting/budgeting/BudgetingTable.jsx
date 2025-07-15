import React, { useState, useEffect } from 'react';
import { Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import useAuth from '../../../context/useAuth';

const BudgetingTable = ({ accounts, periods, budgets, onSave }) => {
  const [localBudgets, setLocalBudgets] = useState({});
  const { formatCurrency } = useAuth();
  console.log('budgets', budgets);
  useEffect(() => {
    // Create a fast lookup map for existing budget data: "accountId-periodId": amount
    const budgetMap = budgets.reduce((acc, budget) => {
      const key = `${budget.accountId._id}-${budget.financialPeriodId._id}`;
      acc[key] = budget.amount;
      return acc;
    }, {});
    setLocalBudgets(budgetMap);
  }, [budgets]);

  const handleValueChange = (accountId, periodId, value) => {
    const key = `${accountId}-${periodId}`;
    setLocalBudgets((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (accountId, periodId) => {
    const key = `${accountId}-${periodId}`;
    const amount = localBudgets[key];
    if (amount !== undefined && amount !== '') {
      onSave({
        accountId,
        financialPeriodId: periodId,
        amount: Number(amount),
      });
    }
  };

  return (
    <div className='border border-slate-700 rounded-lg overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='sticky left-0 bg-slate-800 z-10 min-w-[250px]'>Account</TableHead>
            {periods.map((p) => (
              <TableHead key={p._id} className='text-center'>
                {p.name.split(' ')[0]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((acc) => (
            <TableRow key={acc._id}>
              <TableCell className='sticky left-0 bg-slate-800 z-10 font-medium'>{acc.name}</TableCell>
              {periods.map((p) => {
                const key = `${acc._id}-${p._id}`;
                return (
                  <TableCell key={p._id}>
                    <Input
                      type='number'
                      placeholder='0.00'
                      className='w-32 text-right font-mono'
                      value={localBudgets[key] || ''}
                      onChange={(e) => handleValueChange(acc._id, p._id, e.target.value)}
                      onBlur={() => handleSave(acc._id, p._id)}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
export default BudgetingTable;
