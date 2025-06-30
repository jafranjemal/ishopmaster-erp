const inventoryService = require("./inventory.service");
const mongoose = require("mongoose");

class RepairService {
  /**
   * Creates a new repair ticket.
   */
  async createTicket(models, data, userId, branchId) {
    const { RepairTicket } = models;
    const newTicket = await RepairTicket.create({ ...data, createdBy: userId, branchId });
    return newTicket;
  }

  /**
   * Adds an item (part or service) to a repair ticket's job sheet.
   * If the item is a physical part, it deducts it from inventory.
   */
  async addItemToJobSheet(models, { ticketId, itemData, userId }) {
    const { RepairTicket, ProductVariant } = models;
    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) throw new Error("Repair ticket not found.");

    const variant = await ProductVariant.findById(itemData.productVariantId).lean();
    if (!variant) throw new Error("Product/Service not found.");

    // If the item is a physical part, deduct from stock
    if (itemData.itemType === "part") {
      await inventoryService.decreaseStock(models, {
        productVariantId: itemData.productVariantId,
        branchId: ticket.branchId,
        quantity: itemData.quantity,
        serialNumber: itemData.serialNumber, // For serialized parts
        userId,
        refs: { relatedRepairId: ticket._id },
      });
    }

    const jobSheetItem = {
      ...itemData,
      description: variant.variantName,
      costPrice: variant.costPrice || 0, // Get cost price from variant
    };

    ticket.jobSheet.push(jobSheetItem);
    await ticket.save();
    return ticket;
  }

  /**
   * Removes an item from a job sheet.
   * If the item was a physical part, it adds it back to inventory.
   */
  async removeJobSheetItem(models, { ticketId, jobSheetItemId, userId }) {
    const { RepairTicket } = models;
    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) throw new Error("Repair ticket not found.");

    const itemToRemove = ticket.jobSheet.id(jobSheetItemId);
    if (!itemToRemove) throw new Error("Job sheet item not found.");

    // If the removed item was a physical part, add it back to stock
    if (itemToRemove.itemType === "part") {
      await inventoryService.increaseStock(models, {
        productVariantId: itemToRemove.productVariantId,
        branchId: ticket.branchId,
        quantity: itemToRemove.quantity,
        costPriceInBaseCurrency: itemToRemove.costPrice,
        // This creates a new lot/item, which is a simplification.
        // A more complex system might link back to the original lot.
        batchNumber: `RETURN-REPAIR-${ticket.ticketNumber}`,
        userId,
        refs: { relatedRepairId: ticket._id },
      });
    }

    itemToRemove.remove();
    await ticket.save();
    return ticket;
  }

  /**
   * Updates the status of a repair ticket.
   */
  async updateTicketStatus(models, { ticketId, newStatus, assignedToUserId }) {
    const { RepairTicket } = models;
    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) throw new Error("Repair ticket not found.");

    ticket.status = newStatus;
    if (assignedToUserId) {
      ticket.assignedTo = assignedToUserId;
    }
    // Add logic here to trigger notifications in the future

    await ticket.save();
    return ticket;
  }
}

module.exports = new RepairService();
