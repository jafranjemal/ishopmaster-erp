import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui-library";
import CompatibilitySelector from "./CompatibilitySelector";
import FileUploader from "ui-library/components/FileUploader";
import { Loader2, Trash2, X } from "lucide-react";
import ProductVariantSearch from "../procurement/ProductVariantSearch";

const PRODUCT_TYPES = ["non-serialized", "serialized", "service", "bundle"];

const ProductTemplateForm = ({
  templateToEdit,
  brands,
  categories,
  attributeSets,
  accounts,
  allTemplates,
  onSave,
  onCancel,
  isSaving,
  getSignatureFunc,
}) => {
  const initialFormData = React.useMemo(
    () => ({
      baseName: "",
      skuPrefix: "",
      type: "non-serialized",
      brandId: "",
      categoryId: "",
      attributeSetId: "",
      costPrice: 0,
      sellingPrice: 0,
      alertQty: 5,
      assetAccountId: "",
      revenueAccountId: "",
      cogsAccountId: "",
      compatibility: [],
      images: [],
      description: "",
      bundleItems: [],
    }),
    []
  );
  const [formData, setFormData] = useState(initialFormData);
  const isEditMode = Boolean(templateToEdit?.brandId?._id);

  // --- THE FIX: Determine if the product type requires brand/category ---
  const isPhysicalProduct = useMemo(() => {
    return ["serialized", "non-serialized"].includes(formData.type);
  }, [formData.type]);

  useEffect(() => {
    if (isEditMode && templateToEdit && templateToEdit.baseName) {
      setFormData({
        baseName: templateToEdit.baseName || "",
        skuPrefix: templateToEdit.skuPrefix || "",
        type: templateToEdit.type || "non-serialized",
        brandId: templateToEdit.brandId?._id || "",
        categoryId: templateToEdit.categoryId?._id || "",
        attributeSetId: templateToEdit.attributeSetId?._id || "",
        costPrice: templateToEdit.costPrice || 0,
        sellingPrice: templateToEdit.sellingPrice || 0,
        alertQty: templateToEdit.alertQty || 5,
        assetAccountId: templateToEdit.assetAccountId?._id || "",
        revenueAccountId: templateToEdit.revenueAccountId?._id || "",
        cogsAccountId: templateToEdit.cogsAccountId?._id || "",
        compatibility: templateToEdit.compatibility?.map((t) => t._id) || [],
        images: templateToEdit.images || [],
        description: templateToEdit.description || "",
        // Ensure bundleItems is an array for edit mode
        bundleItems: templateToEdit.bundleItems || [],
      });
    } else {
      setFormData(initialFormData);
    }
  }, [templateToEdit, isEditMode, initialFormData]);

  useEffect(() => {}, [formData.images]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (fieldName, value) => setFormData((prev) => ({ ...prev, [fieldName]: value }));
  const handleArrayChange = (fieldName, value) => setFormData((prev) => ({ ...prev, [fieldName]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleAddBundleItem = (variant) => {
    // Prevent adding a bundle inside another bundle or adding duplicates
    if (variant.templateId?.type === "bundle" || formData.bundleItems.some((item) => item.productVariantId === variant._id)) {
      return;
    }
    const newItem = {
      productVariantId: variant._id,
      variantName: variant.variantName, // For display purposes in the form
      quantity: 1,
    };
    handleArrayChange("bundleItems", [...formData.bundleItems, newItem]);
  };
  const handleBundleItemQtyChange = (variantId, newQty) => {
    const newItems = formData.bundleItems.map((item) => (item.productVariantId === variantId ? { ...item, quantity: Number(newQty) } : item));
    handleArrayChange("bundleItems", newItems);
  };

  const handleRemoveBundleItem = (variantId) => {
    const newItems = formData.bundleItems.filter((item) => item.productVariantId !== variantId);
    handleArrayChange("bundleItems", newItems);
  };

  const assetAccounts = accounts.filter((a) => a.type === "Asset" && a.subType !== "Accounts Receivable");
  const revenueAccounts = accounts.filter((a) => a.type === "Revenue");
  const cogsAccounts = accounts.filter((a) => a.type === "Expense" && a.subType === "COGS");

  if (isEditMode && !templateToEdit.brandId._id) {
    return <Loader2></Loader2>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
      {/* Core Details */}

      <Card>
        <CardContent className="p-4 space-y-4">
          <h4 className="font-semibold text-lg">Core Details</h4>
          <div>
            <Label htmlFor="baseName">Template Name</Label>
            <Input id="baseName" name="baseName" value={formData.baseName} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="skuPrefix">SKU Prefix</Label>
            <Input id="skuPrefix" name="skuPrefix" value={formData.skuPrefix} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>
        </CardContent>
      </Card>

      {/* Categorization */}

      <Card>
        <CardContent className="p-4 space-y-4">
          <h4 className="font-semibold text-lg">Categorization & Type</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              {/* The Label is now dynamic */}
              <Label>Brand {isPhysicalProduct && <span className="text-red-500">*</span>}</Label>
              <Select
                onValueChange={(val) => handleSelectChange("brandId", val)}
                value={formData.brandId}
                // The required attribute is now conditional
                required={isPhysicalProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              {/* The Label is now dynamic */}
              <Label>Category {isPhysicalProduct && <span className="text-red-500">*</span>}</Label>
              <Select
                onValueChange={(val) => handleSelectChange("categoryId", val)}
                value={formData.categoryId}
                // The required attribute is now conditional
                required={isPhysicalProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Product Type</Label>
              <Select onValueChange={(val) => handleSelectChange("type", val)} value={formData.type} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Attribute Set</Label>
              <Select onValueChange={(val) => handleSelectChange("attributeSetId", val)} value={formData.attributeSetId}>
                <SelectTrigger>
                  <SelectValue placeholder="None (No Variants)" />
                </SelectTrigger>
                <SelectContent>
                  {attributeSets.map((as) => (
                    <SelectItem key={as._id} value={as._id}>
                      {as.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- NEW CONDITIONAL BUNDLE SECTION --- */}
      {formData.type === "bundle" && (
        <Card>
          <CardHeader>
            <CardTitle>Bundle Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Add component items to this bundle</Label>
            <ProductVariantSearch onProductSelect={handleAddBundleItem} />
            <div className="mt-4 space-y-2 border-t border-slate-700 pt-4">
              {formData.bundleItems.length === 0 && <p className="text-center text-sm text-slate-400">No components added yet.</p>}
              {formData.bundleItems.map((item) => (
                <div key={item.productVariantId} className="flex items-center justify-between p-2 bg-slate-800 rounded-md">
                  <span className="text-sm font-medium">{item.variantName}</span>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`qty-${item.productVariantId}`} className="text-xs">
                      Qty:
                    </Label>
                    <Input
                      id={`qty-${item.productVariantId}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleBundleItemQtyChange(item.productVariantId, e.target.value)}
                      className="h-8 w-20"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveBundleItem(item.productVariantId)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* --- END OF NEW SECTION --- */}
      {/* Financials */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h4 className="font-semibold text-lg">Financials & Stock</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Default Cost Price</Label>
              <Input name="costPrice" type="number" step="0.01" value={formData.costPrice} onChange={handleChange} />
            </div>
            <div>
              <Label>Default Selling Price</Label>
              <Input name="sellingPrice" type="number" step="0.01" value={formData.sellingPrice} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <Label>Re-Order Level (Alert Qty)</Label>
            <Input name="alertQty" type="number" value={formData.alertQty} onChange={handleChange} required />
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-700 mt-4">
            <h5 className="text-sm font-medium text-slate-300">Default Accounting Links</h5>
            <div>
              <Label>Inventory Asset Account</Label>

              <Select onValueChange={(val) => handleSelectChange("assetAccountId", val)} value={formData.assetAccountId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {assetAccounts.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sales Revenue Account</Label>
              <Select onValueChange={(val) => handleSelectChange("revenueAccountId", val)} value={formData.revenueAccountId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {revenueAccounts.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cost of Goods Sold (COGS) Account</Label>

              <Select onValueChange={(val) => handleSelectChange("cogsAccountId", val)} value={formData.cogsAccountId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {cogsAccounts.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images & Compatibility */}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Marketing Images</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            initialFiles={formData.images && formData.images}
            onUploadComplete={(imgs) => handleArrayChange("images", imgs)}
            getSignatureFunc={getSignatureFunc}
            multiple={true}
          />
        </CardContent>
      </Card>
      {/* Preview section */}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <CompatibilitySelector
            allTemplates={allTemplates.filter((t) => t._id !== templateToEdit?._id)}
            selectedIds={formData.compatibility}
            onChange={(ids) => handleArrayChange("compatibility", ids)}
          />
        </CardContent>
      </Card>

      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save & Define Variants"}
        </Button>
      </div>
    </form>
  );
};
export default ProductTemplateForm;
