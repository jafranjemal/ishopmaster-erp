import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  tenantCustomerService,
  tenantInstallmentService,
} from "../../services/api";

// We will build these components in the next steps

import LedgerView from "../../components/accounting/LedgerView";
import { Card, CardContent, CardHeader, CardTitle } from "ui-library";
import CustomerProfileHeader from "../../components/crm/CustomerProfileHeader";
import CustomerFinancialSummary from "../../components/crm/CustomerFinancialSummary";
import InstallmentPlanList from "../../components/payments/InstallmentPlanList";
import {
  Tabs,
  List,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@radix-ui/react-tabs";

/**
 * A "smart" page component that orchestrates the entire customer profile view.
 * It fetches all data, manages state, and passes props down to dumb components.
 */
const CustomerProfilePage = () => {
  const { id } = useParams(); // Get customer ID from the URL, e.g., /crm/customers/:id

  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger] = useState({ entries: [], pagination: null });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [installmentPlans, setInstallmentPlans] = useState([]); // <-- 2. ADD NEW STATE

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch customer details and their ledger transactions in parallel for performance
      const [customerResponse, ledgerResponse, plansResponse] =
        await Promise.all([
          tenantCustomerService.getById(id), // Assuming getById exists in your service
          tenantCustomerService.getCustomerLedger(id, { page: 1, limit: 15 }),
          tenantInstallmentService.getAllForCustomer(id),
        ]);

      setInstallmentPlans(plansResponse.data.data);
      if (customerResponse.data.success) {
        setCustomer(customerResponse.data.data);
      } else {
        throw new Error("Could not fetch customer details.");
      }

      if (ledgerResponse.data.success) {
        setLedger({
          entries: ledgerResponse.data.data,
          pagination: ledgerResponse.data.pagination,
        });
      } else {
        throw new Error("Could not fetch customer ledger.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to load customer profile.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= ledger.pagination.totalPages) {
      // Refetch data for the new page
      fetchData(newPage);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading customer profile...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">Error: {error}</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center">Customer not found.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Placeholder for the header component we will build next */}
      <div className="p-4 bg-slate-800 rounded-lg">
        <CustomerProfileHeader customer={customer} />
      </div>

      {/* Placeholder for the financial summary component */}
      <div className="p-4 bg-slate-800 rounded-lg">
        <CustomerFinancialSummary
          ledgerEntries={ledger.entries}
          creditLimit={customer.creditLimit}
          ledgerAccountId={customer.ledgerAccountId._id}
        />
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="flex border-b border-slate-700">
          <TabsTrigger
            value="transactions"
            className="px-4 py-2 ui-tabs-trigger"
          >
            Transaction History
          </TabsTrigger>
          <TabsTrigger
            value="installments"
            className="px-4 py-2 ui-tabs-trigger"
          >
            Installment Plans
          </TabsTrigger>
        </TabsList>
        <div className="pt-6">
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Ledger History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <LedgerView
                  entries={ledger.entries}
                  pagination={ledger.pagination}
                  onPageChange={handlePageChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="installments">
            <Card>
              <CardHeader>
                <CardTitle>Active Installment Plans</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <InstallmentPlanList plans={installmentPlans} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && ledger.entries.length > 0 ? (
            <p className="p-4 text-center">Loading new page...</p>
          ) : (
            <LedgerView
              entries={ledger.entries}
              pagination={ledger.pagination}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card> */}
    </div>
  );
};

export default CustomerProfilePage;
