import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantSupplierService } from "../../services/api";
import SupplierProfileHeader from "../../components/procurement/SupplierProfileHeader";
import SupplierFinancialSummary from "../../components/procurement/SupplierFinancialSummary";
import LedgerView from "../../components/accounting/LedgerView";
import { Card, CardContent, CardHeader, CardTitle } from "ui-library";

const SupplierProfilePage = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [ledger, setLedger] = useState({ entries: [], pagination: null });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);
        const [supplierRes, ledgerRes] = await Promise.all([
          page === 1
            ? tenantSupplierService.getById(id)
            : Promise.resolve(null),
          tenantSupplierService.getSupplierLedger(id, { page, limit: 15 }),
        ]);
        if (supplierRes) setSupplier(supplierRes.data.data);
        setLedger({
          entries: ledgerRes.data.data,
          pagination: ledgerRes.data.pagination,
        });
      } catch (error) {
        console.error("Error fetching supplier data:", error);
        toast.error("Failed to load supplier profile.");
      } finally {
        setIsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= ledger.pagination.totalPages) {
      fetchData(newPage);
    }
  };

  if (isLoading && !supplier)
    return <p className="p-8 text-center">Loading supplier profile...</p>;
  if (!supplier) return <p className="p-8 text-center">Supplier not found.</p>;

  return (
    <div className="space-y-8">
      <div className="p-4 bg-slate-800 rounded-lg">
        <SupplierProfileHeader supplier={supplier} />
      </div>
      <SupplierFinancialSummary
        ledgerEntries={ledger.entries}
        ledgerAccountId={supplier.ledgerAccountId._id}
      />
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <LedgerView
            entries={ledger.entries}
            pagination={ledger.pagination}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierProfilePage;
