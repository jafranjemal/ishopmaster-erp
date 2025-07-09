import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Input, Checkbox, Pagination } from "ui-library";
import { tenantStockService } from "../../../services/api";
import { toast } from "react-hot-toast";
import { Search, LoaderCircle } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";

/**
 * A reusable modal for selecting specific serial numbers from available stock.
 */
const SerialSelectorModal = ({ isOpen, onClose, onConfirm, ProductVariantsId, branchId, initialSelection = [], allowMultiple = true }) => {
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState(initialSelection);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchData = useCallback(async () => {
    if (!isOpen || !ProductVariantsId || !branchId) return;
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 20, searchTerm: debouncedSearchTerm };
      const response = await tenantStockService.getAvailableSerials(ProductVariantsId, branchId, params);
      setAvailableSerials(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load serial numbers.");
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, ProductVariantsId, branchId, currentPage, debouncedSearchTerm]);

  useEffect(() => {
    // Reset selection when initialSelection changes (e.g., editing a different item)
    setSelectedSerials(initialSelection);
  }, [initialSelection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleSerial = (serialNumber) => {
    if (allowMultiple) {
      setSelectedSerials((prev) => (prev.includes(serialNumber) ? prev.filter((s) => s !== serialNumber) : [...prev, serialNumber]));
    } else {
      // If multiple selections are not allowed, just select the new one
      setSelectedSerials([serialNumber]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedSerials);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Serial Numbers" className="max-w-2xl">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by serial number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <p className="text-sm text-slate-400">{selectedSerials.length} serial(s) selected.</p>

        <div className="border border-slate-700 rounded-lg max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LoaderCircle className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              {availableSerials.map((item) => (
                <label key={item._id} className="flex items-center space-x-3 cursor-pointer p-1 rounded hover:bg-slate-700/50">
                  <Checkbox
                    id={`serial-${item._id}`}
                    checked={selectedSerials.includes(item.serialNumber)}
                    onCheckedChange={() => handleToggleSerial(item.serialNumber)}
                  />
                  <span className="font-mono text-sm">{item.serialNumber}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && <Pagination paginationData={pagination} onPageChange={setCurrentPage} />}

        <div className="pt-4 flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedSerials.length === 0}>
            Confirm Selection
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SerialSelectorModal;
