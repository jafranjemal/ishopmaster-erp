import React from "react";
import { Button } from "ui-library";
import { PlusCircle, ChevronRight, FilePenLine, Trash2 } from "lucide-react";
import { cn } from "ui-library/lib/utils";

const HierarchyColumn = ({ title, items = [], parentId, selectedId, onSelect, onAdd, onEdit, onDelete, itemHasChildren = () => false }) => (
  <div className="flex-shrink-0 w-72 border-r border-slate-700 flex flex-col h-full">
    <div className="p-2 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
      <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400">{title}</h4>
      {onAdd && (
        <Button variant="ghost" size="sm" onClick={() => onAdd(parentId)} aria-label={`Add new ${title}`}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add
        </Button>
      )}
    </div>
    <div className="overflow-y-auto">
      {items.map((item) => (
        <div key={item._id} onClick={() => onSelect(item)} className={cn("group flex justify-between items-center p-2 text-sm cursor-pointer hover:bg-slate-700/50", selectedId === item._id && "bg-indigo-600/20 text-white font-semibold")}>
          <span className="truncate" title={item.name || item.title}>
            {item.name || item.title}
          </span>
          <div className="flex items-center">
            <div className="hidden group-hover:flex items-center">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                >
                  <FilePenLine className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
            {itemHasChildren(item) && <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />}
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default HierarchyColumn;
