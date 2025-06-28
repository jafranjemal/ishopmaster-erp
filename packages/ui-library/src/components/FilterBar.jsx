import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Input } from "./Input";
import { Button } from "./Button";
import { Search, X, FileDown, Filter } from "lucide-react";

const FilterBar = ({
  filterValues,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  children,
}) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-4">
      {/* Top Row: Search and Export */}
      <div className="w-full flex  justify-between items-center gap-4">
        {/* Search input + button */}
        <div className=" flex items-center flex-wrap gap-2 flex-grow">
          <div className="flex flex-1  relative  sm:w-auto   ">
            <Search className="absolute left-2 top-2/4 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              style={{ paddingLeft: 30 }}
              placeholder="Search..."
              value={filterValues?.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className=" pl-9 w-full"
            />
          </div>
          <Button variant="outline" onClick={onApplyFilters}>
            Search
          </Button>
        </div>

        {/* Export */}
        <div className="w-[100px]">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="secondary">
                <FileDown className="h-4 w-4 mr-2" /> Export
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={5}
                align="end"
                className="z-50 w-48 rounded-md border border-slate-700 bg-slate-800 p-1 shadow-lg"
              >
                <DropdownMenu.Item
                  onSelect={() => console.log("Export PDF")}
                  className="p-2 text-sm cursor-pointer rounded hover:bg-slate-700"
                >
                  Export as PDF
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => console.log("Export Excel")}
                  className="p-2 text-sm cursor-pointer rounded hover:bg-slate-700"
                >
                  Export as Excel (CSV)
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => window.print()}
                  className="p-2 text-sm cursor-pointer rounded hover:bg-slate-700"
                >
                  Print
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Middle Row: Dynamic Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>

      {/* Bottom Row: Clear button */}
      <div className="flex justify-start">
        <Button variant="ghost" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-2" /> Clear Filters
        </Button>
        <Button variant="outline" onClick={onApplyFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
