import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  tenantPaymentService,
  tenantPaymentMethodService,
} from "../../services/api";
import { Card, CardContent, FilterBar, Pagination } from "ui-library";
import PaymentList from "../../components/accounting/PaymentList";

const PaymentsListPage = () => {
  const [payments, setPayments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({
    direction: "",
    paymentMethodId: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 15, ...filters };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]); // Clean empty filters

      const response = await tenantPaymentService.getAll(params);
      setPayments(response.data.data);
      setPaginationData(response.data.pagination);
    } catch (error) {
      toast.error("Failed to fetch payments.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    // Fetch payment methods once for the filter dropdown
    tenantPaymentMethodService
      .getAll()
      .then((res) => setPaymentMethods(res.data.data));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const handleApplyFilters = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchData();
    }
  };
  const handleClearFilters = () => {
    setFilters({ direction: "", paymentMethodId: "" });
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Payment Transactions</h1>
      <FilterBar
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      >
        <select
          name="direction"
          value={filters.direction}
          onChange={(e) => handleFilterChange("direction", e.target.value)}
          className="ui-input"
        >
          <option value="">All Directions</option>
          <option value="inflow">Inflow</option>
          <option value="outflow">Outflow</option>
        </select>
        <select
          name="paymentMethodId"
          value={filters.paymentMethodId}
          onChange={(e) =>
            handleFilterChange("paymentMethodId", e.target.value)
          }
          className="ui-input"
        >
          <option value="">All Methods</option>
          {paymentMethods.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </FilterBar>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center">Loading...</p>
          ) : (
            <PaymentList payments={payments} />
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
export default PaymentsListPage;
