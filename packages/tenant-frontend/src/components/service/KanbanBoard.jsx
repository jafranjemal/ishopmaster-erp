import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TicketCard from "./TicketCard";

const KanbanBoard = ({ columns, onDragEnd }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 items-start overflow-x-auto pb-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className="flex-shrink-0 w-72 bg-slate-900/50 rounded-lg">
            <h3 className="p-4 text-sm font-bold text-slate-100 border-b border-slate-700 uppercase tracking-wider">
              {column.name} ({column.items.length})
            </h3>
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 min-h-[400px] transition-colors ${snapshot.isDraggingOver ? "bg-indigo-900/20" : ""}`}
                >
                  {column.items.map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(provided) => <TicketCard ticket={item} provided={provided} innerRef={provided.innerRef} />}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};
export default KanbanBoard;
