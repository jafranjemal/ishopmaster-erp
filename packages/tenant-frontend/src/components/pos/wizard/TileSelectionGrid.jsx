import React from "react";
import { Card } from "ui-library";
import { Folder, Wrench, Smartphone, Box, PackageSearch } from "lucide-react";
import useAuth from "../../../context/useAuth";

// Icon map for different item types
const ICONS = {
  category: Folder,
  device: Smartphone,
  problem: Wrench,
  product: Box,
};

/**
 * Format number to currency string (LKR)
 */
function formatCurrency(value = 0, currency = "LKR") {
  try {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  } catch {
    return `LKR ${value}`;
  }
}

/**
 * @desc Grid for selecting items (with icon + price).
 */
const TileSelectionGrid = ({ items = [], onSelect, itemType = "category", selectedIds = [] }) => {
  const Icon = ICONS[itemType] || Box;
  const { formatCurrency } = useAuth();
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <PackageSearch className="w-12 h-12 mb-4 text-slate-500" />
        <h3 className="text-lg font-semibold">No items found</h3>
        <p className="text-sm mt-1">Try a different category or add new items.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item._id);
        const displayName = item.name || item.variantName || item.baseName || "Unnamed";
        const sellingPrice = item.sellingPrice;

        return (
          <Card
            key={item._id}
            onClick={() => onSelect(item)}
            className={`
              aspect-square flex flex-col items-center justify-center text-center p-2 cursor-pointer
              transition-all duration-150
              ${
                isSelected
                  ? "bg-indigo-500 border-indigo-400 text-white"
                  : "bg-slate-700 hover:bg-indigo-600/30 hover:border-indigo-500"
              }
            `}
          >
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]?.url}
                alt={displayName}
                className="w-12 h-12 object-contain mb-2 rounded-sm shadow-sm"
              />
            ) : (
              <Icon className={`h-8 w-8 mb-2 ${isSelected ? "text-white" : "text-indigo-400"}`} />
            )}

            <p className="text-xs font-semibold leading-tight line-clamp-2">{displayName}</p>

            {/* Price display, only if defined and > 0 */}
            {typeof sellingPrice === "number" && sellingPrice > 0 ? (
              <p className={`mt-1 text-[11px] ${isSelected ? "text-indigo-100" : "text-slate-300"}`}>
                {formatCurrency(sellingPrice)}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-500 italic"></p>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TileSelectionGrid;
