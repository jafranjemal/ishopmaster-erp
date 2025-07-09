import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "ui-library";
import { Search, LoaderCircle } from "lucide-react";
import { tenantProductService } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";
import useAuth from "../../context/useAuth";

const UniversalSearch = ({ onAddItem, onJobFound }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchContainerRef = useRef(null);
  const { formatCurrency } = useAuth();

  const searchProducts = useCallback(async () => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      // This API call is already designed to search by name, SKU, or serial number
      const res = await tenantProductService.getAllVariants({ search: debouncedQuery, limit: 10 });
      setResults(res.data.data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  // Handle clicks outside the component to close the results dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (variant) => {
    onAddItem(variant, "sale_item");
    setQuery("");
    setResults([]);
    setIsFocused(false);
  };

  return (
    <div className="relative" ref={searchContainerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Enter item name, SKU, or scan barcode..."
          className="pl-10 h-12 text-base"
        />
      </div>

      {isFocused && query.length > 1 && (
        <div className="absolute z-30 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-slate-400 flex items-center justify-center">
              <LoaderCircle className="h-5 w-5 animate-spin mr-2" /> Searching...
            </div>
          )}
          {!isLoading && results.length === 0 && <div className="p-4 text-center text-slate-500">No products found.</div>}
          {!isLoading &&
            results.map((variant) => (
              <div
                key={variant._id}
                onClick={() => handleSelect(variant)}
                className="flex items-center justify-between p-3 hover:bg-indigo-600/20 cursor-pointer border-b border-slate-700 last:border-b-0"
              >
                <div>
                  <p className="font-semibold">{variant.variantName}</p>
                  <p className="text-sm text-slate-400 font-mono">{variant.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{formatCurrency(variant.sellingPrice)}</p>
                  <p className="text-xs text-slate-500">Stock: {variant.quantityInStock}</p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;
