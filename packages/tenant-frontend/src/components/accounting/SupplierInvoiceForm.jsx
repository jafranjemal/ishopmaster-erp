import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Card,
  CardContent,
} from "ui-library";
import FileUploader from "ui-library/components/FileUploader";
import { tenantUploadService } from "../../services/api";
import useAuth from "../../context/useAuth";
import { AlertTriangle } from "lucide-react";

const SupplierInvoiceForm = ({
  purchaseOrder,
  initialInvoiceData,
  onPost,
  isSaving,
}) => {
  const [invoiceData, setInvoiceData] = useState(initialInvoiceData);
  const { formatCurrency } = useAuth();

  useEffect(() => {
    // This effect ensures the form resets if the parent data changes
    setInvoiceData(initialInvoiceData);
  }, [initialInvoiceData]);

  const handleHeaderChange = (e) => {
    setInvoiceData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    // Ensure value is treated as a number for calculations
    newItems[index][field] = value === "" ? "" : Number(value);
    setInvoiceData((prev) => ({ ...prev, items: newItems }));
  };

  const handleFileUpload = (uploadedFiles) => {
    setInvoiceData((prev) => ({ ...prev, fileAttachments: uploadedFiles }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPost(invoiceData);
  };

  // useMemo for high-performance, real-time calculations.
  // This will only re-calculate when invoiceData.items or purchaseOrder changes.
  const { subTotal, totalAmount, purchasePriceVariance } = useMemo(() => {
    const subTotal = invoiceData.items.reduce(
      (sum, item) => sum + item.quantityBilled * item.finalCostPrice,
      0
    );
    const totalAmount =
      subTotal + (invoiceData.taxes || 0) + (invoiceData.shippingCosts || 0);

    const totalOriginalCost = invoiceData.items.reduce((sum, item) => {
      const poItem = purchaseOrder.items.find(
        (p) => p.productVariantId === item.productVariantId
      );
      // We use the billed quantity from the invoice, but the original cost from the PO
      return sum + item.quantityBilled * (poItem?.costPrice || 0);
    }, 0);

    const purchasePriceVariance = subTotal - totalOriginalCost;
    return { subTotal, totalAmount, purchasePriceVariance };
  }, [invoiceData.items, purchaseOrder.items]);

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierInvoiceNumber">
                Supplier's Invoice #
              </Label>
              <Input
                id="supplierInvoiceNumber"
                name="supplierInvoiceNumber"
                value={invoiceData.supplierInvoiceNumber}
                onChange={handleHeaderChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                name="invoiceDate"
                type="date"
                value={invoiceData.invoiceDate}
                onChange={handleHeaderChange}
                required
              />
            </div>
          </div>

          <div>
            <Label>Billed Items</Label>
            <p className="text-xs text-slate-400 mb-2">
              Adjust the Final Cost per item to match the supplier's bill.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Final Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceData.items.map((item, index) => (
                  <TableRow key={item.productVariantId}>
                    <TableCell className="text-sm">
                      {item.description}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantityBilled}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantityBilled",
                            e.target.value
                          )
                        }
                        className="h-8 w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.finalCostPrice}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "finalCostPrice",
                            e.target.value
                          )
                        }
                        className="h-8 w-28"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <Label>Attach Scanned Invoice</Label>
            <FileUploader
              onUploadComplete={handleFileUpload}
              getSignatureFunc={tenantUploadService.getCloudinarySignature}
              initialFiles={invoiceData.fileAttachments}
            />
          </div>

          <div className="p-4 bg-slate-900/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-mono">{formatCurrency(subTotal)}</span>
            </div>
            {Math.abs(purchasePriceVariance) > 0.01 && (
              <div
                className={`flex justify-between text-sm font-semibold ${
                  purchasePriceVariance > 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                <span className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" /> Purchase Price
                  Variance
                </span>
                <span className="font-mono">
                  {formatCurrency(purchasePriceVariance)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-slate-700 pt-2 mt-2!">
              <span className="text-slate-100">Total Amount</span>
              <span className="font-mono">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Posting..." : "Post Invoice & Reconcile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupplierInvoiceForm;
