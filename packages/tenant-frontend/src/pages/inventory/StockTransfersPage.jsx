import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import * as Tabs from "@radix-ui/react-tabs";
import { tenantTransferService, tenantLocationService } from "../../services/api";
import { Button, Modal, Card, CardContent } from "ui-library";
import { PlusCircle } from "lucide-react";
import TransferList from "../../components/inventory/transfers/TransferList";
import StockTransferForm from "../../components/inventory/transfers/StockTransferForm";
import SerialSelectorModal from "../../components/inventory/printing/SerialSelectorModal";

const StockTransfersPage = () => {
  const [allTransfers, setAllTransfers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialFormState = { fromBranchId: "", toBranchId: "", items: [], notes: "" };
  const [formData, setFormData] = useState(initialFormState);
  const [serialModalState, setSerialModalState] = useState({
    isOpen: false,
    itemKey: null,
    variantId: null,
    initialSelection: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [transfersRes, branchesRes] = await Promise.all([
        tenantTransferService.getAll(),
        tenantLocationService.getAllBranches(),
      ]);
      setAllTransfers(transfersRes.data.data);
      setBranches(branchesRes.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load transfer data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantTransferService.create(formData), {
        loading: "Creating transfer order...",
        success: "Transfer order created!",
        error: "Failed to create transfer.",
      });
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.log(err);
      /* handled by toast */
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSerials = (item) => {
    setSerialModalState({
      isOpen: true,
      itemKey: item.key,
      variantId: item.ProductVariantId,
      initialSelection: item.serials || [],
    });
  };

  const handleSerialsConfirm = (selectedSerials) => {
    handleFormChange(
      "items",
      formData.items.map((item) =>
        item.key === serialModalState.itemKey ? { ...item, serials: selectedSerials } : item
      )
    );
    setSerialModalState({ isOpen: false, itemKey: null, variantId: null, initialSelection: [] });
  };

  const filteredTransfers = useMemo(
    () => ({
      pending: allTransfers.filter((t) => t.status === "pending"),
      in_transit: allTransfers.filter((t) => t.status === "in_transit"),
      completed: allTransfers.filter((t) => t.status === "completed"),
    }),
    [allTransfers]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Transfers</h1>
          <p className="mt-1 text-slate-400">Manage inventory movements between your branches and warehouses.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Transfer Order
        </Button>
      </div>

      <Tabs.Root defaultValue="pending">
        <Tabs.List className="flex border-b border-slate-700">
          <Tabs.Trigger value="pending" className="px-4 py-2 ui-tabs-trigger">
            Pending ({filteredTransfers.pending.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="in_transit" className="px-4 py-2 ui-tabs-trigger">
            In Transit ({filteredTransfers.in_transit.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="completed" className="px-4 py-2 ui-tabs-trigger">
            Completed ({filteredTransfers.completed.length})
          </Tabs.Trigger>
        </Tabs.List>
        <div className="pt-6">
          <Tabs.Content value="pending">
            <Card>
              <CardContent className="p-0">
                {isLoading ? <p>Loading...</p> : <TransferList transfers={filteredTransfers.pending} />}
              </CardContent>
            </Card>
          </Tabs.Content>
          <Tabs.Content value="in_transit">
            <Card>
              <CardContent className="p-0">
                {isLoading ? <p>Loading...</p> : <TransferList transfers={filteredTransfers.in_transit} />}
              </CardContent>
            </Card>
          </Tabs.Content>
          <Tabs.Content value="completed">
            <Card>
              <CardContent className="p-0">
                {isLoading ? <p>Loading...</p> : <TransferList transfers={filteredTransfers.completed} />}
              </CardContent>
            </Card>
          </Tabs.Content>
        </div>
      </Tabs.Root>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Stock Transfer Order">
        <StockTransferForm
          formData={formData}
          onFormChange={handleFormChange}
          branches={branches}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          isSaving={isSaving}
          onEditSerials={handleEditSerials}
        />
      </Modal>
      {serialModalState.isOpen && (
        <SerialSelectorModal
          isOpen={true}
          onClose={() => setSerialModalState({ isOpen: false, itemKey: null, variantId: null })}
          onConfirm={handleSerialsConfirm} // This needs to be passed to the form to update its internal state
          ProductVariantId={serialModalState.variantId}
          branchId={formData.fromBranchId}
          initialSelection={serialModalState.initialSelection}
        />
      )}
    </div>
  );
};

export default StockTransfersPage;
