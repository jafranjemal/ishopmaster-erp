import React from "react";
import { ChevronRight } from "lucide-react";

const BreadcrumbNavigator = ({ path, onNavigate }) => (
  <div className="flex items-center gap-1 text-sm text-slate-400 mb-4 flex-wrap">
    <span onClick={() => onNavigate(-1)} className="cursor-pointer hover:text-white font-medium">
      All
    </span>
    {path.map((part, index) => (
      <React.Fragment key={part._id}>
        <ChevronRight className="h-4 w-4" />
        <span onClick={() => onNavigate(index)} className="cursor-pointer hover:text-white font-medium">
          {part.name}
        </span>
      </React.Fragment>
    ))}
  </div>
);
export default BreadcrumbNavigator;
