// import React, { useState, useEffect } from "react";

// export const FilterBar = ({
//   filterConfig = [],
//   filters, // controlled filters object from parent
//   onFilterChange, // callback to update filters in parent
//   onFilterClear, // optional callback for clear
// }) => {
//   // Local state for debounced search input, sync with filters.search
//   const [searchTerm, setSearchTerm] = useState(filters.search || "");

//   useEffect(() => {
//     setSearchTerm(filters.search || "");
//   }, [filters.search]);

//   // Debounce search input and notify parent after delay
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       if (searchTerm !== (filters.search || "")) {
//         onFilterChange({ ...filters, search: searchTerm, page: 1 });
//       }
//     }, 300);
//     return () => clearTimeout(handler);
//   }, [searchTerm]);

//   const handleSelectChange = (e) => {
//     const { name, value } = e.target;
//     onFilterChange({ ...filters, [name]: value, page: 1 });
//   };

//   const handleClear = () => {
//     onFilterChange({ search: "", brandId: "", categoryId: "", page: 1 });
//     if (onFilterClear) onFilterClear();
//   };

//   return (
//     <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mb-4">
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
//         {/* Search input */}
//         <div className="md:col-span-1 lg:col-span-2">
//           <label
//             htmlFor="search"
//             className="block text-sm font-medium text-slate-300 mb-1"
//           >
//             Search
//           </label>
//           <input
//             id="search"
//             placeholder="Search by name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-9 w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           />
//         </div>

//         {/* Dynamic selects */}
//         {filterConfig.map((filter) => (
//           <div key={filter.name}>
//             <label
//               htmlFor={filter.name}
//               className="block text-sm font-medium text-slate-300 mb-1"
//             >
//               {filter.label}
//             </label>
//             <select
//               id={filter.name}
//               name={filter.name}
//               value={filters[filter.name] || ""}
//               onChange={handleSelectChange}
//               className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             >
//               <option value="">All {filter.label}s</option>
//               {filter.options.map((option) => (
//                 <option key={option._id} value={option._id}>
//                   {option.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         ))}

//         {/* Clear Button */}
//         <div>
//           <button
//             onClick={handleClear}
//             className="w-full h-10 rounded-md border border-red-500 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
//           >
//             Clear
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FilterBar;

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Input } from "./Input";
import { Button } from "./Button";
import { Search, X, FileDown } from "lucide-react";

/**
 * A reusable, flexible filter bar for data tables.
 * It is 100% controlled by the parent page component.
 * @param {object} props
 * @param {object} props.filterValues - An object containing the current values of all filters.
 * @param {function(string, any): void} props.onFilterChange - A function to call when any filter value changes.
 * @param {function(): void} props.onApplyFilters - A function to call when the "Apply" button is clicked.
 * @param {function(): void} props.onClearFilters - A function to call to reset all filters.
 * @param {React.ReactNode} [props.children] - Custom filter inputs to be injected by the parent page.
 */
export const FilterBar = ({
  filterValues,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  children,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-lg">
      {/* Default Search Input */}
      <div className="relative flex-grow min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="Search..."
          name="searchTerm"
          value={filterValues?.searchTerm || ""}
          onChange={(e) => onFilterChange("searchTerm", e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Custom Filter Slot */}
      {children}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onApplyFilters}>
          Search
        </Button>
        <Button variant="ghost" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-2" /> Clear
        </Button>
      </div>

      {/* Export Dropdown */}
      <div className="ml-auto">
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
                onSelect={() => console.log("Exporting as PDF...")}
                className="p-2 text-sm cursor-pointer rounded hover:bg-slate-700"
              >
                Export as PDF
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => console.log("Exporting as Excel...")}
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
  );
};

export default FilterBar;
