import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantStockService, tenantLocationService } from "../../services/api";
import {
  Card,
  CardContent,
  FilterBar,
  Pagination,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui-library";
import StockLevelsList from "../../components/inventory/StockLevelsList";
import StockLevelsHeader from "../../components/inventory/StockLevelsHeader"; // <-- Import the new header

const StockLevelsPage = () => {
  const [stockLevels, setStockLevels] = useState([]);
  const [branches, setBranches] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({ searchTerm: "", branchId: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null); // State for the KPI data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 25, ...filters };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      const [summaryRes, levelsRes] = await Promise.all([
        tenantStockService.getSummary(params),
        tenantStockService.getStockLevels(params),
      ]);

      setSummary(summaryRes.data.data);
      setStockLevels(levelsRes.data.data);
      setPaginationData(levelsRes.data.pagination);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch stock levels.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    // Fetch branches once for the filter dropdown
    tenantLocationService
      .getAllBranches()
      .then((res) => setBranches(res.data.data));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    if (currentPage !== 1) setCurrentPage(1);
    else fetchData();
  };

  const onBranchChange = (data) => {
    console.log("branch changed ", data);
    setFilters({
      ...filters,
      branchId: data,
    });
  };

  const handleClearFilters = () => {
    const cleared = { searchTerm: "", branchId: "" };
    if (JSON.stringify(filters) !== JSON.stringify(cleared)) {
      setFilters(cleared);
      if (currentPage !== 1) setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Control Center</h1>
        <p className="mt-1 text-slate-400">
          View and manage real-time inventory levels across all locations.
        </p>
      </div>

      {/* Render the new header component */}
      {isLoading && !summary ? (
        <p>Loading summary...</p>
      ) : (
        <StockLevelsHeader
          onBranchChange={onBranchChange}
          branches={branches}
          summary={summary}
        />
      )}

      <FilterBar
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        {/* Inject a custom branch filter dropdown */}
        <Select
          onValueChange={(value) => handleFilterChange("branchId", value)}
          value={filters.branchId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Branch..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b._id} value={b._id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <Card>
        <CardContent className="p-0">
          {isLoading && stockLevels.length === 0 ? (
            <p className="p-8 text-center">Loading stock levels...</p>
          ) : (
            <StockLevelsList stockLevels={stockLevels} />
          )}
          {paginationData && (
            <Pagination
              paginationData={paginationData}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockLevelsPage;
