const mongoose = require("mongoose");

/**
 * The InventoryService is the sole gatekeeper for all stock modifications.
 * It ensures every change is valid and creates an audit trail record.
 * All public methods assume they are being called from within a Mongoose transaction block.
 */
class InventoryService {
  /**
   * Increases stock for a product variant, typically from a purchase order receipt.
   * Handles both non-serialized (lots) and serialized (items) logic.
   * For serialized items, it acts on a specific serial number.
   */
  async increaseStock(models, data) {
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
      refs,
    } = data;

    const variant = await ProductVariants.findById(productVariantId).populate("templateId").lean();
    if (!variant) throw new Error(`Product Variant with ID ${productVariantId} not found.`);

    const productType = variant.templateId.type;

    if (productType === "non-serialized") {
      let lot = await InventoryLot.findOne({
        productVariantId,
        branchId,
        costPriceInBaseCurrency,
        batchNumber,
      });

      if (lot) {
        lot.quantityInStock += quantity;
        if (sellingPriceInBaseCurrency) lot.sellingPriceInBaseCurrency = sellingPriceInBaseCurrency;
        await lot.save();
      } else {
        lot = (
          await InventoryLot.create([
            {
              productVariantId,
              branchId,
              quantityInStock: quantity,
              costPriceInBaseCurrency,
              sellingPriceInBaseCurrency,
              batchNumber,
              supplierId: refs?.supplierId,
            },
          ])
        )[0];
      }

      await this._logMovement(models, {
        ...data,
        type: "purchase_receive",
        quantityChange: quantity,
        inventoryLotId: lot._id,
      });
    } else if (productType === "serialized") {
      if (serials.length !== quantity)
        throw new Error(
          `Quantity (${quantity}) does not match the number of serials provided (${serials.length}).`
        );

      const itemsToCreate = serials.map((serialNumber) => ({
        productVariantId,
        branchId,
        serialNumber,
        costPriceInBaseCurrency,
        overrideSellingPrice,
        status: "in_stock",
        batchNumber,
        supplierId: refs?.supplierId,
        purchaseDate: new Date(),
      }));

      const createdItems = await InventoryItem.insertMany(itemsToCreate);

      const movementLogs = createdItems.map((item) => ({
        ...data,
        type: "purchase_receive",
        quantityChange: 1,
        inventoryItemId: item._id,
      }));
      await this._logMovement(models, movementLogs);
    }
    return { success: true };
  }

  /**
   * Decreases stock for a product variant, from a sale or transfer.
   * For non-serialized items, it uses a FIFO (First-In, First-Out) strategy.
   */
  async decreaseStock(
    models,
    { productVariantId, branchId, quantity, serialNumber, userId, refs = {} }
  ) {
    const { ProductVariants, InventoryLot, InventoryItem } = models;

    const variant = await ProductVariants.findById(productVariantId)
      .populate({
        path: "templateId",
        populate: {
          path: "bundleItems.productVariantId",
          model: "ProductVariant",
        },
      })
      .lean();
    if (!variant) throw new Error(`Product Variant with ID ${productVariantId} not found.`);

    const productType = variant.templateId.type;
    const movementType = refs.relatedSaleId ? "sale" : "transfer_out";
    let totalCostOfDeductedItems = 0;

    // --- NEW BUNDLE LOGIC ---
    if (productType === "bundle") {
      // If the item is a bundle, decrease stock for its components instead.
      for (const bundleItem of variant.templateId.bundleItems) {
        const componentQtyToDeduct = bundleItem.quantity * quantity; // e.g., sell 2 kits, deduct 2 * 2 = 4 batteries

        // Recursively call decreaseStock for each component
        const componentCost = await this.decreaseStock(models, {
          productVariantId: bundleItem.productVariantId._id,
          branchId,
          quantity: componentQtyToDeduct,
          // Note: This simplified version assumes non-serialized components in bundles.
          // A full implementation would require passing serials for components from the POS.
          userId,
          refs,
        });
        totalCostOfDeductedItems += componentCost.costOfGoodsSold;
      }
    }
    // --- END OF NEW BUNDLE LOGIC ---
    else if (productType === "non-serialized") {
      const lots = await InventoryLot.find({
        productVariantId,
        branchId,
        quantityInStock: { $gt: 0 },
      }).sort({ createdAt: 1 });
      let remainingQtyToDeduct = quantity;

      for (const lot of lots) {
        if (remainingQtyToDeduct <= 0) break;
        const qtyToDeductFromLot = Math.min(lot.quantityInStock, remainingQtyToDeduct);

        lot.quantityInStock -= qtyToDeductFromLot;
        await lot.save();

        totalCostOfDeductedItems += qtyToDeductFromLot * lot.costPriceInBaseCurrency;
        remainingQtyToDeduct -= qtyToDeductFromLot;

        await this._logMovement(models, {
          productVariantId,
          branchId,
          userId,
          refs,
          inventoryLotId: lot._id,
          type: movementType,
          quantityChange: -qtyToDeductFromLot,
          costPriceInBaseCurrency: lot.costPriceInBaseCurrency,
        });
      }

      if (remainingQtyToDeduct > 0)
        throw new Error(
          `Insufficient stock for variant ${variant.variantName}. Only ${
            quantity - remainingQtyToDeduct
          } units available.`
        );
    } else if (productType === "serialized") {
      if (!serialNumber)
        throw new Error("Serial number is required for serialized item stock movement.");
      const item = await InventoryItem.findOne({
        productVariantId,
        serialNumber,
        status: "in_stock",
      });
      if (!item) throw new Error(`Serialized item with serial #${serialNumber} is not in stock.`);

      item.status = movementType === "sale" ? "sold" : "in_transit";
      await item.save();

      totalCostOfDeductedItems = item.costPriceInBaseCurrency;
      await this._logMovement(models, {
        productVariantId,
        branchId: item.branchId,
        userId,
        refs,
        inventoryItemId: item._id,
        type: movementType,
        quantityChange: -1,
        costPriceInBaseCurrency: item.costPriceInBaseCurrency,
      });
    }

    return { costOfGoodsSold: totalCostOfDeductedItems };
  }

  /**
   * Manually adjusts stock levels by calling increase or decrease stock logic.
   */
  async adjustStock(models, data) {
    const { quantityChange, ...rest } = data;
    const isRemoval = quantityChange < 0;

    const movementType = isRemoval ? "adjustment_out" : "adjustment_in";
    const logData = {
      ...rest,
      type: movementType,
      refs: { adjustmentNote: data.notes },
    };

    if (isRemoval) {
      await this.decreaseStock(models, {
        ...logData,
        quantity: Math.abs(quantityChange),
      });
    } else {
      const cost = data.costPriceInBaseCurrency;
      if (!cost && cost !== 0)
        throw new Error("Cost price is required when manually adding stock.");
      await this.increaseStock(models, {
        ...logData,
        quantity: quantityChange,
        costPriceInBaseCurrency: cost,
      });
    }
    return { success: true };
  }

  /**
   * Dispatches a stock transfer, decreasing stock from the source branch.
   * Now correctly handles serialized items by looping through the provided serials list
   */
  async dispatchTransfer(models, { transfer, userId }) {
    const { ProductVariants } = models;
    for (const item of transfer.items) {
      const variant = await ProductVariants.findById(item.productVariantId)
        .populate("templateId")
        .lean();
      if (!variant) continue;

      const isSerialized = variant.templateId.type === "serialized";

      if (isSerialized) {
        // For serialized items, decrease stock for each specific serial number
        if (!item.serials || item.serials.length === 0)
          throw new Error(`No serial numbers selected for serialized item ${variant.variantName}.`);

        for (const serial of item.serials) {
          await this.decreaseStock(models, {
            productVariantId: item.productVariantId,
            branchId: transfer.fromBranchId,
            quantity: 1, // Always 1 for a single serial
            serialNumber: serial,
            userId,
            refs: { relatedTransferId: transfer._id },
          });
        }
      } else {
        // For non-serialized items, decrease stock by the total quantity
        await this.decreaseStock(models, {
          productVariantId: item.productVariantId,
          branchId: transfer.fromBranchId,
          quantity: item.quantity,
          userId,
          refs: { relatedTransferId: transfer._id },
        });
      }
    }

    transfer.status = "in_transit";
    transfer.dispatchedBy = userId;
    transfer.dispatchDate = new Date();
    await transfer.save();
    return transfer;
  }

  /**
   * Receives a stock transfer, increasing stock at the destination branch.
   * THIS IS THE DEFINITIVE, CORRECTED VERSION.
   */
  async receiveTransfer(models, { transfer, userId }) {
    const { InventoryLot, InventoryItem, ProductVariants } = models;

    for (const item of transfer.items) {
      const variant = await ProductVariants.findById(item.productVariantId)
        .populate("templateId")
        .lean();
      if (!variant) continue;
      const isSerialized = variant.templateId.type === "serialized";

      if (isSerialized) {
        // --- LOGIC FOR SERIALIZED ITEMS: UPDATE EXISTING RECORDS ---
        for (const serial of item.serials) {
          const inventoryItem = await InventoryItem.findOne({
            productVariantId: item.productVariantId,
            serialNumber: serial,
          });
          if (!inventoryItem)
            throw new Error(`Transferred item with serial ${serial} not found in database.`);
          if (inventoryItem.status !== "in_transit")
            throw new Error(`Item ${serial} is not currently in transit.`);

          // Update the location and status of the EXISTING item
          inventoryItem.branchId = transfer.toBranchId;
          inventoryItem.status = "in_stock";
          await inventoryItem.save();

          await this._logMovement(models, {
            productVariantId: item.productVariantId,
            branchId: transfer.toBranchId, // The destination
            inventoryItemId: inventoryItem._id,
            type: "transfer_in",
            quantityChange: 1,
            costPriceInBaseCurrency: inventoryItem.costPriceInBaseCurrency,
            userId,
            refs: { relatedTransferId: transfer._id },
          });
        }
      } else {
        // --- LOGIC FOR NON-SERIALIZED ITEMS: CALL increaseStock ---
        // This is acceptable because a lot is just a number. We are creating a new lot
        // or incrementing an existing lot at the new location.
        const cost = variant.defaultCostPrice || 0; // Find cost from original lot in a future refactor for perfect accuracy
        await this.increaseStock(models, {
          productVariantId: item.productVariantId,
          branchId: transfer.toBranchId,
          quantity: item.quantity,
          costPriceInBaseCurrency: cost,
          batchNumber: `TRN-${transfer.transferId}`,
          userId,
          refs: { relatedTransferId: transfer._id },
        });
      }
    }

    transfer.status = "completed";
    transfer.receivedBy = userId;
    transfer.receivedDate = new Date();
    await transfer.save();
    return transfer;
  }
  /**
   * Internal helper method to create a StockMovement audit record(s).
   * @private
   */
  async _logMovement(models, movementData, actionType) {
    const { StockMovement } = models;
    const dataToLog = Array.isArray(movementData) ? movementData : [movementData];

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
      ...data.refs,
    }));

    await StockMovement.insertMany(logs);
  }
}

// Export a singleton instance.
module.exports = new InventoryService();
