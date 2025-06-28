import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantGrnService, tenantSupplierService } from "../../services/api";
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
import GoodsReceiptNoteList from "../../components/procurement/GoodsReceiptNoteList";

const GoodsReceiptsPage = () => {
  const [grns, setGrns] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({ searchTerm: "", supplierId: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 15, ...filters };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);

      const [grnsRes, suppliersRes] = await Promise.all([
        tenantGrnService.getAll(params),
        // Fetch suppliers only on first load for the filter dropdown
        currentPage === 1 && filters.supplierId === ""
          ? tenantSupplierService.getAll()
          : Promise.resolve({ data: { data: suppliers } }),
      ]);

      setGrns(grnsRes.data.data);
      setPaginationData(grnsRes.data.pagination);
      if (suppliersRes.data.data) setSuppliers(suppliersRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch goods receipts.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ... filter and pagination handlers ...

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Goods Receipt History</h1>
      {/* <FilterBar filterValues={filters}>
                <Select onValueChange={(val) => handleFilterChange('supplierId', val)} value={filters.supplierId}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by Supplier..." /></SelectTrigger>
                    <SelectContent><SelectItem value="">All Suppliers</SelectItem>{suppliers.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
            </FilterBar> */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center">Loading...</p>
          ) : (
            <GoodsReceiptNoteList grns={grns} />
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
export default GoodsReceiptsPage;
