import { CheckCircle, LoaderCircle } from 'lucide-react';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useAuth from '../../context/useAuth';
import { tenantRepairService } from '../../services/api';

/**
 * The definitive, data-driven status timeline component.
 * It fetches and displays the real audit trail for a repair ticket.
 */
const StatusTimeline = ({ ticketId }) => {
  return (
    <>
      <StatusTimelineModern ticketId={ticketId} />
    </>
  );
};

export default StatusTimeline;

// Reusable loading spinner
const LoadingSpinner = () => (
  <div className='flex justify-center items-center h-24'>
    <LoaderCircle className='h-8 w-8 animate-spin text-indigo-500' />
  </div>
);

// Empty state handler
const EmptyState = () => (
  <div className='text-center py-8'>
    <div className='mx-auto bg-slate-900 border border-slate-800 rounded-full w-12 h-12 flex items-center justify-center mb-3'>
      <History className='h-5 w-5 text-slate-500' />
    </div>
    <p className='text-slate-500 text-sm'>No history events found</p>
  </div>
);

// Custom hook for data fetching
const useTicketHistory = (ticketId) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ticketId) {
      setIsLoading(true);
      tenantRepairService
        .getTicketHistory(ticketId)
        .then((res) => setHistory(res.data.data))
        .catch(() => toast.error('Could not load ticket history.'))
        .finally(() => setIsLoading(false));
    }
  }, [ticketId]);

  return { history, isLoading };
};

const StatusTimelineModern = ({ ticketId }) => {
  const { history, isLoading } = useTicketHistory(ticketId);
  const { formatDate } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (history.length === 0) return <EmptyState />;

  return (
    <div className='relative'>
      {/* Gradient line */}
      <div className='absolute left-4 top-2 h-[calc(100%-16px)] w-0.5 bg-gradient-to-b from-indigo-400 to-emerald-400 z-0'></div>

      <div className='space-y-4 pl-10'>
        {history.map((event) => (
          <div key={event._id} className='relative group'>
            {/* Animated icon */}
            <div className='absolute -left-10 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg z-10'>
              <CheckCircle className='h-4 w-4 text-white transition-transform group-hover:scale-110' />
            </div>

            <div className='rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-all duration-300 group-hover:bg-slate-800/60 group-hover:shadow-lg'>
              <div className='flex flex-wrap items-baseline gap-2'>
                <h3 className='text-base font-semibold text-white capitalize'>{event.newStatus.replace(/_/g, ' ')}</h3>
                <div className='h-1 w-1 rounded-full bg-slate-500'></div>
                <time className='text-xs font-medium text-indigo-300'>{formatDate(event.createdAt, true)}</time>
              </div>

              <div className='mt-1 flex items-center'>
                <span className='text-xs text-slate-400'>by {event.changedBy?.name || 'System'}</span>
              </div>

              {event.notes && (
                <div className='mt-3 pt-3 border-t border-slate-800'>
                  <p className='text-sm text-slate-300'>{event.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
