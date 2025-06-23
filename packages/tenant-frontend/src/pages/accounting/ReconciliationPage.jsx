import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  tenantPurchaseOrderService,
  tenantReconciliationService,
} from "../../services/api";
import { ArrowLeft } from "lucide-react";
// We will build these components in the next step
import PurchaseOrderDetailView from "../../components/procurement/PurchaseOrderDetailView";
import SupplierInvoiceForm from "../../components/accounting/SupplierInvoiceForm";

const ReconciliationPage = () => {
  const { poId } = useParams();
  const navigate = useNavigate();

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [invoiceData, setInvoiceData] = useState({
    supplierInvoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    items: [],
    fileAttachments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!poId) return;
    try {
      setIsLoading(true);
      const response = await tenantPurchaseOrderService.getById(poId);
      const po = response.data.data;
      setPurchaseOrder(po);

      // Pre-populate the invoice form with data from the PO
      setInvoiceData((prev) => ({
        ...prev,
        supplierId: po.supplierId._id,
        goodsReceiptNoteIds: [], // This would be selected from a list of GRNs in a more advanced UI
        transactionCurrency: po.transactionCurrency,
        exchangeRateToBase: po.exchangeRateToBase,
        items: po.items.map((item) => ({
          productVariantId: item.productVariantId._id,
          description: item.description,
          quantityBilled: item.quantityOrdered - item.quantityReceived, // Default to remaining quantity
          finalCostPrice: item.costPrice, // Default to expected cost
        })),
      }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to load PO details.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [poId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePostInvoice = async (finalInvoiceData) => {
    setIsSaving(true);
    const payload = {
      ...finalInvoiceData,
      purchaseOrderId: poId, // Add reference to the PO
      // In a real app, we would link to specific GRN IDs here
      goodsReceiptNoteIds: purchaseOrder.goodsReceiptNoteIds || [],
    };

    try {
      await toast.promise(tenantReconciliationService.postInvoice(payload), {
        loading: "Posting supplier invoice...",
        success: "Invoice posted and reconciled successfully!",
        error: (err) => err.response?.data?.error || "Failed to post invoice.",
      });
      navigate("/accounting/payables"); // Navigate back to the work queue on success
    } catch (err) {
      console.error("Post invoice failed:", err);
      // Error is handled by the toast
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center">Loading Reconciliation Workspace...</div>
    );
  if (error)
    return <div className="p-8 text-center text-red-400">Error: {error}</div>;
  if (!purchaseOrder)
    return <div className="p-8 text-center">Purchase Order not found.</div>;

  return (
    <div className="space-y-6">
      <Link
        to="/accounting/payables"
        className="flex items-center text-sm text-indigo-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Accounts Payable
      </Link>
      <div>
        <h1 className="text-3xl font-bold">Reconcile Supplier Invoice</h1>
        <p className="mt-1 text-slate-400">
          Match the supplier's final bill against the goods you received.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Read-only PO Details */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
            Purchase Order Details
          </h2>
          <PurchaseOrderDetailView purchaseOrder={purchaseOrder} />
        </div>

        {/* Right Column: The Invoice Entry Form */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">
            Enter Supplier Invoice
          </h2>
          {invoiceData && (
            <SupplierInvoiceForm
              purchaseOrder={purchaseOrder}
              initialInvoiceData={invoiceData}
              onPost={handlePostInvoice}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReconciliationPage;
