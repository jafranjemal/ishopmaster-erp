import React from "react";
import { Button } from "ui-library";
import { cn } from "ui-library/lib/utils";
import { Wrench, ShoppingBasket, Repeat, MoreHorizontal } from "lucide-react";

const WORKFLOW_TABS = [
  { id: "REPAIRS", label: "Repairs", icon: Wrench },
  { id: "ACCESSORIES", label: "Accessories", icon: ShoppingBasket },
  { id: "TRADE_IN", label: "Trade In", icon: Repeat },
  { id: "MISCELLANEOUS", label: "Miscellaneous", icon: MoreHorizontal },
];

const WorkspaceTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex-shrink-0 bg-slate-900/50 p-1 rounded-lg flex items-center gap-1">
      {WORKFLOW_TABS.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          variant="ghost"
          className={cn(
            "flex-1 text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 h-12",
            activeTab === tab.id ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
          )}
        >
          <tab.icon className="h-5 w-5" />
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default WorkspaceTabs;
