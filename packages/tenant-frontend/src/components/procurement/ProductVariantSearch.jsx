import React, { useState, useCallback } from "react";
import { Input } from "ui-library";
import { tenantProductService } from "../../services/api";
import { debounce } from "lodash";

const ProductVariantSearch = ({ onProductSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = async (term) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await tenantProductService.searchVariants(term);
      setResults(response.data.data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchResults, 300), []);

  const handleChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedFetch(term);
  };

  const handleSelect = (variant) => {
    onProductSelect(variant);
    setSearchTerm("");
    setResults([]);
  };

  return (
    <div className="relative">
      <Input placeholder="Search by SKU or Product Name to add items..." value={searchTerm} onChange={handleChange} />
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul>
            {results.map((variant) => (
              <li key={variant._id} className="p-3 hover:bg-indigo-600/20 cursor-pointer" onClick={() => handleSelect(variant)}>
                <p className="font-medium">{variant.variantName}</p>
                <p className="text-sm text-slate-400">SKU: {variant.sku}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSearch;
