import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from 'ui-library';
import TicketCard from './TicketCard';

const KanbanColumn = ({ status, tickets = [] }) => {
  const title = status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  // useSortable makes the entire column draggable in the future if we want to reorder columns
  const { setNodeRef, transform, transition } = useSortable({ id: status });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className='flex flex-col w-72 h-full bg-slate-900 rounded-lg flex-shrink-0'>
      <div className='p-3 border-b border-slate-700'>
        <h3 className='font-semibold text-white'>
          {title} <span className='text-sm font-normal text-slate-400'>{tickets.length}</span>
        </h3>
      </div>
      <SortableContext items={tickets.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <ScrollArea className='flex-grow p-3'>
          {tickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </ScrollArea>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
