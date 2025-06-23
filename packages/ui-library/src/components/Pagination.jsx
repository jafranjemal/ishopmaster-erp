// import React from "react";
// import { Button } from "./Button";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
// } from "lucide-react";

// /**
//  * A reusable pagination component for data tables.
//  * @param {object} props
//  * @param {number} props.page - The current page number (1-based).
//  * @param {number} props.pages - The total number of pages.
//  * @param {number} props.limit - The number of items per page.
//  * @param {number} props.total - The total number of items.
//  * @param {function(number): void} props.onPageChange - Callback function when a page is changed.
//  */
// export const Pagination = ({ page, pages, limit, total, onPageChange }) => {
//   if (total === 0) {
//     return null; // Don't render anything if there are no items
//   }

//   const from = (page - 1) * limit + 1;
//   const to = Math.min(page * limit, total);

//   return (
//     <div className="flex items-center justify-between px-2 py-3 text-sm text-slate-400 border-t border-slate-700">
//       <div className="flex-1">
//         Showing {from} to {to} of {total} results
//       </div>
//       <div className="flex items-center space-x-2">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(1)}
//           disabled={page === 1}
//         >
//           <ChevronsLeft className="h-4 w-4" />
//         </Button>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(page - 1)}
//           disabled={page === 1}
//         >
//           <ChevronLeft className="h-4 w-4" />
//           Previous
//         </Button>
//         <div className="px-2">
//           Page {page} of {pages}
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(page + 1)}
//           disabled={page === pages}
//         >
//           Next
//           <ChevronRight className="h-4 w-4" />
//         </Button>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(pages)}
//           disabled={page === pages}
//         >
//           <ChevronsRight className="h-4 w-4" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Pagination;

import React from "react";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A reusable pagination control component.
 * It is completely controlled by its parent component.
 * @param {object} props
 * @param {object} props.paginationData - The pagination object from the API response.
 * @param {number} props.paginationData.currentPage - The current active page.
 * @param {number} props.paginationData.totalPages - The total number of pages.
 * @param {number} props.paginationData.total - The total number of records.
 * @param {number} props.paginationData.limit - The number of items per page.
 * @param {function(number): void} props.onPageChange - A function to call when a page change is requested.
 */
const Pagination = ({ paginationData, onPageChange }) => {
  if (!paginationData || paginationData.totalPages <= 1) {
    return null; // Don't render if there's only one page or no data
  }

  const { currentPage, totalPages, total, limit, count } = paginationData;

  const from = (currentPage - 1) * limit + 1;
  const to = from + count - 1;

  return (
    <div className="flex items-center justify-between p-4 border-t border-slate-700">
      <div className="text-sm text-slate-400">
        Showing <span className="font-medium text-slate-100">{from}</span>-
        <span className="font-medium text-slate-100">{to}</span> of{" "}
        <span className="font-medium text-slate-100">{total}</span> results
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
