import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import useAuth from '../../context/useAuth';
import { cn } from 'ui-library/lib/utils';

const CustomerCreditWidget = ({ creditLimit = 0, currentBalance = 0 }) => {
  const { formatCurrency } = useAuth();
  const availableCredit = creditLimit - currentBalance;
  const usedPercentage = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Status</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-1'>
          <div className='flex justify-between text-sm'>
            <span className='text-slate-400'>Used</span>
            <span className='font-medium'>{formatCurrency(currentBalance)}</span>
          </div>
          <div className='w-full bg-slate-700 rounded-full h-2.5'>
            <div
              className={cn(
                'h-2.5 rounded-full',
                usedPercentage > 85 ? 'bg-red-500' : usedPercentage > 60 ? 'bg-amber-500' : 'bg-green-500',
              )}
              style={{ width: `${Math.min(usedPercentage, 100)}%` }}
            ></div>
          </div>
          <div className='flex justify-between text-xs text-slate-500'>
            <span>Available: {formatCurrency(availableCredit)}</span>
            <span>Limit: {formatCurrency(creditLimit)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default CustomerCreditWidget;
