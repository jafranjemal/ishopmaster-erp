// /**
//  * The InventoryService is the sole gatekeeper for all stock modifications.
//  * It ensures every change is valid and creates an audit trail record.
//  */
// class InventoryService {
//   /**
//    * Increases stock for a product variant, typically from a purchase order receipt.
//    * Handles both non-serialized (lots) and serialized (items) logic.
//    * @param {object} models - The tenant's compiled models.
//    * @param {object} data - The data for the stock increase.
//    * @param {mongoose.ClientSession} session - The Mongoose session for the transaction.
//    */
//   async increaseStock(models, data, session) {
//     const { ProductVariants, InventoryLot, InventoryItem } = models;
//     const {
//       productVariantId,
//       branchId,
//       quantity,
//       costPriceInBaseCurrency,
//       sellingPriceInBaseCurrency, // Optional for lots
//       overrideSellingPrice, // Optional for serialized items
//       serials = [],
//       batchNumber,
//       userId,
//       ...refs
//     } = data;

//     const variant = await ProductVariants.findById(productVariantId)
//       .populate("templateId")
//       .session(session)
//       .lean();
//     if (!variant)
//       throw new Error(`Product Variant with ID ${productVariantId} not found.`);

//     const productType = variant.templateId.type;

//     if (productType === "non-serialized") {
//       // Find an existing lot to add to, or create a new one.
//       // We group lots by variant, branch, and cost price.
//       let lot = await InventoryLot.findOne({
//         productVariantId,
//         branchId,
//         costPriceInBaseCurrency,
//       }).session(session);

//       if (lot) {
//         lot.quantityInStock += quantity;
//         // Optionally update selling price if provided for an existing lot
//         if (sellingPriceInBaseCurrency) {
//           lot.sellingPriceInBaseCurrency = sellingPriceInBaseCurrency;
//         }
//         await lot.save({ session });
//       } else {
//         lot = (
//           await InventoryLot.create(
//             [
//               {
//                 productVariantId,
//                 branchId,
//                 quantityInStock: quantity,
//                 costPriceInBaseCurrency,
//                 sellingPriceInBaseCurrency, // Can be null
//                 batchNumber,
//                 supplierId: refs.supplierId,
//               },
//             ],
//             { session }
//           )
//         )[0];
//       }

//       await this._logMovement(
//         models,
//         {
//           ...data,
//           type: "purchase_receive",
//           quantityChange: quantity,
//           inventoryLotId: lot._id,
//         },
//         session
//       );
//     } else if (productType === "serialized") {
//       if (serials.length !== quantity) {
//         throw new Error(
//           `Quantity (${quantity}) does not match the number of serials provided (${serials.length}).`
//         );
//       }

//       // Create a unique InventoryItem for each serial number.
//       const itemsToCreate = serials.map((serialNumber) => ({
//         productVariantId,
//         branchId,
//         serialNumber,
//         costPriceInBaseCurrency,
//         overrideSellingPrice, // Can be null
//         status: "in_stock",
//         batchNumber,
//         supplierId: refs.supplierId,
//         purchaseDate: new Date(),
//       }));

//       const createdItems = await InventoryItem.insertMany(itemsToCreate, {
//         session,
//         ordered: true,
//       });

//       // Log each individual item creation for a perfect audit trail
//       const movementLogs = createdItems.map((item) => ({
//         ...data,
//         type: "purchase_receive",
//         quantityChange: 1, // Log each serial as a single unit change
//         inventoryItemId: item._id,
//       }));
//       await this._logMovement(models, movementLogs, session);
//     } else {
//       // For 'service' or 'bundle' types, no physical stock is managed.
//       console.log(
//         `Skipping stock increase for non-stockable type: ${productType}`
//       );
//     }

//     return { success: true };
//   }

//   /**
//    * Decreases stock, typically from a sale.
//    * To be fully implemented in the Sales module chapter.
//    */
//   async decreaseStock(models, data, session) {
//     console.log("Decreasing stock for:", data.productVariantId);
//     // TODO: Logic to find the correct InventoryLot/InventoryItem, decrease quantity or update status.
//     // TODO: Call _logMovement with type 'sale'.
//     return { success: true };
//   }

//   /**
//    * Manually adjusts stock for reasons like damage or recounts.
//    * This new version intelligently finds the cost of the items being adjusted.
//    * Assumes it is being called from within a transaction.
//    */
//   async adjustStock(
//     models,
//     { productVariantId, branchId, quantityChange, notes, userId, refs = {} }
//   ) {
//     const { InventoryLot, ProductVariants } = models;
//     const isRemoval = quantityChange < 0;

//     if (isRemoval) {
//       // --- LOGIC FOR REMOVING STOCK (e.g., Damaged Goods) ---
//       const lots = await InventoryLot.find({
//         productVariantId,
//         branchId,
//         quantityInStock: { $gt: 0 },
//       }).sort({ createdAt: 1 }); // FIFO

//       let remainingQtyToRemove = Math.abs(quantityChange);
//       let totalCostOfAdjustment = 0;

//       for (const lot of lots) {
//         if (remainingQtyToRemove <= 0) break;

//         const qtyToRemoveFromLot = Math.min(
//           lot.quantityInStock,
//           remainingQtyToRemove
//         );
//         const costOfRemovedItems =
//           qtyToRemoveFromLot * lot.costPriceInBaseCurrency;

//         lot.quantityInStock -= qtyToRemoveFromLot;
//         await lot.save();

//         await this._logMovement(models, {
//           productVariantId,
//           branchId,
//           userId,
//           notes,
//           refs,
//           inventoryLotId: lot._id,
//           type: "adjustment_out",
//           quantityChange: -qtyToRemoveFromLot,
//           costPriceInBaseCurrency: lot.costPriceInBaseCurrency,
//         });

//         remainingQtyToRemove -= qtyToRemoveFromLot;
//         totalCostOfAdjustment += costOfRemovedItems;
//       }

//       if (remainingQtyToRemove > 0) {
//         throw new Error(
//           `Adjustment failed. Not enough stock to remove ${Math.abs(
//             quantityChange
//           )} units.`
//         );
//       }

//       // TODO: Post to accounting service to Debit "Damaged Goods Expense" and Credit "Inventory Asset" for totalCostOfAdjustment
//     } else {
//       // --- LOGIC FOR ADDING STOCK (e.g., Recount Find) ---
//       // This is simpler as we must be TOLD the cost of the found items.
//       // The UI form for this reason would require a cost input.
//       const variant = await ProductVariants.findById(productVariantId).lean();
//       if (!variant) throw new Error("Product not found for adjustment.");

//       const costPrice =
//         refs.costPriceInBaseCurrency || variant.defaultCostPrice || 0;

//       const lot = (
//         await InventoryLot.create([
//           {
//             productVariantId,
//             branchId,
//             quantityInStock: quantityChange,
//             costPriceInBaseCurrency: costPrice,
//             batchNumber: `ADJ-${Date.now()}`, // Create a unique batch number for this adjustment
//           },
//         ])
//       )[0];

//       await this._logMovement(models, {
//         productVariantId,
//         branchId,
//         userId,
//         notes,
//         refs,
//         inventoryLotId: lot._id,
//         type: "adjustment_in",
//         quantityChange: quantityChange,
//         costPriceInBaseCurrency: costPrice,
//       });
//     }

//     return { success: true };
//   }

//   /**
//    * Internal helper method to create a StockMovement audit record(s).
//    * @private
//    */
//   async _logMovement(models, movementData) {
//     const { StockMovement } = models;
//     const dataToLog = Array.isArray(movementData)
//       ? movementData
//       : [movementData];

//     const logs = dataToLog.map((data) => ({
//       productVariantId: data.productVariantId,
//       branchId: data.branchId,
//       inventoryItemId: data.inventoryItemId,
//       inventoryLotId: data.inventoryLotId,
//       type: data.type,
//       quantityChange: data.quantityChange,
//       costPriceInBaseCurrency: data.costPriceInBaseCurrency,
//       notes: data.notes,
//       userId: data.userId,
//       ...data.refs,
//     }));

//     await StockMovement.insertMany(logs);
//   }

//   /**
//    * Dispatches a stock transfer, decreasing stock from the source branch.
//    */
//   async dispatchTransfer(models, { transfer, userId }, session) {
//     const { StockTransfer } = models;

//     // Decrease stock for each item from the 'fromBranch'
//     for (const item of transfer.items) {
//       await this.decreaseStock(
//         models,
//         {
//           productVariantId: item.productVariantId,
//           branchId: transfer.fromBranchId,
//           quantity: item.quantity,
//           userId,
//           refs: { relatedTransferId: transfer._id },
//         },
//         session
//       );
//     }

//     transfer.status = "in_transit";
//     transfer.dispatchedBy = userId;
//     transfer.dispatchDate = new Date();
//     await transfer.save({ session });

//     return transfer;
//   }

//   /**
//    * Receives a stock transfer, increasing stock at the destination branch.
//    */
//   async receiveTransfer(models, { transfer, userId }, session) {
//     const { StockTransfer } = models;

//     // Increase stock for each item at the 'toBranch'
//     for (const item of transfer.items) {
//       // This call needs cost price. A real implementation would fetch it from the
//       // source branch's lots or use the variant's default cost.
//       await this.increaseStock(
//         models,
//         {
//           productVariantId: item.productVariantId,
//           branchId: transfer.toBranchId,
//           quantity: item.quantity,
//           costPriceInBaseCurrency: 0, // Placeholder - needs real cost
//           userId,
//           refs: { relatedTransferId: transfer._id },
//         },
//         session
//       );
//     }

//     transfer.status = "completed";
//     transfer.receivedBy = userId;
//     transfer.receivedDate = new Date();
//     await transfer.save({ session });

//     return transfer;
//   }

//   /**
//    * Internal helper method to create a StockMovement audit record(s).
//    * @private
//    */
//   async _logMovement(models, movementData, session) {
//     const { StockMovement } = models;
//     const dataToLog = Array.isArray(movementData)
//       ? movementData
//       : [movementData];

//     const logs = dataToLog.map((data) => ({
//       productVariantId: data.productVariantId,
//       branchId: data.branchId,
//       inventoryItemId: data.inventoryItemId,
//       inventoryLotId: data.inventoryLotId,
//       type: data.type,
//       quantityChange: data.quantityChange,
//       costPriceInBaseCurrency: data.costPriceInBaseCurrency,
//       notes: data.notes,
//       userId: data.userId,
//       // relatedPurchaseId: data.refs.relatedPurchaseId,
//       ...data.refs,
//     }));

//     await StockMovement.insertMany(logs, { session, ordered: true });
//   }
// }

// // Export a singleton instance so the same service is used across the app.
// module.exports = new InventoryService();

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
    const variant = await ProductVariants.findById(productVariantId).populate("templateId").lean();
    if (!variant) throw new Error(`Product Variant with ID ${productVariantId} not found.`);

    const productType = variant.templateId.type;
    const movementType = refs.relatedSaleId ? "sale" : "transfer_out";
    let totalCostOfDeductedItems = 0;

    if (productType === "non-serialized") {
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
