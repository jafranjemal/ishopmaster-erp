import React from "react";
import { Button } from "ui-library";
import { FilePenLine, Trash2, Users } from "lucide-react";
import { cn } from "ui-library";

const CustomerGroupList = ({ groups, selectedGroupId, onSelect, onEdit, onDelete }) => (
  <div className="space-y-2">
    {groups.map((group) => (
      <div
        key={group._id}
        onClick={() => onSelect(group)}
        className={cn(
          "p-3 rounded-lg cursor-pointer border border-slate-700 hover:bg-slate-700/50 transition-colors group",
          selectedGroupId === group._id && "bg-indigo-600/20 border-indigo-500"
        )}
      >
        <div className="flex justify-between items-center">
          <span className="font-semibold">{group.name}</span>
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(group);
              }}
            >
              <FilePenLine className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(group);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
          <Users className="h-3 w-3" /> {group.customerCount} members
        </p>
      </div>
    ))}
  </div>
);
export default CustomerGroupList;
