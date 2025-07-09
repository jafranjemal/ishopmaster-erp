import React, { useState, useEffect, useCallback } from "react";
import { Input } from "ui-library";
import { Search } from "lucide-react";
import { tenantProductService, tenantCategoryService } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";
import HierarchyBrowser from "./HierarchyBrowser";
import ProductGrid from "./ProductGrid";
import HierarchyTiles from "./HierarchyTiles";

const ProductSearchPanel = ({ onAddItem, cartFocus }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [hierarchyData, setHierarchyData] = useState({ categories: [] });
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch initial data for the hierarchy browser
  useEffect(() => {
    tenantCategoryService.getAll().then((res) => {
      setHierarchyData({ categories: res.data.data.filter((c) => !c.parent) });
      //setHierarchyData({ categories: res.data.data });
    });
  }, []);

  const searchVariants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { ...filters, search: debouncedSearchTerm, limit: 50 };
      const res = await tenantProductService.getAllVariants(params);
      setResults(res.data.data);
    } catch (error) {
      // handle error
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, filters]);

  useEffect(() => {
    searchVariants();
  }, [searchVariants]);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Search by Name, SKU, or Serial Number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="!pl-[35px]" />
      </div>

      {/* <HierarchyBrowser data={hierarchyData} onFilterChange={setFilters} /> */}
      {/* <HierarchyTiles categories={hierarchyData.categories} onFilterChange={setFilters} /> */}
      <div className="flex-grow overflow-y-auto pt-2 pr-2">{isLoading ? <p className="text-center">Searching...</p> : <ProductGrid items={results} onAddItem={onAddItem} cartFocus={cartFocus} />}</div>
    </div>
  );
};
export default ProductSearchPanel;
