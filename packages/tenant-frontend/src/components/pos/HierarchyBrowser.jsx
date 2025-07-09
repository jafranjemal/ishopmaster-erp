import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "ui-library/lib/utils";

const HierarchyColumn = ({ title, items, selectedId, onSelect }) => (
  <div className="flex-shrink-0 w-48 border-r border-slate-600">
    <h4 className="font-semibold text-xs uppercase text-slate-400 p-2 border-b border-slate-600">{title}</h4>
    <div className="overflow-y-auto">
      {items.map((item) => (
        <div
          key={item._id}
          onClick={() => onSelect(item)}
          className={cn(
            "flex justify-between items-center p-2 text-sm cursor-pointer hover:bg-slate-700/50",
            selectedId === item._id && "bg-indigo-600/30 font-semibold"
          )}
        >
          <span className="truncate">{item.name}</span>
          <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

const HierarchyBrowser = ({ data, onFilterChange }) => {
  // This is a simplified version. A full implementation would manage selections and fetch data dynamically.
  return (
    <div className="flex h-48 border border-slate-600 rounded-md overflow-y-auto">
      <HierarchyColumn title="Category" items={data.categories} onSelect={(item) => onFilterChange({ categoryId: item._id })} />
      {/* Additional columns for Brand, Model etc. would be rendered here based on selection */}
    </div>
  );
};
export default HierarchyBrowser;
