import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Input, Pagination, Checkbox } from "ui-library";
import { tenantStockService } from "../../../services/api";
import { toast } from "react-hot-toast";
import { Library } from "lucide-react";

/**
 * A modal for selecting specific serial numbers from available stock.
 */
const SerialSelectorModal = ({
  isOpen,
  onClose,
  onConfirm,
  productVariantId,
  branchId,
  initialSelection = [],
}) => {
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState(initialSelection);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isOpen || !productVariantId || !branchId) return;
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 20, searchTerm };
      const response = await tenantStockService.getAvailableSerials(
        productVariantId,
        branchId,
        params
      );
      setAvailableSerials(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load serial numbers.");
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, productVariantId, branchId, currentPage, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleSerial = (serialNumber) => {
    setSelectedSerials((prev) =>
      prev.includes(serialNumber)
        ? prev.filter((s) => s !== serialNumber)
        : [...prev, serialNumber]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageSerials = availableSerials.map((s) => s.serialNumber);
    const newSelected = [...new Set([...selectedSerials, ...pageSerials])];
    setSelectedSerials(newSelected);
  };

  const handleDeselectAllOnPage = () => {
    const pageSerials = availableSerials.map((s) => s.serialNumber);
    const newSelected = selectedSerials.filter((s) => !pageSerials.includes(s));
    setSelectedSerials(newSelected);
  };

  const handleConfirm = () => {
    onConfirm(selectedSerials);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Serial Numbers"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Search Input */}
        <div className="flex justify-between items-center">
          <Input
            placeholder="Search serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Selection Toolbar */}
        <div className="flex justify-between items-center text-sm text-slate-400 border-b border-slate-700 pb-2">
          <span>{selectedSerials.length} serial(s) selected</span>
          <div className="space-x-2">
            <Button variant="ghost" size="sm" onClick={handleDeselectAllOnPage}>
              Deselect Page
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSelectAllOnPage}>
              Select Page
            </Button>
          </div>
        </div>

        {/* Serial List */}
        <div className="border border-slate-700 rounded-md max-h-80 overflow-y-auto bg-slate-900">
          {isLoading ? (
            <p className="p-6 text-center text-slate-400">Loading serials...</p>
          ) : (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {!availableSerials || availableSerials.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <Library className="mx-auto h-12 w-12 opacity-50" />
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    No Serials Available
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No serial numbers found in stock. Please receive inventory
                    through a GRN to make them available for printing.
                  </p>
                </div>
              ) : (
                availableSerials.map((item) => (
                  <label
                    key={item._id}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-800 transition"
                  >
                    <Checkbox
                      id={`serial-${item._id}`}
                      checked={selectedSerials.includes(item.serialNumber)}
                      onCheckedChange={() =>
                        handleToggleSerial(item.serialNumber)
                      }
                    />
                    <span className="font-mono text-sm text-white">
                      {item.serialNumber}
                    </span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="pt-2">
            <Pagination
              paginationData={pagination}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedSerials.length === 0}
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SerialSelectorModal;
