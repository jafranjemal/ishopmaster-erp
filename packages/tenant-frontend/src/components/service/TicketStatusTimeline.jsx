import { CheckCircle } from 'lucide-react';
import useAuth from '../../context/useAuth';

const StatusTimeline = ({ ticket }) => {
  const { formatDate } = useAuth();
  // In a real system, this history would come from an audit log on the ticket
  const history = [
    { status: 'intake', date: ticket.createdAt },
    // ... other status changes would be added here
  ];

  return (
    <ol className='relative border-l border-slate-700 ml-2'>
      {history.map((event, index) => (
        <li key={index} className='mb-6 ml-6'>
          <span className='absolute flex items-center justify-center w-6 h-6 bg-indigo-600 rounded-full -left-3 ring-8 ring-slate-900'>
            <CheckCircle className='w-4 h-4 text-white' />
          </span>
          <h3 className='flex items-center mb-1 text-lg font-semibold text-white capitalize'>
            {event.status.replace('_', ' ')}
          </h3>
          <time className='block mb-2 text-sm font-normal leading-none text-slate-400'>
            {formatDate(event.date, true)}
          </time>
        </li>
      ))}
    </ol>
  );
};
export default StatusTimeline;
