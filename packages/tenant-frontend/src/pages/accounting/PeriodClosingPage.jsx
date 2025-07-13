import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { tenantClosingService } from '../../services/api';
import { Button, Select, Label, SelectContent, SelectItem, SelectTrigger, SelectValue, Card } from 'ui-library';
import ClosingChecklist from '../../components/accounting/closing/ClosingChecklist';
import { Lock } from 'lucide-react';

const PeriodClosingPage = () => {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Fetch available financial periods on mount
  useEffect(() => {
    tenantClosingService
      .getAllPeriods()
      .then((res) => {
        setPeriods(res.data.data);
        // Select the most recent open period by default
        const mostRecentOpen = res.data.data.find((p) => p.status === 'Open');
        if (mostRecentOpen) {
          setSelectedPeriodId(mostRecentOpen._id);
        }
      })
      .catch(() => toast.error('Failed to load financial periods.'));
  }, []);

  // Fetch the checklist status whenever the selected period changes
  const fetchChecklistStatus = useCallback(async () => {
    if (!selectedPeriodId) return;
    setIsLoading(true);
    try {
      const res = await tenantClosingService.getClosingStatus(selectedPeriodId);
      setChecklist(res.data.data);
    } catch (error) {
      toast.error('Failed to get closing status for the selected period.');
      setChecklist([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriodId]);

  useEffect(() => {
    fetchChecklistStatus();
  }, [fetchChecklistStatus]);

  const handleClosePeriod = async () => {
    if (!isClosable) return;
    setIsClosing(true);
    try {
      await toast.promise(tenantClosingService.closePeriod(selectedPeriodId), {
        loading: 'Closing financial period...',
        success: 'Period has been successfully closed and locked.',
        error: (err) => err.response?.data?.error || 'Failed to close period.',
      });
      // Refresh all data
      fetchChecklistStatus();
      tenantClosingService.getAllPeriods().then((res) => setPeriods(res.data.data));
    } catch (err) {
      /* Handled by toast */
    } finally {
      setIsClosing(false);
    }
  };

  const isClosable = useMemo(() => checklist.length > 0 && checklist.every((item) => item.isCompleted), [checklist]);

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>Financial Period Closing</h1>
      <Card className='p-6'>
        <div className='flex items-end gap-4'>
          <div className='flex-grow'>
            <Label>Select Period to Close</Label>
            <Select onValueChange={setSelectedPeriodId} value={selectedPeriodId}>
              <SelectTrigger>
                <SelectValue placeholder='Select a period...' />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p._id} value={p._id} disabled={p.status !== 'Open'}>
                    {p.name} ({p.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleClosePeriod} disabled={!isClosable || isClosing}>
            <Lock className='h-4 w-4 mr-2' />
            {isClosing ? 'Closing...' : 'Close Period'}
          </Button>
        </div>
      </Card>

      {selectedPeriodId && (isLoading ? <p>Loading checklist...</p> : <ClosingChecklist checklistItems={checklist} />)}
    </div>
  );
};
export default PeriodClosingPage;
