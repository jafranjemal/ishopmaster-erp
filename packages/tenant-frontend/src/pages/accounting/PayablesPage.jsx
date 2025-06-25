import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantGrnService } from "../../services/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "ui-library";
import AwaitingInvoiceList from "../../components/accounting/AwaitingInvoiceList";
import { FilePlus2 } from "lucide-react";

const PayablesPage = () => {
  const [awaitingGrns, setAwaitingGrns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrnIds, setSelectedGrnIds] = useState([]);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantGrnService.getAwaitingInvoice();
      setAwaitingGrns(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch items awaiting invoice.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateInvoice = () => {
    if (selectedGrnIds.length === 0) return;
    const queryParams = new URLSearchParams({
      grnIds: selectedGrnIds.join(","),
    });
    navigate(`/accounting/payables/reconcile?${queryParams.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounts Payable</h1>
          <p className="mt-1 text-slate-400">
            Manage incoming supplier bills and reconcile payments.
          </p>
        </div>
        <Button
          onClick={handleCreateInvoice}
          disabled={selectedGrnIds.length === 0}
        >
          <FilePlus2 className="mr-2 h-4 w-4" />
          Create Invoice for Selected
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Goods Received, Awaiting Invoice</CardTitle>
          <CardDescription>
            Select one or more deliveries from the same supplier to reconcile
            against a single bill.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="p-8 text-center">Loading work queue...</p>
          ) : (
            <AwaitingInvoiceList
              grns={awaitingGrns}
              selectedGrnIds={selectedGrnIds}
              onSelectionChange={setSelectedGrnIds}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayablesPage;
