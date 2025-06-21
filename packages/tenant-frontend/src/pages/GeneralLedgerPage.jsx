import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

import { Input, Button } from "ui-library";
import { tenantAccountingService } from "../services/api";
import LedgerView from "../components/accounting/LedgerView";

/**
 * The main "smart" page for viewing the General Ledger.
 * It handles fetching paginated data and managing filters.
 */
const GeneralLedgerPage = () => {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 25,
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchLedgerEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantAccountingService.getLedgerEntries(filters);
      setEntries(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch ledger entries.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLedgerEntries();
  }, [fetchLedgerEntries]);

  const handlePageChange = (newPage) => {
    setFilters((prevFilters) => ({ ...prevFilters, page: newPage }));
  };

  const handleFilterChange = (e) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.value,
    }));
  };

  const applyFilters = () => {
    setFilters((prevFilters) => ({ ...prevFilters, page: 1 })); // Reset to page 1 on new filter
    fetchLedgerEntries();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">General Ledger</h1>
        <p className="mt-1 text-slate-400">
          A complete, immutable audit trail of all financial transactions.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center space-x-4 p-4 bg-slate-800 rounded-lg">
        <Input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <Input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        <Button onClick={applyFilters}>Apply Filter</Button>
      </div>

      {isLoading ? (
        <p>Loading entries...</p>
      ) : (
        <LedgerView
          entries={entries}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default GeneralLedgerPage;
