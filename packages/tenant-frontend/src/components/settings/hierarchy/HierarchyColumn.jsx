import React from "react";
import { Button } from "ui-library";
import { PlusCircle, ChevronRight, FilePenLine, Trash2 } from "lucide-react";
import { cn } from "ui-library/lib/utils";

const HierarchyColumn = ({ title, items = [], parentId, selectedId, onSelect, onAdd, onEdit, onDelete, itemHasChildren = () => false }) => (
  <div className="flex-shrink-0 w-72 border-r border-slate-700/80 dark:border-slate-600 flex flex-col h-full bg-slate-900/5">
    {/* Header */}
    <div className="p-3 border-b border-slate-700/80 flex justify-between items-center">
      <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-400">{title}</h4>
      {onAdd && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAdd(parentId)}
          aria-label={`Add new ${title}`}
          className="gap-1 text-slate-400 hover:text-indigo-500"
        >
          <PlusCircle className="h-4 w-4" />
          Add
        </Button>
      )}
    </div>

    {/* Scrollable item list */}
    <div className="overflow-y-auto text-sm">
      {items.map((item) => {
        const isSelected = selectedId === item._id;
        const hasChildren = itemHasChildren(item);

        return (
          <div
            key={item._id}
            onClick={() => onSelect(item)}
            className={cn(
              "group flex justify-between items-center px-3 py-2 cursor-pointer transition-colors duration-100",
              isSelected ? "bg-indigo-600/20 text-white font-semibold" : "hover:bg-slate-700/40 text-slate-300"
            )}
          >
            {/* Name and price column */}
            <div className="flex flex-col min-w-0">
              <span className="truncate font-medium" title={item.name || item.title}>
                {item.name || item.title}
              </span>
              {item.defaultPrice != null && (
                <span className="text-xs text-lime-400 font-mono">
                  {typeof item.defaultPrice === "number" ? `Rs. ${item.defaultPrice.toFixed(2)}` : item.defaultPrice}
                </span>
              )}
            </div>

            {/* Right-side actions */}
            <div className="flex items-center space-x-1">
              <div className="hidden group-hover:flex items-center space-x-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
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
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {hasChildren && <ChevronRight className="h-4 w-4 text-slate-500" />}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default HierarchyColumn;
