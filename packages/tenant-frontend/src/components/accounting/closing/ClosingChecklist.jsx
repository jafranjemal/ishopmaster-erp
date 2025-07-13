import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'ui-library';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from 'ui-library/lib/utils';

const ClosingChecklist = ({ checklistItems = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Period Closing Checklist</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {checklistItems.map((item, index) => (
          <div key={index} className='flex items-center justify-between p-3 bg-slate-800 rounded-md'>
            <div className='flex items-center gap-3'>
              {item.isCompleted ? (
                <CheckCircle2 className='h-5 w-5 text-green-500' />
              ) : (
                <XCircle className='h-5 w-5 text-red-500' />
              )}
              <span className='font-medium'>{item.task}</span>
            </div>
            <span className={cn('text-sm', item.isCompleted ? 'text-slate-400' : 'text-amber-400')}>
              {item.details}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
export default ClosingChecklist;
