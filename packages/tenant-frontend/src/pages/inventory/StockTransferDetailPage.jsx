import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantTransferService } from "../../services/api";
import { ArrowLeft, Truck, CheckCircle } from "lucide-react";
import { Button, Modal } from "ui-library";
import TransferDetailView from "../../components/inventory/transfers/TransferDetailView";
import PrintModal from "../../components/inventory/printing/PrintModal";

const StockTransferDetailPage = () => {
  const { id: transferId } = useParams();
  const navigate = useNavigate();

  const [transfer, setTransfer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'dispatch' or 'receive'
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [itemsToPrint, setItemsToPrint] = useState([]);

  const fetchData = useCallback(async () => {
    if (!transferId) return;
    try {
      setIsLoading(true);
      const response = await tenantTransferService.getById(transferId);
      setTransfer(response.data.data);
    } catch (error) {
      toast.error("Failed to load transfer details.");
      navigate("/inventory/transfers");
    } finally {
      setIsLoading(false);
    }
  }, [transferId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDispatch = async () => {
    setIsActionLoading(true);
    try {
      await toast.promise(tenantTransferService.dispatch(transferId), {
        loading: "Dispatching items...",
        success: "Transfer dispatched!",
        error: "Dispatch failed.",
      });
      fetchData(); // Refresh data
    } catch (error) {
      /* handled by toast */
      console.log(error);
    } finally {
      setIsActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleReceive = async () => {
    setIsActionLoading(true);
    try {
      await toast.promise(tenantTransferService.receive(transferId), {
        loading: "Receiving items...",
        success: "Transfer completed!",
        error: "Receive failed.",
      });
      fetchData(); // Refresh data

      // 1. Prepare the precise list of items for the print job from the transfer data.
      const printQueueItems = transfer.items.map((item) => ({
        productVariantId: item.productVariantId._id,
        variantName: item.productVariantId.variantName,
        sku: item.productVariantId.sku,
        isSerialized: item.productVariantId.templateId?.type === "serialized",
        // The quantity for the print job is now correctly determined
        quantity: item.isSerialized ? item.serials.length : item.quantity,
        serials: item.isSerialized ? item.serials : [],
        batchNumber: transfer.transferId, // Use transfer ID as the batch ref
        branchId: transfer.toBranchId._id, // The destination branch
      }));

      // 2. Set the state to open the modal with this specific, correctly formatted data.
      setItemsToPrint(printQueueItems);
      setIsPrintModalOpen(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsActionLoading(false);
      setConfirmAction(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Transfer Details...</div>;
  if (!transfer) return <div className="p-8 text-center">Transfer not found.</div>;

  const renderActionButtons = () => {
    if (transfer.status === "pending") {
      return (
        <Button onClick={() => setConfirmAction("dispatch")}>
          <Truck className="mr-2 h-4 w-4" /> Dispatch Items
        </Button>
      );
    }
    if (transfer.status === "in_transit") {
      return (
        <Button onClick={() => setConfirmAction("receive")} variant="success">
          <CheckCircle className="mr-2 h-4 w-4" /> Receive Items
        </Button>
      );
    }
    return null; // No actions for completed or cancelled
  };

  return (
    <div className="space-y-6">
      <Link to="/inventory/transfers" className="flex items-center text-sm text-indigo-400 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all Stock Transfers
      </Link>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transfer Details</h1>
        <div>{renderActionButtons()}</div>
      </div>

      <TransferDetailView transfer={transfer} />

      <Modal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title={`Confirm ${confirmAction}`}>
        <p>Are you sure you want to {confirmAction} this transfer? This action will update stock levels and cannot be easily undone.</p>
        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setConfirmAction(null)}>
            Cancel
          </Button>
          <Button onClick={confirmAction === "dispatch" ? handleDispatch : handleReceive} disabled={isActionLoading}>
            {isActionLoading ? "Processing..." : `Confirm ${confirmAction}`}
          </Button>
        </div>
      </Modal>

      <PrintModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} itemsToPrint={itemsToPrint} />
    </div>
  );
};

export default StockTransferDetailPage;
