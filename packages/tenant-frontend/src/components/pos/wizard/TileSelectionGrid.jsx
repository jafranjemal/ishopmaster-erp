import React from "react";
import { Card } from "ui-library";
import { Folder, Wrench, Smartphone } from "lucide-react";

const ICONS = {
  category: Folder,
  device: Smartphone,
  problem: Wrench,
};

const TileSelectionGrid = ({ items, onSelect, itemType = "category" }) => {
  const Icon = ICONS[itemType] || Folder;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <Card
          key={item._id}
          onClick={() => onSelect(item)}
          className="aspect-square flex flex-col items-center justify-center text-center p-2 cursor-pointer bg-slate-700 hover:bg-indigo-600/30 hover:border-indigo-500 transition-all duration-150"
        >
          <Icon className="h-8 w-8 text-indigo-400 mb-2" />
          <p className="text-xs font-semibold leading-tight line-clamp-2">{item.name || item.title}</p>
        </Card>
      ))}
    </div>
  );
};
export default TileSelectionGrid;
