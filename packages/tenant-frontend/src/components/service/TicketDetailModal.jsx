import { Badge, Modal } from 'ui-library';
import StatusTimeline from './TicketStatusTimeline';

const TicketDetailModal = ({ isOpen, onClose, ticket }) => {
  if (!ticket) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Details for Ticket #${ticket.ticketNumber}`} size='lg'>
      <div className='space-y-4'>
        <div>
          <h3 className='font-semibold'>Customer: {ticket?.customerId?.name}</h3>
          <p className='text-sm text-slate-400'>
            Status: <Badge className='capitalize'>{ticket.status.replace('_', ' ')}</Badge>
          </p>
        </div>
        <div className='border-t border-slate-700 pt-4'>
          <h4 className='font-semibold mb-2'>Status History</h4>
          <StatusTimeline ticketId={ticket._id} />
        </div>
      </div>
    </Modal>
  );
};
export default TicketDetailModal;
