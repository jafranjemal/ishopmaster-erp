import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import * as Tabs from "@radix-ui/react-tabs";
import {
  tenantGrnService,
  tenantLabelTemplateService,
  tenantPrintService,
} from "../../services/api";
import {
  Button,
  Modal,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "ui-library";
import { Printer, QrCode, Barcode, Plus } from "lucide-react";
import PrintQueue from "../../components/inventory/printing/PrintQueue";
import ProductVariantSearch from "../../components/inventory/ProductVariantSearch";

const PrintHubPage = () => {
  const [printMode, setPrintMode] = useState(null); // 'barcode' or 'qrcode'
  const [labelTemplates, setLabelTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [grns, setGrns] = useState([]);
  const [selectedGrnId, setSelectedGrnId] = useState("");
  const [printQueue, setPrintQueue] = useState([]);

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      tenantLabelTemplateService.getAll(),
      tenantGrnService.getAll({ status: "fully_received" }),
    ])
      .then(([templatesRes, grnsRes]) => {
        setLabelTemplates(templatesRes.data.data);
        setGrns(grnsRes.data.data);
      })
      .catch(() => toast.error("Failed to load initial data."));
  }, []);

  const handleAddToQueue = (items) => {
    const newItems = items
      .map((item) => ({
        ...item,
        key: `${item.productVariantId}-${
          item.serials ? item.serials.join("") : item.batchNumber
        }`,
      }))
      .filter(
        (newItem) => !printQueue.some((qItem) => qItem.key === newItem.key)
      );
    setPrintQueue((prev) => [...prev, ...newItems]);
  };

  const handleGrnSelect = async (grnId) => {
    setSelectedGrnId(grnId);
    // In a real app, you'd fetch the GRN details here to get items
    toast.success("Items from GRN added to queue (mocked).");
  };

  const handleAdhocAdd = (variant) => {
    handleAddToQueue([
      {
        variantName: variant.variantName,
        sku: variant.sku,
        productVariantId: variant._id,
        quantity: 1,
        isSerialized: variant.templateId?.type === "serialized",
        // ... more data needed from a full variant fetch
      },
    ]);
  };

  const handleQueueQuantityChange = (key, newQuantity) => {
    setPrintQueue((queue) =>
      queue.map((item) =>
        item.key === key ? { ...item, quantity: Number(newQuantity) } : item
      )
    );
  };

  const handleRemoveFromQueue = (key) => {
    setPrintQueue((queue) => queue.filter((item) => item.key !== key));
  };

  const handlePrint = async () => {
    if (!selectedTemplateId || printQueue.length === 0) {
      return toast.error(
        "Please select a template and add items to the queue."
      );
    }
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      "<html><head><title>Printing Labels...</title></head><body>Generating...</body></html>"
    );
    try {
      const res = await tenantPrintService.generateLabels(
        selectedTemplateId,
        printQueue
      );
      printWindow.document.open();
      printWindow.document.write(res.data.html);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      toast.error("Failed to generate labels.");
      printWindow.close();
    }
  };

  if (!printMode) {
    return (
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold mb-4">Print Hub</h1>
        <p className="text-slate-400 mb-8">What would you like to print?</p>
        <div className="flex justify-center gap-8">
          <Button
            onClick={() => setPrintMode("barcode")}
            className="h-24 w-48 text-lg"
          >
            <Barcode className="mr-2" /> Barcodes
          </Button>
          <Button
            onClick={() => setPrintMode("qrcode")}
            className="h-24 w-48 text-lg"
          >
            <QrCode className="mr-2" /> QR Codes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Print Hub: {printMode === "barcode" ? "Barcodes" : "QR Codes"}
        </h1>
        <Button
          onClick={handlePrint}
          disabled={!selectedTemplateId || printQueue.length === 0}
        >
          <Printer className="mr-2 h-4 w-4" /> Generate & Print
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Label>1. Select Label Template</Label>
          <Select
            onValueChange={setSelectedTemplateId}
            value={selectedTemplateId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a label design..." />
            </SelectTrigger>
            <SelectContent>
              {labelTemplates.map((t) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="grn" className="w-full">
        <Tabs.TabsList className="grid w-full grid-cols-2">
          <Tabs.Trigger value="grn" className="ui-tabs-trigger">
            Add from Received Goods (GRN)
          </Tabs.Trigger>
          <Tabs.Trigger value="adhoc" className="ui-tabs-trigger">
            Add Ad-hoc Item
          </Tabs.Trigger>
        </Tabs.TabsList>
        <Tabs.Content
          value="grn"
          className="p-4 border border-t-0 border-slate-700 rounded-b-md"
        >
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <Label>Select a Goods Receipt Note</Label>
              <Select onValueChange={handleGrnSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a recent delivery..." />
                </SelectTrigger>
                <SelectContent>
                  {grns.map((g) => (
                    <SelectItem key={g._id} value={g._id}>
                      {g.grnNumber} - {g.supplierId.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button>Add All Items</Button>
          </div>
        </Tabs.Content>
        <Tabs.Content
          value="adhoc"
          className="p-4 border border-t-0 border-slate-700 rounded-b-md"
        >
          <ProductVariantSearch onProductSelect={handleAdhocAdd} />
        </Tabs.Content>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Print Queue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PrintQueue
            queue={printQueue}
            onQuantityChange={handleQueueQuantityChange}
            onRemoveItem={handleRemoveFromQueue}
          />
        </CardContent>
      </Card>
    </div>
  );
};
export default PrintHubPage;
