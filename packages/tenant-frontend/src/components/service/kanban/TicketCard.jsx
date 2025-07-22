import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from 'ui-library';
import { cn } from 'ui-library/lib/utils';
import useAuth from '../../../context/useAuth';

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();
  const { formatDate } = useAuth();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => navigate(`/service/tickets/${ticket._id}`)}
      className='mb-3'
    >
      <Card
        className={cn(
          'hover:bg-slate-700 transition-colors',
          isDragging ? 'bg-slate-700 ring-2 ring-indigo-500 shadow-lg' : 'bg-slate-800',
        )}
      >
        <CardContent className='p-3'>
          <p className='font-semibold text-sm mb-1'>{ticket.assets[0]?.deviceId?.name || 'Asset Details Missing'}</p>
          <p className='text-xs text-slate-400 font-mono'>{ticket.ticketNumber}</p>
          <p className='text-xs text-slate-300 mt-2'>{ticket.customer.name}</p>
          <p className='text-xs text-slate-500 mt-1'>Intake: {formatDate(ticket.createdAt)}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketCard;
