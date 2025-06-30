import React, { useMemo } from "react";
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
import { Trash2, Edit } from "lucide-react";
import ProductVariantSearch from "../../procurement/ProductVariantSearch";

const StockTransferForm = ({
  formData,
  onFormChange,
  branches = [],
  onSave,
  onCancel,
  isSaving,
  onEditSerials,
}) => {
  const toBranchOptions = useMemo(() => {
    return branches.filter((b) => b._id !== formData.fromBranchId);
  }, [branches, formData.fromBranchId]);

  const handleAddItem = (variant) => {
    if (formData.items.some((item) => item.productVariantId === variant._id)) return;
    const newItem = {
      key: variant._id,
      productVariantId: variant._id,
      description: variant.variantName,
      isSerialized: variant.templateId?.type === "serialized",
      quantity: 1,
      serials: [],
    };
    onFormChange("items", [...formData.items, newItem]);
  };

  const handleItemQuantityChange = (key, value) => {
    const newItems = formData.items.map((item) =>
      item.key === key ? { ...item, quantity: Number(value) || 1 } : item
    );
    onFormChange("items", newItems);
  };

  const handleRemoveItem = (key) => {
    const newItems = formData.items.filter((item) => item.key !== key);
    onFormChange("items", newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isFormInvalid =
    isSaving ||
    !formData.fromBranchId ||
    !formData.toBranchId ||
    formData.items.length === 0 ||
    formData.items.some((i) => i.isSerialized && i.serials.length === 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>From (Source)</Label>
          <Select
            onValueChange={(val) => onFormChange("fromBranchId", val)}
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
            onValueChange={(val) => onFormChange("toBranchId", val)}
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
      <div className={!formData.fromBranchId ? "opacity-50 pointer-events-none" : ""}>
        <Label>Add Items to Transfer</Label>
        <ProductVariantSearch onProductSelect={handleAddItem} />
        <p className="text-xs text-amber-400 mt-1">
          {!formData.fromBranchId && "Please select a source branch to add items."}
        </p>
      </div>
      <div className="border border-slate-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="w-[180px] text-center">Quantity / Serials</TableHead>
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
            {formData.items.map((item) => (
              <TableRow key={item.key}>
                <TableCell className="text-sm font-medium">{item.description}</TableCell>
                <TableCell className="text-center">
                  {item.isSerialized ? (
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="default">{item.serials.length} Selected</Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditSerials(item)}
                      >
                        <Edit className="h-3 w-3 mr-1" /> Select
                      </Button>
                    </div>
                  ) : (
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemQuantityChange(item.key, e.target.value)}
                      className="h-8 w-24 mx-auto"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.key)}
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
          onChange={(e) => onFormChange("notes", e.target.value)}
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
