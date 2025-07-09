import React from "react";
import { Button } from "ui-library";
import { User, Edit, PlusCircle } from "lucide-react";

const CustomerContext = ({ customer, onEdit, onNew, onClear }) => {
  return (
    <div className="p-3 bg-slate-900/50 rounded-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 overflow-hidden">
          <User className="h-6 w-6 text-slate-400 flex-shrink-0" />
          <div className="truncate">
            <p className="font-semibold truncate" title={customer?.name}>
              {customer?.name || "No Customer Selected"}
            </p>
            <p className="text-xs text-slate-400 truncate">{customer?.phone || "Select or create a customer"}</p>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={onNew}>
            New
          </Button>
        </div>
      </div>
    </div>
  );
};
export default CustomerContext;
