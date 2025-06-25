import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantInvoiceService } from "../../services/api";
import { Card, CardContent, FilterBar, Pagination } from "ui-library";
import InvoiceList from "../../components/procurement/InvoiceList";

const InvoicesListPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({ searchTerm: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 15, ...filters };
      const response = await tenantInvoiceService.getAll(params);
      setInvoices(response.data.data);
      setPaginationData(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch supplier invoices.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ... handleFilterChange, handleApplyFilters, handleClearFilters logic here ...

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Supplier Invoices</h1>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-4">Loading...</p>
          ) : (
            <InvoiceList invoices={invoices} />
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

export default InvoicesListPage;
