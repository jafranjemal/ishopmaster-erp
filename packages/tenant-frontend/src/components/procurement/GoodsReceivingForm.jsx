import React, { useState } from "react";
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
  CardHeader,
  CardTitle,
} from "ui-library";
import { CheckCircle } from "lucide-react";

const GoodsReceivingForm = ({ purchaseOrder, onReceive, isSaving }) => {
  const [receivedItems, setReceivedItems] = useState({});

  const handleQuantityChange = (poItemId, variantType, value) => {
    const qty = parseInt(value, 10) || 0;
    const poItem = purchaseOrder.items.find((item) => item._id === poItemId);
    const maxQty = poItem.quantityOrdered - poItem.quantityReceived;
    const validatedQty = Math.max(0, Math.min(qty, maxQty));

    setReceivedItems((prev) => ({
      ...prev,
      [poItemId]: {
        ...prev[poItemId],
        productVariantId: poItem.productVariantId._id,
        quantityReceived: validatedQty,
        // If serialized, create an array of empty strings for the serial inputs
        serials:
          variantType === "serialized" ? Array(validatedQty).fill("") : [],
      },
    }));
  };

  const handleSerialChange = (poItemId, serialIndex, value) => {
    setReceivedItems((prev) => {
      const newSerials = [...prev[poItemId].serials];
      newSerials[serialIndex] = value.toUpperCase();
      return {
        ...prev,
        [poItemId]: { ...prev[poItemId], serials: newSerials },
      };
    });
  };

  const isFormValid = () => {
    return Object.values(receivedItems).every(
      (item) =>
        !item.serials ||
        (item.serials.length === item.quantityReceived &&
          item.serials.every((s) => s.trim() !== ""))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert("Please fill in all required serial numbers.");
      return;
    }
    // Filter out items where quantity is 0 before submitting
    const itemsToSubmit = Object.values(receivedItems).filter(
      (item) => item.quantityReceived > 0
    );
    onReceive({ receivedItems: itemsToSubmit });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Receive Items into Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Ordered</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>To Receive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrder.items.map((item) => {
                const remainingQty =
                  item.quantityOrdered - item.quantityReceived;
                if (remainingQty <= 0) return null; // Don't show fully received items

                const variantType = item.productVariantId.templateId?.type; // Need to populate this in the PO controller
                const currentEntry = receivedItems[item._id];

                console.log(item.productVariantId);
                return (
                  <React.Fragment key={item._id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell>{item.quantityOrdered}</TableCell>
                      <TableCell>{item.quantityReceived}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          max={remainingQty}
                          min="0"
                          className="h-8 w-20"
                          value={currentEntry?.quantityReceived || ""}
                          onChange={(e) =>
                            handleQuantityChange(
                              item._id,
                              variantType,
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                    {JSON.stringify(currentEntry?.quantityReceived)}
                    {variantType}
                    {/* Dynamically render serial number inputs */}
                    {variantType === "serialized" &&
                      currentEntry?.quantityReceived > 0 && (
                        <TableRow className="bg-slate-900/50">
                          <TableCell colSpan={4} className="p-4">
                            <Label className="font-semibold mb-2 block">
                              Enter Serial Numbers:
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {[...Array(currentEntry.quantityReceived)].map(
                                (_, i) => (
                                  <Input
                                    key={i}
                                    placeholder={`Serial #${i + 1}`}
                                    className="h-8"
                                    value={currentEntry.serials[i] || ""}
                                    onChange={(e) =>
                                      handleSerialChange(
                                        item._id,
                                        i,
                                        e.target.value
                                      )
                                    }
                                    required
                                  />
                                )
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSaving || !isFormValid()}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {isSaving ? "Processing..." : "Confirm Receipt & Add to Stock"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoodsReceivingForm;
