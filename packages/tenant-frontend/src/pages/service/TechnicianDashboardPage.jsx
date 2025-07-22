import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import KanbanBoard from '../../components/service/kanban/KanbanBoard';
import { tenantRepairService } from '../../services/api';

const TechnicianDashboardPage = () => {
  const [tickets, setTickets] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantRepairService.getMyTickets();
      setTickets(res.data.data);
    } catch (error) {
      toast.error('Failed to load your job queue.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTicketMove = (ticketId, newStatus, originalStatus) => {
    // Optimistic Update: Move the card in the UI immediately
    const ticketToMove = tickets[originalStatus].find((t) => t._id === ticketId);
    const newColumns = { ...tickets };

    // Remove from old column
    newColumns[originalStatus] = newColumns[originalStatus].filter((t) => t._id !== ticketId);
    // Add to new column
    if (!newColumns[newStatus]) newColumns[newStatus] = [];
    newColumns[newStatus].push(ticketToMove);

    setTickets(newColumns);

    // Then, make the API call in the background
    toast.promise(tenantRepairService.updateStatus(ticketId, newStatus), {
      loading: 'Updating status...',
      success: 'Status updated!',
      error: (err) => {
        // If the API call fails, revert the optimistic update
        fetchData();
        return err.response?.data?.error || 'Update failed.';
      },
    });
  };

  if (isLoading) return <p className='p-8 text-center'>Loading your job queue...</p>;

  return (
    <div className='h-full flex flex-col'>
      <h1 className='text-3xl font-bold mb-4'>My Job Queue</h1>
      <div className='flex-grow overflow-hidden'>
        <KanbanBoard columns={tickets} onTicketMove={handleTicketMove} />
      </div>
    </div>
  );
};
export default TechnicianDashboardPage;
