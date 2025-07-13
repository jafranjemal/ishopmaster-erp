import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantPurchaseOrderService } from "../../services/api";
import { ArrowLeft } from "lucide-react";

import PurchaseOrderDetailView from "../../components/procurement/PurchaseOrderDetailView";
import GoodsReceivingForm from "../../components/procurement/GoodsReceivingForm";
import PrintModal from "../../components/inventory/printing/PrintModal"; // <-- 1. IMPORT NEW COMPONENT

const PurchaseOrderDetailPage = () => {
  const { id: poId } = useParams();

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false); // <-- 2. ADD NEW STATE
  const [itemsToPrint, setItemsToPrint] = useState([]);

  const fetchData = useCallback(async () => {
    if (!poId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await tenantPurchaseOrderService.getById(poId);
      if (response.data.success) {
        setPurchaseOrder(response.data.data);
      } else {
        throw new Error("Could not fetch purchase order details.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to load purchase order.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [poId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirmReceipt = async (receivedData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantPurchaseOrderService.receiveGoods(poId, receivedData), {
        loading: "Processing receipt...",
        success: "Goods received and stock updated successfully!",
        error: (err) => err.response?.data?.error || "Failed to process receipt.",
      });
      // After success, refetch the PO data to show its updated status
      await fetchData();

      const printQueueItems = receivedData.receivedItems.map((item) => {
        const poItem = purchaseOrder.items.find((pi) => pi.ProductVariantId._id === item.ProductVariantId);
        return {
          ProductVariantId: item.ProductVariantId,
          variantName: poItem.description,
          sku: poItem.ProductVariantId.sku,
          quantity: item.quantityReceived,
          isSerialized: poItem.ProductVariantId.templateId?.type === "serialized",
          serials: item.serials || [],
          batchNumber: purchaseOrder.poNumber,
        };
      });
      setItemsToPrint(printQueueItems);
      setIsPrintModalOpen(true);
    } catch (error) {
      console.error("Receipt failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Purchase Order...</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {error}</div>;
  if (!purchaseOrder) return <div className="p-8 text-center">Purchase Order not found.</div>;

  const canReceiveGoods = !["fully_received", "cancelled"].includes(purchaseOrder.status);

  return (
    <div className="space-y-8">
      <Link to="/procurement/po" className="flex items-center text-sm text-indigo-400 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all Purchase Orders
      </Link>

      {/* Render the static detail view */}
      <PurchaseOrderDetailView purchaseOrder={purchaseOrder} />

      {/* Conditionally render the receiving form */}
      {canReceiveGoods && (
        <GoodsReceivingForm purchaseOrder={purchaseOrder} onReceive={handleConfirmReceipt} isSaving={isSaving} />
      )}

      <PrintModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} itemsToPrint={itemsToPrint} />
    </div>
  );
};

export default PurchaseOrderDetailPage;
