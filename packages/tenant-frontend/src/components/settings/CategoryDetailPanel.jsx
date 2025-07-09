import React, { useState, useEffect } from "react";
import { Button } from "ui-library"; // Correct import

import { Tag, PenTool, PlusCircle, PenToolIcon } from "lucide-react";
import SearchableMultiSelect from "../../../../ui-library/src/components/SearchableMultiSelect";

// ... component code remains the same ...
const CategoryDetailPanel = ({ category, allBrands, allRepairTypes, onSaveLinks, onAddNewEntity, isSaving }) => {
  const [linkedBrandIds, setLinkedBrandIds] = useState([]);
  const [linkedRepairTypeIds, setLinkedRepairTypeIds] = useState([]);

  useEffect(() => {
    // The || [] ensures that if linkedBrands is undefined, it doesn't crash.
    // The .map(b => b._id || b) handles cases where the data might be populated (object) or just an ID (string).
    setLinkedBrandIds(category?.linkedBrands?.map((b) => b._id || b) || []);
    setLinkedRepairTypeIds(category?.linkedRepairTypes?.map((r) => r._id || r) || []);
  }, [category]);

  if (!category) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>Select a category to see details</p>
      </div>
    );
  }

  const handleSaveChanges = () => {
    onSaveLinks(category._id, {
      linkedBrands: linkedBrandIds,
      linkedRepairTypes: linkedRepairTypeIds,
    });
  };

  return (
    <div className="flex flex-col h-full p-1">
      <h2 className="text-lg font-bold text-white mb-1">Details</h2>
      <p className="text-sm text-indigo-400 mb-4">
        Editing: <span className="font-semibold">{category.name}</span>
      </p>

      <div className="space-y-6 flex-1">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold flex items-center space-x-2 text-slate-300">
              <Tag size={18} />
              <span>Linked Brands</span>
            </h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => onAddNewEntity("brand")}>
              <PlusCircle size={14} className="mr-1" /> Add New
            </Button>
          </div>
          <SearchableMultiSelect options={allBrands} selectedIds={linkedBrandIds} onChange={setLinkedBrandIds} placeholder="Search brands..." />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-semibold flex items-center space-x-2 text-slate-300">
              <PenToolIcon size={18} />
              <span>Linked Repair Types</span>
            </h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => onAddNewEntity("repairType")}>
              <PlusCircle size={14} className="mr-1" /> Add New
            </Button>
          </div>
          <SearchableMultiSelect options={allRepairTypes} selectedIds={linkedRepairTypeIds} onChange={setLinkedRepairTypeIds} placeholder="Search repair types..." />
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full">
          {isSaving ? "Saving Links..." : "Save Links"}
        </Button>
      </div>
    </div>
  );
};
export default CategoryDetailPanel;
