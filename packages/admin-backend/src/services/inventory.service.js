/**
 * The InventoryService is the sole gatekeeper for all stock modifications.
 * It ensures every change is valid and creates an audit trail record.
 */
class InventoryService {
  /**
   * Increases stock for a product variant, typically from a purchase order receipt.
   * Handles both non-serialized (lots) and serialized (items) logic.
   * @param {object} models - The tenant's compiled models.
   * @param {object} data - The data for the stock increase.
   * @param {mongoose.ClientSession} session - The Mongoose session for the transaction.
   */
  async increaseStock(models, data, session) {
    const { ProductVariants, InventoryLot, InventoryItem } = models;
    const {
      productVariantId,
      branchId,
      quantity,
      costPriceInBaseCurrency,
      sellingPriceInBaseCurrency, // Optional for lots
      overrideSellingPrice, // Optional for serialized items
      serials = [],
      batchNumber,
      userId,
      ...refs
    } = data;

    const variant = await ProductVariants.findById(productVariantId)
      .populate("templateId")
      .session(session)
      .lean();
    if (!variant)
      throw new Error(`Product Variant with ID ${productVariantId} not found.`);

    const productType = variant.templateId.type;

    if (productType === "non-serialized") {
      // Find an existing lot to add to, or create a new one.
      // We group lots by variant, branch, and cost price.
      let lot = await InventoryLot.findOne({
        productVariantId,
        branchId,
        costPriceInBaseCurrency,
      }).session(session);

      if (lot) {
        lot.quantityInStock += quantity;
        // Optionally update selling price if provided for an existing lot
        if (sellingPriceInBaseCurrency) {
          lot.sellingPriceInBaseCurrency = sellingPriceInBaseCurrency;
        }
        await lot.save({ session });
      } else {
        lot = (
          await InventoryLot.create(
            [
              {
                productVariantId,
                branchId,
                quantityInStock: quantity,
                costPriceInBaseCurrency,
                sellingPriceInBaseCurrency, // Can be null
                batchNumber,
                supplierId: refs.supplierId,
              },
            ],
            { session }
          )
        )[0];
      }

      await this._logMovement(
        models,
        {
          ...data,
          type: "purchase_receive",
          quantityChange: quantity,
          inventoryLotId: lot._id,
        },
        session
      );
    } else if (productType === "serialized") {
      if (serials.length !== quantity) {
        throw new Error(
          `Quantity (${quantity}) does not match the number of serials provided (${serials.length}).`
        );
      }

      // Create a unique InventoryItem for each serial number.
      const itemsToCreate = serials.map((serialNumber) => ({
        productVariantId,
        branchId,
        serialNumber,
        costPriceInBaseCurrency,
        overrideSellingPrice, // Can be null
        status: "in_stock",
        batchNumber,
        supplierId: refs.supplierId,
        purchaseDate: new Date(),
      }));

      const createdItems = await InventoryItem.insertMany(itemsToCreate, {
        session,
        ordered: true,
      });

      // Log each individual item creation for a perfect audit trail
      const movementLogs = createdItems.map((item) => ({
        ...data,
        type: "purchase_receive",
        quantityChange: 1, // Log each serial as a single unit change
        inventoryItemId: item._id,
      }));
      await this._logMovement(models, movementLogs, session);
    } else {
      // For 'service' or 'bundle' types, no physical stock is managed.
      console.log(
        `Skipping stock increase for non-stockable type: ${productType}`
      );
    }

    return { success: true };
  }

  /**
   * Decreases stock, typically from a sale.
   * To be fully implemented in the Sales module chapter.
   */
  async decreaseStock(models, data, session) {
    console.log("Decreasing stock for:", data.productVariantId);
    // TODO: Logic to find the correct InventoryLot/InventoryItem, decrease quantity or update status.
    // TODO: Call _logMovement with type 'sale'.
    return { success: true };
  }

  /**
   * Manually adjusts stock levels.
   * To be fully implemented in the Stock Control UI chapter.
   */
  async adjustStock(models, data, session) {
    console.log("Adjusting stock for:", data.productVariantId);
    // TODO: Logic to find and update stock quantity.
    // TODO: Call _logMovement with type 'adjustment_in' or 'adjustment_out'.
    return { success: true };
  }

  /**
   * Internal helper method to create a StockMovement audit record(s).
   * @private
   */
  async _logMovement(models, movementData, session) {
    const { StockMovement } = models;
    const dataToLog = Array.isArray(movementData)
      ? movementData
      : [movementData];

    const logs = dataToLog.map((data) => ({
      productVariantId: data.productVariantId,
      branchId: data.branchId,
      inventoryItemId: data.inventoryItemId,
      inventoryLotId: data.inventoryLotId,
      type: data.type,
      quantityChange: data.quantityChange,
      costPriceInBaseCurrency: data.costPriceInBaseCurrency,
      notes: data.notes,
      userId: data.userId,
      // relatedPurchaseId: data.refs.relatedPurchaseId,
      ...data.refs,
    }));

    await StockMovement.insertMany(logs, { session, ordered: true });
  }
}

// Export a singleton instance so the same service is used across the app.
module.exports = new InventoryService();
