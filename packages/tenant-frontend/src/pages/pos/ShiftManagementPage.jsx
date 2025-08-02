import { Power, PowerOff, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Modal, Pagination } from 'ui-library';
import ShiftCloseForm from '../../components/pos/ShiftCloseForm';
import ShiftHistoryList from '../../components/pos/ShiftHistoryList';
import ShiftOpenForm from '../../components/pos/ShiftOpenForm';

import useAuth from '../../context/useAuth';
import tenantUrl from '../../hooks/useTenantId';
import { tenantShiftService } from '../../services/api';
const ShiftManagementPage = () => {
  const [activeShift, setActiveShift] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { formatDate } = useAuth();
  const navigate = useNavigate();
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch both active shift and history in parallel
      const [activeRes, historyRes] = await Promise.all([
        tenantShiftService.getActive(),
        tenantShiftService.getHistory({ page: currentPage, limit: 10 }),
      ]);

      const currentActiveShift = activeRes.data.data;
      if (currentActiveShift) {
        // If a shift is active, we don't need to stay on this page.
        navigate(tenantUrl('/pos/terminal'), { replace: true });
        return;
      }

      setActiveShift(null);
      setShiftHistory(historyRes.data.data);
      setPagination(historyRes.data.pagination);
    } catch (error) {
      console.log(error);
      toast.error('Could not load shift data.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenShift = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantShiftService.openShift(formData), {
        loading: 'Starting shift...',
        success: 'Shift started!',
        error: (err) => err.response?.data?.error || 'Failed.',
      });
      setIsModalOpen(false);
      navigate(tenantUrl('/pos/terminal'), { replace: true });
    } catch (err) {
      console.log(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseShift = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantShiftService.closeShift(activeShift._id, formData), {
        /* ... */
      });
      navigate('terminal');
      setIsModalOpen(false);
    } catch (err) {
      console.log(err);
    } finally {
      setIsSaving(false);
    }
  };

  const navigateToPos = () => {
    if (activeShift) {
      // If the API returns an active shift object (i.e., not null),
      // it means the user is already clocked in.

      // The gate is "open," so we immediately redirect them to the main terminal.
      navigate(tenantUrl('/pos/terminal'), { replace: true });
    } else {
      // If the API returns null, there is no active shift.
      // The gate is "closed." We stop the loading spinner and show the
      // "Start New Shift" button, forcing the user to take action.
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className='p-8 text-center'>Checking shift status...</div>;

  return (
    <div className='space-y-6'>
      <h1 className='text-3xl font-bold'>Shift Management</h1>
      <Card className='max-w-md mx-auto text-center'>
        <CardHeader>
          <CardTitle>{activeShift ? `Shift In Progress` : `No Active Shift`}</CardTitle>
          <CardDescription>
            {activeShift
              ? `Started on ${formatDate(activeShift.shift_start)}`
              : `Start a new shift to begin making sales.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeShift ? (
            <>
              <Button variant='destructive' size='lg' onClick={() => setIsModalOpen(true)}>
                <PowerOff className='mr-2 h-4 w-4' /> Close Shift
              </Button>
              <Button variant='success' size='lg' onClick={() => navigateToPos()}>
                <ShoppingCart className='mr-2 h-4 w-4' /> Open POS
              </Button>
            </>
          ) : (
            <Button variant='success' size='lg' onClick={() => setIsModalOpen(true)}>
              <Power className='mr-2 h-4 w-4' /> Start New Shift
            </Button>
          )}
        </CardContent>
      </Card>

      {/* This single modal is used for both open and close forms */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeShift ? 'Close Shift & Reconcile' : 'Start New Shift'}
      >
        {activeShift ? (
          <ShiftCloseForm
            activeShift={activeShift}
            onSave={handleCloseShift}
            onCancel={() => setIsModalOpen(false)}
            isSaving={isSaving}
          />
        ) : (
          <ShiftOpenForm onSave={handleOpenShift} onCancel={() => setIsModalOpen(false)} isSaving={isSaving} />
        )}
      </Modal>

      {/* A placeholder for the Shift History table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shift History</CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          <ShiftHistoryList shifts={shiftHistory} />
          {pagination && <Pagination paginationData={pagination} onPageChange={setCurrentPage} />}
        </CardContent>
      </Card>
    </div>
  );
};
export default ShiftManagementPage;
