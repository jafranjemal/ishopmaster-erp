import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button } from "ui-library";
import { tenantStockService } from "../../services/api";
import { toast } from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import useAuth from "../../context/useAuth";

/**
 * A modal for selecting a specific stock batch for a non-serialized item.
 */
const SelectBatchModal = ({ isOpen, onClose, onSelectBatch, ProductVariants, branchId }) => {
  const [lots, setLots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formatCurrency } = useAuth();

  const fetchLots = useCallback(async () => {
    if (!isOpen || !ProductVariants?._id || !branchId) return;

    setIsLoading(true);
    try {
      const response = await tenantStockService.getLotsForVariant(ProductVariants._id, branchId);
      const availableLots = response.data.data;
      setLots(availableLots);

      // Smart Auto-Selection: If only one lot exists, select it automatically.
      if (availableLots.length === 1) {
        handleSelect(availableLots[0]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch available stock batches.");
      onClose(); // Close if there's an error
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, ProductVariants?._id, branchId]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const handleSelect = (lot) => {
    const selection = {
      inventoryLotId: lot._id,
      // Use the batch-specific price if it exists, otherwise fall back to the variant's default price
      sellingPrice: lot.sellingPriceInBaseCurrency || ProductVariants.defaultSellingPrice,
    };
    onSelectBatch(selection);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Select Batch for: ${ProductVariants?.variantName}`}>
      <div className="space-y-4">
        <p className="text-sm text-slate-400">This item is available in multiple batches. Please select which one to sell from.</p>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <LoaderCircle className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto border border-slate-700 rounded-lg divide-y divide-slate-700">
            {lots.map((lot) => (
              <div key={lot._id} onClick={() => handleSelect(lot)} className="p-4 hover:bg-slate-700/50 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    Batch: <span className="font-mono">{lot.batchNumber || "Default"}</span>
                  </div>
                  <div className="font-bold text-lg font-mono">
                    {formatCurrency(lot.sellingPriceInBaseCurrency || ProductVariants.defaultSellingPrice)}
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {lot.quantityInStock} unit(s) available
                  {lot.sellingPriceInBaseCurrency && (
                    <span className="ml-2 px-2 py-0.5 bg-indigo-600/30 text-indigo-300 rounded-full">Special Price</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SelectBatchModal;
