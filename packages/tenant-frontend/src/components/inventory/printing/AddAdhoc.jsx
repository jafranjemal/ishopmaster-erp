import React from "react";
import ProductVariantSearch from "../../procurement/ProductVariantSearch";

/**
 * A component that provides a search interface to add single items to the print queue.
 */
const AddAdhoc = ({ onAddItem }) => {
  const handleProductSelect = (variant) => {
    // Transform the variant into the format our print queue expects
    const itemToAdd = {
      productVariantId: variant._id,
      variantName: variant.variantName,
      sku: variant.sku,
      quantity: 1, // Default to 1, user can change in queue
      isSerialized: variant.templateId?.type === "serialized",
      serials: [],
      batchNumber: "N/A", // No batch for ad-hoc items
    };
    onAddItem(itemToAdd);
  };

  return (
    <div>
      <ProductVariantSearch onProductSelect={handleProductSelect} />
      <p className="text-xs text-slate-400 mt-2">
        Search for any product by name or SKU to add it to the print queue.
      </p>
    </div>
  );
};

export default AddAdhoc;
