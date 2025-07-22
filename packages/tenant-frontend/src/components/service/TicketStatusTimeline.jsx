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
  const { formatDate } = useAuth();
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

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-24'>
        <LoaderCircle className='h-6 w-6 animate-spin' />
      </div>
    );
  }

  if (history.length === 0) {
    return <p className='text-slate-500 text-center text-sm'>No history events found.</p>;
  }

  return (
    <ol className='relative border-l border-slate-700 ml-2'>
      {history.map((event) => (
        <li key={event._id} className='mb-6 ml-6'>
          <span className='absolute flex items-center justify-center w-6 h-6 bg-indigo-600 rounded-full -left-3 ring-8 ring-slate-900'>
            <CheckCircle className='w-4 h-4 text-white' />
          </span>
          <h3 className='flex items-center mb-1 text-base font-semibold text-white capitalize'>
            {event.newStatus.replace(/_/g, ' ')}
          </h3>
          <time className='block mb-2 text-xs font-normal leading-none text-slate-400'>
            {formatDate(event.createdAt, true)} by {event.changedBy?.name || 'System'}
          </time>
          {event.notes && (
            <p className='text-sm font-normal text-slate-500 bg-slate-800 p-2 rounded-md'>{event.notes}</p>
          )}
        </li>
      ))}
    </ol>
  );
};

export default StatusTimeline;
