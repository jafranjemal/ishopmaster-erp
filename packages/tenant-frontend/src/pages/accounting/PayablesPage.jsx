import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantPurchaseOrderService } from "../../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "ui-library";
import AwaitingInvoiceList from "../../components/accounting/AwaitingInvoiceList";

const PayablesPage = () => {
  const [awaitingInvoices, setAwaitingInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantPurchaseOrderService.getPOsAwaitingInvoice();
      setAwaitingInvoices(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch purchase orders awaiting invoice.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Accounts Payable</h1>
        <p className="mt-1 text-slate-400">
          Manage incoming supplier bills and reconcile payments.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders Awaiting Invoice</CardTitle>
          <CardDescription>
            These are orders where goods have been received but the final
            supplier bill has not yet been entered.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center">Loading work queue...</p>
          ) : (
            <AwaitingInvoiceList purchaseOrders={awaitingInvoices} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayablesPage;
