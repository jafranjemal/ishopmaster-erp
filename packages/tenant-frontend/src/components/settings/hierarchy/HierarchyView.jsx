import React from "react";
import { Button, Card, CardContent } from "ui-library";
import { PlusCircle, ChevronRight } from "lucide-react";
import { cn } from "ui-library";

const HierarchyColumn = ({ title, items, selectedId, onSelect, onAdd }) => (
  <div className="flex-shrink-0 w-64 border-r border-slate-700">
    <div className="p-2 border-b border-slate-700 flex justify-between items-center">
      <h4 className="font-semibold text-sm">{title}</h4>
      {onAdd && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAdd}>
          <PlusCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
    <div className="overflow-y-auto h-full">
      {items.map((item) => (
        <div
          key={item._id}
          onClick={() => onSelect(item)}
          className={cn(
            "flex justify-between items-center p-2 text-sm cursor-pointer hover:bg-slate-700/50",
            selectedId === item._id && "bg-indigo-600/20"
          )}
        >
          <span>{item.name}</span>
          {item.children?.length > 0 && <ChevronRight className="h-4 w-4 text-slate-500" />}
        </div>
      ))}
    </div>
  </div>
);

const HierarchyView = ({ data, selections, onSelect, onAdd }) => {
  // ... Logic to determine what to show in each column based on selections ...
  const { categories, brands, devices, repairTypes } = data;
  const { category, brand, device } = selections;

  const subCategories = category ? categories.find((c) => c._id === category)?.children || [] : [];

  return (
    <Card className="h-[60vh]">
      <CardContent className="p-0 h-full flex overflow-x-auto">
        <HierarchyColumn
          title="Top-Level Categories"
          items={categories}
          selectedId={category}
          onSelect={(item) => onSelect("category", item._id)}
          onAdd={() => onAdd("category")}
        />
        {category && (
          <HierarchyColumn
            title="Sub-Categories / Brands"
            items={subCategories.length > 0 ? subCategories : brands}
            selectedId={brand}
            onSelect={(item) => onSelect("brand", item._id)}
            onAdd={() => onAdd("subCategory", category)}
          />
        )}
        {brand && (
          <HierarchyColumn
            title="Devices"
            items={devices}
            selectedId={device}
            onSelect={(item) => onSelect("device", item._id)}
            onAdd={() => onAdd("device", brand)}
          />
        )}
        {device && <HierarchyColumn title="Repair Types" items={repairTypes} onSelect={() => {}} onAdd={() => onAdd("repairType", device)} />}
      </CardContent>
    </Card>
  );
};
export default HierarchyView;
