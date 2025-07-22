import { DndContext, closestCenter } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';

/**
 * The main orchestrator for the technician's Kanban board.
 * It provides the DndContext and handles the logic for when a drag operation ends.
 *
 * @param {object} props
 * @param {object} props.columns - The ticket data, grouped by status (e.g., { intake: [...], diagnosing: [...] }).
 * @param {Function} props.onTicketMove - The callback to trigger an API call when a ticket changes status.
 */
const KanbanBoard = ({ columns, onTicketMove }) => {
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const ticketId = active.id;
      const newStatus = over.id;

      // Find the original status of the dragged ticket
      let originalStatus = null;
      for (const status in columns) {
        if (columns[status].some((ticket) => ticket._id === ticketId)) {
          originalStatus = status;
          break;
        }
      }

      // Only trigger the update if the column has actually changed
      if (originalStatus && newStatus !== originalStatus) {
        onTicketMove(ticketId, newStatus, originalStatus);
      }
    }
  };

  const columnOrder = [
    'intake',
    'diagnosing',
    'quote_pending',
    'approval_pending',
    'awaiting_parts',
    'repair_active',
    'qc_pending',
    'pickup_pending',
  ];

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className='flex gap-4 h-full overflow-x-auto pb-4'>
        {columnOrder.map((status) => (
          <KanbanColumn key={status} status={status} tickets={columns[status] || []} />
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
