import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'ui-library';

const STATUS_TRANSITIONS = {
  intake: ['diagnosing', 'cancelled'],
  diagnosing: ['awaiting_customer_approval', 'in_progress', 'cancelled'],
  awaiting_customer_approval: ['in_progress', 'cancelled'],
  awaiting_parts: ['in_progress', 'cancelled'],
  in_progress: ['completed_pending_qc', 'cancelled'],
  completed_pending_qc: ['completed_pending_pickup'],
  completed_pending_pickup: ['closed'],
};

const StatusUpdater = ({ currentStatus, onStatusChange }) => {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  if (allowedTransitions.length === 0) {
    return <p className='font-bold capitalize'>{currentStatus.replace('_', ' ')}</p>;
  }
  return (
    <Select onValueChange={onStatusChange} value={currentStatus}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={currentStatus} disabled>
          {currentStatus.replace('_', ' ')}
        </SelectItem>
        {allowedTransitions.map((status) => (
          <SelectItem key={status} value={status}>
            {status.replace('_', ' ')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
export default StatusUpdater;
