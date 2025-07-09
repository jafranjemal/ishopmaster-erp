import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Modal, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label } from "ui-library";
import { tenantLabelTemplateService, tenantPrintService } from "../../../services/api";
import { Printer, LoaderCircle } from "lucide-react";

/**
 * A reusable modal for initiating a print job for a given set of items.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {Function} props.onClose - Function to call to close the modal.
 * @param {Array<object>} props.itemsToPrint - The array of items to be printed.
 */
const PrintModal = ({ isOpen, onClose, itemsToPrint = [] }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch available label templates whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsLoadingTemplates(true);
      tenantLabelTemplateService
        .getAll()
        .then((res) => {
          setTemplates(res.data.data);
          // Smartly select the first template by default
          if (res.data.data.length > 0) {
            setSelectedTemplateId(res.data.data[0]._id);
          }
        })
        .catch(() => toast.error("Could not load label templates."))
        .finally(() => setIsLoadingTemplates(false));
    }
  }, [isOpen]);

  /**
   * Handles the final print generation.
   * Calls the backend service and opens the print preview in a new tab.
   */
  const handlePrint = async () => {
    if (!selectedTemplateId) {
      return toast.error("Please select a label template.");
    }
    if (itemsToPrint.length === 0) {
      return toast.error("There are no items to print.");
    }

    setIsPrinting(true);
    const printToast = toast.loading("Generating print document...");

    try {
      // Prepare the payload for the API based on the items passed in props
      const payloadItems = itemsToPrint.map((item) => ({
        ProductVariantsId: item.ProductVariantsId || item._id,
        quantity: item.isSerialized ? item.serials.length : item.quantity,
        serials: item.isSerialized ? item.serials : undefined,
      }));

      const res = await tenantPrintService.generatePrintJob(selectedTemplateId, payloadItems);

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Please allow pop-ups for this site to print.", {
          id: printToast,
        });
        setIsPrinting(false);
        return;
      }

      // Write the HTML from the backend into the new window and trigger print dialog
      printWindow.document.write(res.data);
      printWindow.document.close();

      // A small delay allows images/fonts in the new window to load before printing
      setTimeout(() => {
        printWindow.print();
        toast.success("Print document generated!", { id: printToast });
      }, 500);

      onClose(); // Close the modal after successfully opening the print window
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to generate labels.", {
        id: printToast,
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Product Labels">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-slate-400">
            You are about to print labels for <span className="font-bold text-slate-100">{itemsToPrint.length}</span> item(s). Please select the label
            template you would like to use.
          </p>
        </div>

        <div>
          <Label htmlFor="template-select">Label Template</Label>
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center h-10 border rounded-md border-slate-700 bg-slate-800">
              <LoaderCircle className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <Select onValueChange={setSelectedTemplateId} value={selectedTemplateId} required>
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Choose a label design..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name} ({t.labelWidth}mm x {t.labelHeight}mm)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting || isLoadingTemplates || !selectedTemplateId}>
            {isPrinting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" /> Generate & Print
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PrintModal;
