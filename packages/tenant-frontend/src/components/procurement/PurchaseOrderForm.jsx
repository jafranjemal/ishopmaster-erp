import React, { useState, useEffect } from "react";
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
} from "ui-library";
import { Trash2 } from "lucide-react";
import ProductVariantSearch from "./ProductVariantSearch"; // Assuming this is a component for searching/selecting product variants
import useAuth from "../../context/useAuth";

const PurchaseOrderForm = ({
  poToEdit,
  suppliers,
  branches,
  onSave,
  onCancel,
  isSaving,
}) => {
  const initialPoData = {
    supplierId: "",
    destinationBranchId: "",
    items: [],
    notes: "",
    transactionCurrency: "LKR",
  };
  const [poData, setPoData] = useState(initialPoData);
  const [totals, setTotals] = useState({ subTotal: 0, totalAmount: 0 });
  const { formatCurrency } = useAuth();
  useEffect(() => {
    const subTotal = poData.items.reduce(
      (sum, item) =>
        sum + Number(item.quantityOrdered) * Number(item.costPrice),
      0
    );
    setTotals({ subTotal, totalAmount: subTotal });
  }, [poData.items]);

  const handleHeaderChange = (e) =>
    setPoData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAddItem = (variant) => {
    if (poData.items.some((item) => item.productVariantId === variant._id))
      return; // Prevent duplicates
    console.log("Adding item:", variant);
    const newItem = {
      productVariantId: variant._id,
      description: variant.variantName,
      quantityOrdered: 1,
      costPrice: variant.costPrice || 0,
    };
    setPoData((p) => ({ ...p, items: [...p.items, newItem] }));
  };

  const handleItemChange = (index, field, value) => {
    setPoData((p) => {
      const newItems = [...p.items];
      newItems[index][field] = value;
      return { ...p, items: newItems };
    });
  };

  const handleRemoveItem = (index) => {
    setPoData((p) => ({ ...p, items: p.items.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...poData, ...totals });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Supplier</Label>
          <select
            name="supplierId"
            value={poData.supplierId}
            onChange={handleHeaderChange}
            required
            className="ui-input w-full"
          >
            <option value="" disabled>
              Select Supplier
            </option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Destination Branch</Label>
          <select
            name="destinationBranchId"
            value={poData.destinationBranchId}
            onChange={handleHeaderChange}
            required
            className="ui-input w-full"
          >
            <option value="" disabled>
              Select Branch
            </option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label>Add Items to Order</Label>
        <ProductVariantSearch onProductSelect={handleAddItem} />
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {poData.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-sm">{item.description}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantityOrdered}
                    onChange={(e) =>
                      handleItemChange(index, "quantityOrdered", e.target.value)
                    }
                    className="h-8 w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.costPrice}
                    onChange={(e) =>
                      handleItemChange(index, "costPrice", e.target.value)
                    }
                    className="h-8 w-24"
                  />
                </TableCell>
                <TableCell className="font-mono">
                  {/* ${(item.quantityOrdered * item.costPrice).toFixed(2)} */}
                  {formatCurrency(item.quantityOrdered * item.costPrice)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="text-right font-semibold text-lg">
        Total Amount:{" "}
        <span className="font-mono">{formatCurrency(totals.totalAmount)}</span>
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Create Purchase Order"}
        </Button>
      </div>
    </form>
  );
};
export default PurchaseOrderForm;
