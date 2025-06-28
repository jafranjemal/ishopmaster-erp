import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  tenantStockService,
  tenantLocationService,
  tenantUserService,
} from "../../services/api";
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
import StockAdjustmentHistoryList from "../../components/inventory/StockAdjustmentHistoryList";

const AdjustmentHistoryPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({
    branchId: "",
    userId: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 20, ...filters };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      const response = await tenantStockService.getAdjustmentHistory(params);
      setAdjustments(response.data.data);
      setPaginationData(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch adjustment history.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    // Fetch filter dropdown data once
    Promise.all([
      tenantLocationService.getAllBranches(),
      tenantUserService.getAll(),
    ])
      .then(([branchRes, userRes]) => {
        setBranches(branchRes.data.data);
        setUsers(userRes.data.data);
      })
      .catch(() => toast.error("Failed to load filter options."));
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

  const handleClearFilters = () => {
    const cleared = { branchId: "", userId: "", startDate: "", endDate: "" };
    if (JSON.stringify(filters) !== JSON.stringify(cleared)) {
      setFilters(cleared);
      if (currentPage !== 1) setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Adjustment History</h1>
        <p className="mt-1 text-slate-400">
          View a complete audit trail of all manual inventory adjustments.
        </p>
      </div>

      <FilterBar
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
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
        <Select
          onValueChange={(value) => handleFilterChange("userId", value)}
          value={filters.userId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by User..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u._id} value={u._id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <Card>
        <CardContent className="p-0">
          {isLoading && adjustments.length === 0 ? (
            <p className="p-8 text-center">Loading adjustment history...</p>
          ) : (
            <StockAdjustmentHistoryList adjustments={adjustments} />
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

export default AdjustmentHistoryPage;
