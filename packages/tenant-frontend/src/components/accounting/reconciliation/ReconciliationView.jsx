import React, { useState } from 'react';
import { Button, Card, CardContent, Badge } from 'ui-library';
import useAuth from '../../../context/useAuth';
import { cn } from 'ui-library/lib/utils';
import { CheckCircle } from 'lucide-react';

const ReconciliationView = ({ statement, suggestions, onConfirmMatch }) => {
  const [selectedLineId, setSelectedLineId] = useState(null);
  const { formatCurrency, formatDate } = useAuth();

  const selectedSuggestions = suggestions.find((s) => s.statementLineId === selectedLineId)?.potentialMatches || [];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]'>
      {/* Left Panel: Bank Statement Lines */}
      <Card className='flex flex-col'>
        <CardHeader>
          <CardTitle>Bank Statement Lines</CardTitle>
        </CardHeader>
        <CardContent className='flex-grow overflow-y-auto'>
          {statement.lines.map((line) => (
            <div
              key={line._id}
              onClick={() => setSelectedLineId(line._id)}
              className={cn(
                'p-3 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50',
                selectedLineId === line._id && 'bg-indigo-600/20',
              )}
            >
              <div className='flex justify-between items-center'>
                <p className='font-medium'>{line.description}</p>
                <p className={cn('font-mono font-bold', line.type === 'credit' ? 'text-green-400' : 'text-red-400')}>
                  {formatCurrency(line.amount)}
                </p>
              </div>
              <p className='text-xs text-slate-400'>{formatDate(line.date)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Right Panel: Suggested Matches */}
      <Card className='flex flex-col'>
        <CardHeader>
          <CardTitle>Suggested Matches in ERP</CardTitle>
        </CardHeader>
        <CardContent className='flex-grow overflow-y-auto'>
          {!selectedLineId && (
            <p className='text-center p-8 text-slate-400'>Select a line from the left to see suggestions.</p>
          )}
          {selectedLineId &&
            selectedSuggestions.map((match) => (
              <div key={match._id} className='p-3 border-b border-slate-700'>
                <div className='flex justify-between items-center'>
                  <p className='font-medium'>{match.description}</p>
                  <p className='font-mono font-bold'>{formatCurrency(match.amountInBaseCurrency)}</p>
                </div>
                <p className='text-xs text-slate-400'>{formatDate(match.date)}</p>
                <div className='text-right mt-2'>
                  <Button size='sm' onClick={() => onConfirmMatch(selectedLineId, [match._id])}>
                    <CheckCircle className='h-4 w-4 mr-2' />
                    Confirm Match
                  </Button>
                </div>
              </div>
            ))}
          {selectedLineId && selectedSuggestions.length === 0 && (
            <p className='text-center p-8 text-slate-400'>No strong matches found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default ReconciliationView;
