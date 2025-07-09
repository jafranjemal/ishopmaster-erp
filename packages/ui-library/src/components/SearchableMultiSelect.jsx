import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import Input from "./Input";
import { Checkbox } from "./Checkbox";
import Label from "./Label";

// ... component code remains the same as it has no API calls ...
// This component is self-contained and ready.
const SearchableMultiSelect = ({ options, selectedIds, onChange, placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  const handleSelect = (optionId) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(optionId)) {
      newSelectedIds.delete(optionId);
    } else {
      newSelectedIds.add(optionId);
    }
    onChange(Array.from(newSelectedIds));
  };

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt._id));

  return (
    <div>
      <div className="p-2 bg-slate-900/50 rounded-md mb-2 flex flex-wrap gap-2 min-h-[40px]">
        {selectedOptions.length > 0 ? (
          selectedOptions.map((opt) => (
            <div
              key={opt._id}
              className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1"
            >
              {opt.name}
              <X size={12} className="cursor-pointer" onClick={() => handleSelect(opt._id)} />
            </div>
          ))
        ) : (
          <span className="text-xs text-slate-500 italic p-1">No items selected.</span>
        )}
      </div>
      <Input
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-2 bg-slate-700"
      />
      <div className="max-h-32 overflow-y-auto border border-slate-700 rounded-md p-2 space-y-2">
        {filteredOptions.map((option) => (
          <div key={option._id} className="flex items-center space-x-2">
            <Checkbox
              id={`option-${option._id}`}
              checked={selectedIds.includes(option._id)}
              onCheckedChange={() => handleSelect(option._id)}
            />
            <Label
              htmlFor={`option-${option._id}`}
              className="text-sm font-normal text-white w-full cursor-pointer"
            >
              {option.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SearchableMultiSelect;
