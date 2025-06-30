import React, { useState } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "ui-library";
import ProductVariantSearch from "../procurement/ProductVariantSearch";

const AddJobSheetItemForm = ({ onSave, onCancel, isSaving }) => {
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  const handleProductSelect = (variant) => {
    setItem(variant);
    setUnitPrice(variant.sellingPrice || 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      itemType: item.templateId?.type === "service" ? "service" : "part",
      productVariantId: item._id,
      quantity,
      unitPrice,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!item ? (
        <ProductVariantSearch onProductSelect={handleProductSelect} />
      ) : (
        <div className="p-3 bg-slate-800 rounded-md">
          <p className="font-bold">{item.variantName}</p>
          <p className="text-sm text-slate-400 font-mono">{item.sku}</p>
        </div>
      )}
      {item && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} step="0.01" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Adding..." : "Add to Job Sheet"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
};
export default AddJobSheetItemForm;
