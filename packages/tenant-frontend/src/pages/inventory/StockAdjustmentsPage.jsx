import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  tenantStockService,
  tenantLocationService,
  tenantUserService,
} from "../../services/api";
import {
  Button,
  Modal,
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
import StockAdjustmentForm from "../../components/inventory/StockAdjustmentForm";
import { PlusCircle } from "lucide-react";

const StockAdjustmentsPage = () => {
  const [history, setHistory] = useState([]);
  const [prereqData, setPrereqData] = useState({ branches: [], users: [] });
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({ branchId: "", userId: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 20, ...filters };
      const [historyRes, branchesRes, usersRes] = await Promise.all([
        tenantStockService.getAdjustmentHistory(params),
        tenantLocationService.getAllBranches(),
        tenantUserService.getAll(),
      ]);
      setHistory(historyRes.data.data);
      setPaginationData(historyRes.data.pagination);
      setPrereqData({
        branches: branchesRes.data.data,
        users: usersRes.data.data,
      });
    } catch (error) {
      toast.error("Failed to load adjustment history.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveAdjustment = async (payload) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantStockService.createAdjustment(payload), {
        /*...*/
      });
      fetchData(); // Refresh the history list
      setIsModalOpen(false);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // ... filter and pagination handlers ...

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
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Adjustments</h1>
          <p className="mt-1 text-slate-400">
            Log manual inventory changes and view the complete audit trail.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Adjustment
        </Button>
      </div>
      <FilterBar filterValues={filters} /*...*/>
        <Select
          onValueChange={(val) => handleFilterChange("branchId", val)}
          value={filters.branchId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Branch..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Branches</SelectItem>
            {prereqData.branches.map((b) => (
              <SelectItem key={b._id} value={b._id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(val) => handleFilterChange("userId", val)}
          value={filters.userId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by User..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Users</SelectItem>
            {prereqData.users.map((u) => (
              <SelectItem key={u._id} value={u._id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p>Loading history...</p>
          ) : (
            <StockAdjustmentHistoryList adjustments={history} />
          )}
          {paginationData && (
            <Pagination
              paginationData={paginationData}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Stock Adjustment"
      >
        <StockAdjustmentForm
          branches={prereqData.branches}
          onSave={handleSaveAdjustment}
          onCancel={() => setIsModalOpen(false)}
          isSaving={isSaving}
        />
      </Modal>
    </div>
  );
};
export default StockAdjustmentsPage;
