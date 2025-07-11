import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import * as Tabs from "@radix-ui/react-tabs";
import { tenantGrnService, tenantLabelTemplateService, tenantPrintService } from "../../services/api";
import { Button, Card, CardContent, CardHeader, CardTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label } from "ui-library";
import { Printer, QrCode, Barcode, HelpCircle } from "lucide-react";
import PrintQueue from "../../components/inventory/printing/PrintQueue";
import AddFromGRN from "../../components/inventory/printing/AddFromGRN";
import AddAdhoc from "../../components/inventory/printing/AddAdhoc";
import SerialSelectorModal from "../../components/inventory/printing/SerialSelectorModal";

const PrintHubPage = () => {
  const [printMode, setPrintMode] = useState(null); // 'barcode' or 'qrcode'
  const [labelTemplates, setLabelTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [grns, setGrns] = useState([]);
  const [printQueue, setPrintQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const [serialModalState, setSerialModalState] = useState({
    isOpen: false,
    item: null,
  });

  // Fetch initial data for dropdowns
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      tenantLabelTemplateService.getAll(),
      tenantGrnService.getAll({ limit: 50, status: "fully_received" }), // Get recent 50 received GRNs
    ])
      .then(([templatesRes, grnsRes]) => {
        setLabelTemplates(templatesRes.data.data);
        setGrns(grnsRes.data.data);
      })
      .catch(() => toast.error("Failed to load initial data for Print Hub."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddToQueue = useCallback(
    (itemsToAdd) => {
      const newItems = itemsToAdd
        .map((item) => ({
          ...item,
          key: `${item.productVariantId}-${item.batchNumber || (item.serials && item.serials[0]) || Date.now()}`,
        }))
        .filter((newItem) => !printQueue.some((qItem) => qItem.key === newItem.key));
      setPrintQueue((prev) => [...prev, ...newItems]);
    },
    [printQueue]
  );

  const handleAdhocAdd = useCallback((itemToAdd) => handleAddToQueue([itemToAdd]), [handleAddToQueue]);

  const handleQueueQuantityChange = useCallback((key, newQuantity) => {
    setPrintQueue((q) => q.map((i) => (i.key === key ? { ...i, quantity: newQuantity } : i)));
  }, []);

  const handleRemoveFromQueue = useCallback((key) => {
    setPrintQueue((q) => q.filter((item) => item.key !== key));
  }, []);

  const handleEditSerials = useCallback((item) => {
    setSerialModalState({ isOpen: true, item: item });
  }, []);

  const handleSerialsConfirm = useCallback(
    (selectedSerials) => {
      setPrintQueue((q) =>
        q.map((i) =>
          i.key === serialModalState.item.key
            ? {
                ...i,
                serials: selectedSerials,
                quantity: selectedSerials.length,
              }
            : i
        )
      );
      setSerialModalState({ isOpen: false, item: null });
    },
    [serialModalState.item]
  );

  const handlePrint = async () => {
    if (!selectedTemplateId || printQueue.length === 0) {
      return toast.error("Please select a template and add items to the queue.");
    }
    setIsPrinting(true);
    const printToast = toast.loading("Generating print document...");

    try {
      // Prepare the payload for the API
      const itemsToPrint = printQueue.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.isSerialized ? item.serials.length : item.quantity,
        serials: item.isSerialized ? item.serials : undefined,
      }));

      const res = await tenantPrintService.generateLabels(selectedTemplateId, itemsToPrint);

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow popups for this site to print.", {
          id: printToast,
        });
        setIsPrinting(false);
        return;
      }
      printWindow.document.write(res.data);
      printWindow.document.close();
      // Delay print command slightly to allow assets to load
      setTimeout(() => {
        printWindow.print();
        toast.success("Print document generated!", { id: printToast });
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to generate labels.", {
        id: printToast,
      });
    } finally {
      setIsPrinting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading Print Hub...</div>;

  if (!printMode) {
    return (
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold mb-4">Print Hub</h1>
        <p className="text-slate-400 mb-8">What would you like to print today?</p>
        <div className="flex justify-center gap-8">
          <Button onClick={() => setPrintMode("barcode")} className="h-24 w-48 text-lg flex-col gap-2">
            <Barcode className="h-8 w-8" /> Barcodes
          </Button>
          <Button onClick={() => setPrintMode("qrcode")} className="h-24 w-48 text-lg flex-col gap-2">
            <QrCode className="h-8 w-8" /> QR Codes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Print Hub:{" "}
          <span onClick={() => setPrintMode(null)} className="capitalize text-indigo-400">
            {printMode}s
          </span>
        </h1>
        <Button onClick={handlePrint} disabled={isPrinting || !selectedTemplateId || printQueue.length === 0}>
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? "Generating..." : "Generate & Print"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Label>1. Select Label Template</Label>
          <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a label design..." />
            </SelectTrigger>
            <SelectContent>
              {labelTemplates.map((t) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.name} ({t.labelWidth}mm x {t.labelHeight}mm)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs.Root defaultValue="grn" className="w-full">
        <Tabs.List className="grid w-full grid-cols-2">
          <Tabs.Trigger value="grn" className="ui-tabs-trigger">
            Add from Received Goods
          </Tabs.Trigger>
          <Tabs.Trigger value="adhoc" className="ui-tabs-trigger">
            Add Ad-hoc Item
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="grn" className="p-4 border border-t-0 border-slate-700 rounded-b-md">
          <AddFromGRN grns={grns} onAddItems={handleAddToQueue} />
        </Tabs.Content>
        <Tabs.Content value="adhoc" className="p-4 border border-t-0 border-slate-700 rounded-b-md">
          <AddAdhoc onAddItem={handleAdhocAdd} />
        </Tabs.Content>
      </Tabs.Root>

      <Card>
        <CardHeader>
          <CardTitle>Print Queue ({printQueue.length} items)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PrintQueue
            queue={printQueue}
            onQuantityChange={handleQueueQuantityChange}
            onRemoveItem={handleRemoveFromQueue}
            onEditSerials={handleEditSerials}
          />
        </CardContent>
      </Card>

      {serialModalState.isOpen && (
        <SerialSelectorModal
          isOpen={true}
          onClose={() => setSerialModalState({ isOpen: false, item: null })}
          onConfirm={handleSerialsConfirm}
          productVariantId={serialModalState.item.productVariantId}
          branchId={serialModalState.item.branchId} // This needs to be passed in the queue item
          initialSelection={serialModalState.item.serials}
        />
      )}
    </div>
  );
};
export default PrintHubPage;
