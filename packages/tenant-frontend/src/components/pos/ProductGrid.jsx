import React, { useState, useEffect } from "react";
import { cn } from "ui-library/lib/utils";
import useAuth from "../../context/useAuth";
import { ImageIcon, PackageX } from "lucide-react";

// The ProductImage component is well-designed and requires no changes.
const ProductImage = ({ item }) => {
  const [hasError, setHasError] = useState(false);
  const imageUrl = item.images?.[0]?.url;

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  if (hasError || !imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-t-lg bg-slate-800">
        <ImageIcon className="h-8 w-8 text-slate-500" />
      </div>
    );
  }

  return <img src={imageUrl} alt={item.variantName} className="h-full w-full object-cover rounded-t-lg" onError={() => setHasError(true)} />;
};

// The refactored and production-ready ProductGrid component.
const ProductGrid = ({ items, onAddItem, cartFocus = false }) => {
  const { formatCurrency } = useAuth();

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <PackageX className="h-16 w-16" />
        <p className="mt-4 font-semibold">No products found</p>
        <p className="text-sm">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        cartFocus
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3"
          : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 2xl:grid-cols-8 gap-3"
      )}
    >
      {items.map((item) => {
        const isOutOfStock = !item.quantityInStock || item.quantityInStock <= 0;

        let stockBadgeColor = "bg-green-600/90";
        if (item.quantityInStock <= 10) stockBadgeColor = "bg-amber-500/90";
        if (item.quantityInStock <= 3) stockBadgeColor = "bg-red-600/90";
        if (isOutOfStock) stockBadgeColor = "bg-slate-600/90";

        return (
          <div
            key={item._id}
            onClick={!isOutOfStock ? () => onAddItem(item) : undefined}
            role="button"
            tabIndex={isOutOfStock ? -1 : 0}
            aria-label={`Add ${item.variantName} to cart`}
            className={cn(
              "group relative flex flex-col justify-between bg-slate-700/80 rounded-lg transition-all duration-150 overflow-hidden shadow-sm hover:shadow-lg",
              // The aspect-ratio is key for a consistent, clean grid without fixed sizes.
              cartFocus ? "aspect-[4/5]" : "aspect-[5/5]",
              isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:ring-2 hover:ring-indigo-500"
            )}
          >
            {/* Stock Quantity Badge */}
            <div
              className={cn("absolute top-1.5 right-1.5 z-10 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow", stockBadgeColor)}
            >
              {item.quantityInStock || 0}
            </div>

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <PackageX className="h-8 w-8 text-red-400" />
                <p className="text-xs font-bold text-red-400 mt-1">Out of Stock</p>
              </div>
            )}

            {/* Product Image */}
            <div className={cn(cartFocus ? "h-[40%] w-full flex-shrink-0" : "h-[60%] w-full flex-shrink-0")}>
              <ProductImage item={item} />
            </div>

            {/* Product Info */}
            <div
              className={cn(
                cartFocus ? "h-[60%] flex flex-col justify-between p-2 text-center" : "h-[40%] flex flex-col justify-between p-2 text-center"
              )}
            >
              <p className="font-semibold leading-tight line-clamp-2 text-[10px] sm:text-xs md:text-sm" title={item.variantName}>
                {item.variantName}
              </p>

              <p className="font-bold text-green-400 !text-xs  mt-1">{formatCurrency(item.sellingPrice)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
