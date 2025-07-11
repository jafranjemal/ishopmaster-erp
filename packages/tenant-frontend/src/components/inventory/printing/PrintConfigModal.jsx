import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";
import SerialSelectorModal from "./SerialSelectorModal";
import { tenantLocationService, tenantProductService, tenantStockService } from "../../../services/api";
import { toast } from "react-hot-toast";

const PrintConfigModal = ({ isOpen, onClose, variant, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [isSerialSelectorOpen, setIsSerialSelectorOpen] = useState(false);
  const [isSerialized, setIsSerialized] = useState(false);

  // --- THE DEFINITIVE FIX: State for branches and selected branch ---
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  // --- END OF FIX ---

  useEffect(() => {
    // Fetch branches when the modal opens, if they haven't been fetched yet.
    if (isOpen && branches.length === 0) {
      tenantLocationService
        .getAllBranches()
        .then((res) => setBranches(res.data.data))
        .catch(() => toast.error("Could not load locations."));
    }

    // Reset state when a new variant is passed in
    if (variant) {
      setQuantity(1);
      setSelectedSerials([]);
      setSelectedBranchId(""); // Reset branch selection
      // Determine if the variant is serialized
      const checkSerialization = async () => {
        if (typeof variant.templateId === "string") {
          const templateRes = await tenantProductService.getTemplateById(variant.templateId);
          setIsSerialized(templateRes.data.data?.type === "serialized");
        } else if (variant.templateId?.type) {
          setIsSerialized(variant.templateId.type === "serialized");
        }
      };
      checkSerialization();
    }
  }, [variant, isOpen, branches.length]);

  useEffect(() => {
    const getSerials = async () => {
      if (selectedBranchId != "") {
        const stock = await tenantStockService.getAvailableSerials(variant._id, selectedBranchId, null);

        if (stock.data?.data) {
          setSelectedSerials(stock.data.data.map((x) => x.serialNumber));
        } else {
          setSelectedSerials([]);
        }
      }
    };

    if (selectedBranchId != "") getSerials();
  }, [selectedBranchId, variant, variant?._id]);

  const handleConfirm = () => {
    const itemToPrint = {
      productVariantId: variant._id,
      variantName: variant.variantName,
      sku: variant.sku,
      isSerialized,
      branchId: selectedBranchId, // Include the selected branch
      quantity: isSerialized ? selectedSerials.length : quantity,
      serials: isSerialized ? selectedSerials : [],
    };
    onConfirm(itemToPrint);
    onClose();
  };

  if (!isOpen || !variant) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Configure Print Job for: ${variant.variantName}`}>
        <div className="space-y-6">
          {/* --- THE DEFINITIVE FIX: Branch Selector --- */}
          <div>
            <Label htmlFor="branch-select">Select Stock Location</Label>
            <Select onValueChange={setSelectedBranchId} value={selectedBranchId} required>
              <SelectTrigger id="branch-select">
                <SelectValue placeholder="Choose a branch..." />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={!selectedBranchId ? "opacity-50 pointer-events-none" : ""}>
            {isSerialized ? (
              <div>
                <Label>Select Serial Numbers to Print</Label>
                <div className="p-3 mt-1 bg-slate-800 rounded-md flex justify-between items-center">
                  <p className="text-sm">{selectedSerials.length} serial(s) selected.</p>
                  <Button variant="outline" onClick={() => setIsSerialSelectorOpen(true)} disabled={!selectedBranchId}>
                    Edit Selection
                  </Button>
                </div>
                {!selectedBranchId && <p className="text-xs text-amber-400 mt-1">Please select a branch to view available serials.</p>}
              </div>
            ) : (
              <div>
                <Label htmlFor="print-quantity">Quantity to Print</Label>
                <Input
                  id="print-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={!selectedBranchId}
                />
              </div>
            )}
          </div>
          <div className="pt-4 flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedBranchId || (isSerialized ? selectedSerials.length === 0 : quantity <= 0)}>
              Add to Print Queue
            </Button>
          </div>
        </div>
      </Modal>

      {/* The nested modal for selecting serials now receives the selectedBranchId */}
      {isSerialized && (
        <SerialSelectorModal
          isOpen={isSerialSelectorOpen}
          onClose={() => setIsSerialSelectorOpen(false)}
          onConfirm={setSelectedSerials}
          productVariantId={variant._id}
          branchId={selectedBranchId} // <-- THE CRITICAL FIX
          initialSelection={selectedSerials}
        />
      )}
    </>
  );
};

export default PrintConfigModal;
