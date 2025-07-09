import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import OpportunityCard from "./OpportunityCard";

const KanbanBoard = ({ columns, onDragEnd }) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <div className="flex gap-6 items-start overflow-x-auto pb-4">
      {Object.entries(columns).map(([columnId, column]) => (
        <div key={columnId} className="flex-shrink-0 w-80 bg-slate-900/50 rounded-lg">
          <h3 className="p-4 text-sm font-bold text-slate-100 border-b border-slate-700 uppercase tracking-wider">
            {column.name} ({column.items.length})
          </h3>
          <Droppable droppableId={columnId}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="p-4 min-h-[400px]">
                {column.items.map((item, index) => (
                  <Draggable key={item._id} draggableId={item._id} index={index}>
                    {(provided) => <OpportunityCard opportunity={item} provided={provided} innerRef={provided.innerRef} />}
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
export default KanbanBoard;
