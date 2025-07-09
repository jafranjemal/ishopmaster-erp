const inventoryService = require("./inventory.service");
const mongoose = require("mongoose");

/**
 * The AssemblyService handles the business logic for kitting and assembling
 * bundle products from their component parts.
 */
class AssemblyService {
  /**
   * Assembles a specified quantity of a bundle product.
   * 1. Validates that all required serialized components have been selected.
   * 2. Decreases stock for all component parts.
   * 3. Increases stock for the final, assembled bundle product.
   * Assumes it is being called from within a transaction.
   * @param {object} models - The tenant's compiled models.
   * @param {object} data - The data for the assembly job.
   */
  async assembleKit(
    models,
    { bundleVariantId, branchId, quantityToAssemble, componentSelections, userId }
  ) {
    const { ProductVariants, InventoryItem } = models;

    // 1. Fetch the bundle's recipe
    const bundleVariant = await ProductVariants.findById(bundleVariantId)
      .populate("templateId")
      .lean();
    if (!bundleVariant || bundleVariant.templateId.type !== "bundle") {
      throw new Error("Invalid bundle product specified.");
    }
    const recipe = bundleVariant.templateId.bundleItems;

    // 2. Decrease stock for all component parts
    const consumedComponents = [];
    for (const component of recipe) {
      const componentVariant = await ProductVariants.findById(component.ProductVariantId)
        .populate("templateId")
        .lean();
      if (!componentVariant)
        throw new Error(`Component with ID ${component.ProductVariantId} not found.`);

      const isSerialized = componentVariant.templateId.type === "serialized";
      const requiredQty = component.quantity * quantityToAssemble;

      if (isSerialized) {
        const selectedSerials = componentSelections[component.ProductVariantId.toString()];
        if (!selectedSerials || selectedSerials.length !== requiredQty) {
          throw new Error(
            `Incorrect number of serials selected for component ${componentVariant.variantName}. Required: ${requiredQty}, Selected: ${selectedSerials?.length || 0}`
          );
        }

        for (const serial of selectedSerials) {
          await inventoryService.decreaseStock(models, {
            ProductVariantId: component.ProductVariantId,
            branchId,
            quantity: 1,
            serialNumber: serial,
            userId,
            refs: { assemblyFor: bundleVariant.variantName },
          });
          // Find the ID of the consumed item for the audit trail
          const consumedItem = await InventoryItem.findOne({ serialNumber: serial }).lean();
          if (consumedItem)
            consumedComponents.push({
              ProductVariantId: component.ProductVariantId,
              inventoryItemId: consumedItem._id,
            });
        }
      } else {
        await inventoryService.decreaseStock(models, {
          ProductVariantId: component.ProductVariantId,
          branchId,
          quantity: requiredQty,
          userId,
          refs: { assemblyFor: bundleVariant.variantName },
        });
        // For non-serialized, we can't track specific lots consumed easily without a more complex return from decreaseStock.
      }
    }

    // 3. Increase stock for the final, assembled bundle product
    const isFinalBundleSerialized = bundleVariant.templateId.isSerialized; // Assuming a new field on the bundle template
    let newSerials = [];
    if (isFinalBundleSerialized) {
      // Generate new serial numbers for the assembled kits
      for (let i = 0; i < quantityToAssemble; i++) {
        newSerials.push(`KIT-${bundleVariant.sku}-${Date.now() + i}`);
      }
    }

    await inventoryService.increaseStock(models, {
      ProductVariantId: bundleVariantId,
      branchId,
      quantity: quantityToAssemble,
      costPriceInBaseCurrency: bundleVariant.defaultCostPrice, // Cost should be sum of components in a real system
      serials: newSerials,
      batchNumber: `ASMB-${Date.now()}`,
      userId,
      refs: { assembly: true },
      // This part is complex and would require updating InventoryItem creation logic
      // to accept and store the `assembledFrom` data.
      // assembledFrom: consumedComponents
    });

    return {
      success: true,
      message: `${quantityToAssemble} of ${bundleVariant.variantName} assembled successfully.`,
    };
  }
}

module.exports = new AssemblyService();
