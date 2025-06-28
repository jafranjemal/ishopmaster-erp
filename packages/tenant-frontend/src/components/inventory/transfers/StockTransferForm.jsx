import React, { useState, useMemo } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";
import { Trash2 } from "lucide-react";
import ProductVariantSearch from "../../procurement/ProductVariantSearch";

const StockTransferForm = ({ branches = [], onSave, onCancel, isSaving }) => {
  const initialFormState = {
    fromBranchId: "",
    toBranchId: "",
    items: [],
    notes: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  const toBranchOptions = useMemo(() => {
    return branches.filter((b) => b._id !== formData.fromBranchId);
  }, [branches, formData.fromBranchId]);

  const handleSelectChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleAddItem = (variant) => {
    if (formData.items.some((item) => item.productVariantId === variant._id))
      return; // Prevent duplicates
    const newItem = {
      productVariantId: variant._id,
      description: variant.variantName,
      quantity: 1,
    };
    setFormData((p) => ({ ...p, items: [...p.items, newItem] }));
  };

  const handleItemQuantityChange = (index, value) => {
    setFormData((p) => {
      const newItems = [...p.items];
      newItems[index].quantity = Number(value) || 1;
      return { ...p, items: newItems };
    });
  };

  const handleRemoveItem = (index) => {
    setFormData((p) => ({
      ...p,
      items: p.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isFormInvalid =
    isSaving ||
    !formData.fromBranchId ||
    !formData.toBranchId ||
    formData.items.length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>From (Source)</Label>
          <Select
            onValueChange={(val) => handleSelectChange("fromBranchId", val)}
            value={formData.fromBranchId}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source branch..." />
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
        <div>
          <Label>To (Destination)</Label>
          <Select
            onValueChange={(val) => handleSelectChange("toBranchId", val)}
            value={formData.toBranchId}
            required
            disabled={!formData.fromBranchId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select destination branch..." />
            </SelectTrigger>
            <SelectContent>
              {toBranchOptions.map((b) => (
                <SelectItem key={b._id} value={b._id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Add Items to Transfer</Label>
        <ProductVariantSearch onProductSelect={handleAddItem} />
      </div>

      <div className="border border-slate-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="w-[100px]">Quantity</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formData.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-400">
                  No items added yet.
                </TableCell>
              </TableRow>
            )}
            {formData.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-sm font-medium">
                  {item.description}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemQuantityChange(index, e.target.value)
                    }
                    className="h-8 w-20"
                  />
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

      <div>
        <Label>Notes (Optional)</Label>
        <Input
          name="notes"
          value={formData.notes}
          onChange={(e) => handleSelectChange("notes", e.target.value)}
          placeholder="e.g., Urgent restock for weekend sale"
        />
      </div>

      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isFormInvalid}>
          {isSaving ? "Creating..." : "Create Transfer Order"}
        </Button>
      </div>
    </form>
  );
};
export default StockTransferForm;
