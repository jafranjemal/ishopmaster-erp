const { getRepairStatusUpdateTemplate } = require("../utils/email-templates/repair.templates");
const inventoryService = require("./inventory.service");
const mongoose = require("mongoose");
const notificationService = require("./notification.service");
const tokenService = require("./token.service");
const eventEmitter = require("../config/events");
const jobSchedulerService = require("./jobScheduler.service");

class RepairService {
  /**
   * Creates a new repair ticket.
   */
  async createTicket(models, { customerId, assets, qcTemplateId, ...intakeData }, userId, branchId, session) {
    const { Device, RepairTicket, Asset, ProductVariants } = models;

    const assetIds = [];

    for (const assetData of assets) {
      // 1. Try to find an existing asset with the same serial number
      let asset = await Asset.findOne({ serialNumber: assetData.serialNumber }).session(session);

      if (asset) {
        // If found, update its owner if necessary (e.g., if it was previously an internal device)
        asset.owner = { kind: "Customer", item: customerId };
        await asset.save({ session });
      } else {
        // 2. If not found, create a new Asset record
        asset = (
          await Asset.create(
            [
              {
                ...assetData,
                owner: { kind: "Customer", item: customerId },
                branchId: branchId, // The branch it was checked into at
              },
            ],
            { session }
          )
        )[0];
      }
      assetIds.push(asset._id);
    }

    if (assets.length > 0) {
      const primaryAssetData = assets[0];
      const variant = await ProductVariants.findById(primaryAssetData.productVariantId).populate("templateId").lean();
      if (variant && variant.templateId.defaultQcTemplateId) {
        defaultQcTemplateId = variant.templateId.defaultQcTemplateId;
      }
    }

    // --- Definitive Fix #1: Intelligently assign the default QC Template ---
    let finalQcTemplateId = qcTemplateId;

    // If no manual selection, try to find a smart default
    if (!finalQcTemplateId && primaryAssetDeviceId) {
      const device = await Device.findById(primaryAssetDeviceId).populate("templateId").lean();
      if (device && device.templateId && device.templateId.defaultQcTemplateId) {
        finalQcTemplateId = device.templateId.defaultQcTemplateId;
      }
    }

    const ticketData = {
      ...intakeData,
      customerId,
      assets: assetIds,
      customerComplaint: assets.map((a) => a.complaint).join("; "),
      createdBy: userId,
      branchId,
      qcTemplateId: finalQcTemplateId,
    };

    const [newTicket] = await RepairTicket.create([ticketData], { session });

    const portalToken = await tokenService.generateForRepairTicket(models, { ticket: newTicket });

    return { ticket: newTicket, portalToken };
  }

  /**
   * Flags a ticket for re-quoting, pausing active timers and updating status.
   */
  async flagForRequote(models, { ticketId, userId, notes }, session) {
    const { RepairTicket, LaborLog, RepairTicketHistory } = models;
    const ticket = await RepairTicket.findById(ticketId).session(session);

    if (!ticket) throw new Error("Repair ticket not found.");
    if (ticket.status !== "repair_active") {
      throw new Error(`Cannot flag for re-quote from status '${ticket.status}'.`);
    }

    // 1. Pause any active labor timers for this ticket
    const activeTimers = await LaborLog.find({ repairTicketId: ticketId, status: "in_progress" }).session(session);
    for (const timer of activeTimers) {
      // This is a simplified pause. A full implementation would call a dedicated timeTrackingService method.
      timer.endTime = new Date();
      timer.status = "paused";
      await timer.save({ session });
    }

    const previousStatus = ticket.status;
    // 2. Update ticket status to 'on_hold_pending_re_quote'
    ticket.status = "on_hold_pending_re_quote";
    ticket.requoteNeededInfo = {
      reason: notes,
      flaggedBy: userId,
      flaggedAt: new Date(),
    };

    await ticket.save({ session });

    // 3. Create an audit log for this specific action
    await RepairTicketHistory.create(
      [
        {
          ticketId: ticket._id,
          previousStatus,
          newStatus: ticket.status,
          changedBy: userId,
          notes: `Flagged for re-quote. Reason: ${notes}`,
        },
      ],
      { session }
    );

    // In a real system, this would also emit an event to notify the service advisor.

    return ticket;
  }

  /**
   * Adds "After Repair" photos to a repair ticket.
   * @param {string} ticketId - The ID of the ticket to update.
   * @param {Array<object>} photos - Array of photo objects ({ url, public_id }).
   */
  async addAfterPhotos(models, { ticketId, photos }, session) {
    const { RepairTicket } = models;
    const ticket = await RepairTicket.findById(ticketId).session(session);
    if (!ticket) throw new Error("Repair ticket not found.");

    // Append new photos to the existing array
    ticket.afterImages.push(...photos);

    await ticket.save({ session });
    return ticket;
  }

  /**
   * Adds an item (part or service) to a repair ticket's job sheet.
   * If the item is a physical part, it deducts it from inventory.
   */
  async addItemToJobSheet(models, { ticketId, itemData, userId }) {
    const { RepairTicket, ProductVariants } = models;
    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) throw new Error("Repair ticket not found.");

    const variant = await ProductVariants.findById(itemData.ProductVariantsId).lean();
    if (!variant) throw new Error("Product/Service not found.");

    // If the item is a physical part, deduct from stock
    if (itemData.itemType === "part") {
      await inventoryService.decreaseStock(models, {
        ProductVariantsId: itemData.ProductVariantsId,
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
        ProductVariantsId: itemToRemove.ProductVariantsId,
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
  async updateTicketStatusOld(models, { ticketId, newStatus, assignedToUserId }) {
    const { RepairTicket } = models;
    const ticket = await RepairTicket.findById(ticketId);
    if (!ticket) throw new Error("Repair ticket not found.");

    ticket.status = newStatus;
    if (assignedToUserId) {
      ticket.assignedTo = assignedToUserId;
    }
    // Add logic here to trigger notifications in the future

    await ticket.save();

    // --- 2. THE DEFINITIVE INTEGRATION ---
    try {
      // We need to populate customer details to get their email
      const populatedTicket = await ticket.populate("customerId", "name email");
      const emailTemplate = getRepairStatusUpdateTemplate(populatedTicket);

      if (emailTemplate && populatedTicket.customerId.email) {
        await notificationService.sendEmail({
          to: populatedTicket.customerId.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      }
    } catch (error) {
      // Log the notification error, but do not fail the entire operation.
      console.error(`Failed to send status update notification for ticket ${ticketId}:`, error);
    }
    // --- END OF INTEGRATION ---

    return ticket;
  }

  /**
   * Updates the status of a repair ticket and creates an audit log entry.
   */
  async updateTicketStatus(models, { ticketId, newStatus, userId }, session) {
    const { RepairTicket, RepairTicketHistory, RepairQuote } = models;

    const ticket = await RepairTicket.findById(ticketId).session(session);
    if (!ticket) throw new Error("Repair ticket not found.");

    if (newStatus === "repair_active") {
      const approvedQuote = await RepairQuote.findOne({
        repairTicketId: ticketId,
        status: "approved",
      }).session(session);
      if (!approvedQuote) {
        throw new Error("Cannot start repair. A customer-approved quotation is required.");
      }
    }

    const previousStatus = ticket.status;

    // Set the new status. The pre-save hook on the schema will validate this transition.
    ticket.status = newStatus;
    await ticket.save({ session });

    // --- THE DEFINITIVE FIX: CREATE AUDIT TRAIL RECORD ---
    await RepairTicketHistory.create(
      [
        {
          ticketId: ticket._id,
          previousStatus: previousStatus,
          newStatus: newStatus,
          changedBy: userId,
        },
      ],
      { session }
    );
    // --- END OF FIX ---

    // In a future chapter, this is where we would trigger the NotificationService

    try {
      const populatedTicket = await RepairTicket.findById(ticket._id)
        .populate("customerId", "name email phone")
        .populate({
          path: "assignedTo",
          select: "firstName lastName contactInfo",
          populate: { path: "userId", select: "email" }, // Assuming user has email
        })
        .lean();

      // Announce the event. The NotificationService will handle the rest.
      await notificationService.triggerNotification(models, `repair.status_changed.${newStatus}`, { ticket: populatedTicket });
    } catch (error) {
      // Log the notification error, but do not fail the entire transaction.
      console.error(`Failed to trigger notification for ticket ${ticketId}:`, error);
    }

    return ticket;
  }

  /**
   * Adds an item (part or service) to a repair ticket's job sheet.
   * It reserves stock for parts and creates a version history of the change.
   */
  async addItemToServiceJobSheet(models, { ticketId, itemData, userId }, session) {
    const { RepairTicket, ProductVariants, Employee } = models;
    const ticket = await RepairTicket.findById(ticketId).session(session);
    if (!ticket) throw new Error("Repair ticket not found.");

    // --- Definitive Fix #1: Defensive programming - ensure history array exists ---
    if (!ticket.jobSheetHistory) {
      ticket.jobSheetHistory = [];
    }
    // 1. Create a historical snapshot before making changes.
    ticket.jobSheetHistory.push({ items: ticket.jobSheet, createdBy: userId });
    console.log("itemData ", itemData);

    const newItemData = { ...itemData };
    // --- THE DEFINITIVE FIX: TYPE-AWARE LOGIC ---
    if (newItemData.itemType === "part" || newItemData.itemType === "service") {
      // Logic for physical parts and billable services from the product catalog
      if (!newItemData.productVariantId) throw new Error("ProductVariantId is required for parts and services.");

      const variant = await ProductVariants.findById(newItemData.productVariantId).populate("templateId").lean();
      if (!variant) throw new Error("Product variant for job sheet not found.");

      // Reserve stock only if it's a physical part
      const isPhysicalPart = ["part", "serialized", "non-serialized"].includes(variant.templateId.type);
      if (isPhysicalPart) {
        await inventoryService.reserveStock(
          models,
          {
            productVariantId: variant._id,
            branchId: ticket.branchId,
            quantity: newItemData.quantity,
            serialNumber: newItemData.serialNumber,
            refs: { repairTicketId: ticket._id, ticketNumber: ticket.ticketNumber },
            userId,
          },
          session
        );
      }

      newItemData.unitPrice = variant.sellingPrice;
      newItemData.costPrice = variant.costPriceInBaseCurrency || 0;
    } else if (newItemData.itemType === "labor") {
      // Logic for labor charges, linked to an employee
      if (!newItemData.employeeId) throw new Error("EmployeeId is required for labor entries.");

      const employee = await Employee.findById(newItemData.employeeId).lean();
      if (!employee) throw new Error("Employee for labor entry not found.");

      // For labor, the unit price is the rate, and quantity is the hours
      newItemData.unitPrice = newItemData.laborRate || 0;
      newItemData.costPrice = employee.compensation?.billRate || 0; // Use the employee's cost rate
    } else {
      throw new Error(`Invalid itemType: ${newItemData.itemType}`);
    }

    // 3. Add the new item to the current job sheet.
    ticket.jobSheet.push(newItemData);

    await ticket.save({ session });
    return ticket;
  }

  /**
   * Removes an item from a repair ticket's job sheet.
   * It releases any stock reservation and creates a version history.
   */
  /**
   * Removes an item from a repair ticket's job sheet.
   */
  async removeItemFromJobSheet(models, { ticketId, jobSheetItemId, userId }, session) {
    const { RepairTicket } = models;
    const ticket = await RepairTicket.findById(ticketId).session(session);
    if (!ticket) throw new Error("Repair ticket not found.");

    const itemToRemove = ticket.jobSheet.find((item) => item.description === jobSheetItemId);

    if (!itemToRemove) throw new Error("Job sheet item not found.");

    if (!ticket.jobSheetHistory) ticket.jobSheetHistory = [];
    ticket.jobSheetHistory.push({ items: ticket.jobSheet, createdBy: userId });

    if (itemToRemove.itemType === "part") {
      await inventoryService.releaseStockReservation(
        models,
        {
          productVariantId: itemToRemove.productVariantId,
          branchId: ticket.branchId,
          quantity: itemToRemove.quantity,
          serialNumber: itemToRemove.serialNumber,
          refs: { repairTicketId: ticket._id, ticketNumber: ticket.ticketNumber },
          userId,
        },
        session
      );
    }

    // Remove the item by filtering it out
    ticket.jobSheet = ticket.jobSheet.filter((item) => item.description !== jobSheetItemId);

    await ticket.save({ session });
    return ticket;
  }

  /**
   * Submits the results of a Quality Control check for a repair ticket.
   * Updates the ticket's main status based on the QC result.
   */
  async submitQcCheck(models, { ticketId, qcData, userId }, session, tenant) {
    const { RepairTicket } = models;
    const ticket = await RepairTicket.findById(ticketId).session(session);

    if (!ticket) throw new Error("Repair ticket not found.");
    if (ticket.status !== "qc_pending") {
      throw new Error(`Cannot submit QC for a ticket with status '${ticket.status}'.`);
    }

    // Attach the user who performed the check
    const finalQcData = { ...qcData, checkedBy: userId, checkedAt: new Date() };

    // Save the detailed results to the ticket
    ticket.qcResult = finalQcData;

    // --- Definitive Fix #1: Update ticket status based on QC outcome ---
    if (finalQcData.status === "pass") {
      ticket.status = "pickup_pending";
    } else {
      // If QC fails, it goes back to the technician for rework.
      ticket.status = "repair_active";
    }

    await ticket.save({ session });

    // Create an audit log entry for the QC submission
    await models.RepairTicketHistory.create(
      [
        {
          ticketId: ticket._id,
          previousStatus: "qc_pending",
          newStatus: ticket.status,
          changedBy: userId,
          notes: `QC Submitted: ${finalQcData.status}. ${finalQcData.notes || ""}`.trim(),
        },
      ],
      { session }
    );

    if (ticket.status === "pickup_pending") {
      eventEmitter.emit("repair.qc_passed", { models, ticket, userId, session, tenant });
    }

    return ticket;
  }

  /**
   * Updates the status of the troubleshoot fee on a repair ticket.
   * Creates an audit trail for this financial action.
   */
  async updateTroubleshootFeeStatus(models, { ticketId, newStatus, userId }, session) {
    const { RepairTicket, RepairTicketHistory } = models;
    const ticket = await RepairTicket.findById(ticketId).session(session);
    if (!ticket) throw new Error("Repair ticket not found.");

    if (!["pending", "waived", "paid"].includes(newStatus)) {
      throw new Error("Invalid status for troubleshoot fee.");
    }

    const previousStatus = ticket.troubleshootFee.status;
    ticket.troubleshootFee.status = newStatus;

    // If waived, the amount should be zeroed out.
    if (newStatus === "waived") {
      ticket.troubleshootFee.amount = 0;
    }

    await ticket.save({ session });

    // Create an audit log for this specific action
    await RepairTicketHistory.create(
      [
        {
          ticketId: ticket._id,
          previousStatus: ticket.status, // The main ticket status hasn't changed
          newStatus: ticket.status,
          changedBy: userId,
          notes: `Troubleshoot fee status changed from '${previousStatus}' to '${newStatus}'.`,
        },
      ],
      { session }
    );

    return ticket;
  }

  /**
   * Updates the core, non-status details of a repair ticket.
   * @param {string} ticketId - The ID of the ticket to update.
   * @param {object} updateData - The fields to update (e.g., customerComplaint).
   */
  async updateTicketDetails(models, { ticketId, updateData }, session) {
    const { RepairTicket } = models;
    const ticket = await RepairTicket.findById(ticketId).session(session);
    if (!ticket) throw new Error("Repair ticket not found.");

    // For now, we only allow editing a few safe fields.
    // More complex edits would require their own services.
    if (updateData.customerComplaint) {
      ticket.customerComplaint = updateData.customerComplaint;
    }
    // Add other editable fields here, e.g., notes

    await ticket.save({ session });
    return ticket;
  }

  /**
   * Deletes a repair ticket, but only if it's in a safe state to do so.
   * @param {string} ticketId - The ID of the ticket to delete.
   */
  async deleteTicket(models, { ticketId }, session) {
    const { RepairTicket } = models;
    const ticket = await RepairTicket.findById(ticketId).session(session);
    if (!ticket) throw new Error("Repair ticket not found.");

    // --- Definitive Fix #1: CRITICAL SAFETY CHECK ---
    // Only allow deletion of tickets that have not been processed.
    const safeToDeleteStatuses = ["intake", "cancelled"];
    if (!safeToDeleteStatuses.includes(ticket.status)) {
      throw new Error(`Cannot delete. This ticket is in an active or completed state ('${ticket.status}').`);
    }
    // --- End of Fix ---

    await ticket.deleteOne({ session });
    return { message: `Ticket ${ticket.ticketNumber} has been permanently deleted.` };
  }

  /**
   * Handles the post-payment workflow for a repair ticket.
   * This is triggered by a 'payment.completed' event.
   * This definitive version creates an audit trail and triggers customer notifications.
   */
  async handleInvoicePayment(models, { repairTicketId }, session) {
    const { RepairTicket, RepairTicketHistory, SalesInvoice } = models;

    const ticket = await RepairTicket.findById(repairTicketId).session(session);
    if (!ticket) {
      console.error(`[RepairService] handleInvoicePayment: Could not find ticket with ID ${repairTicketId}.`);
      return; // Fail gracefully if ticket not found
    }

    const invoice = await SalesInvoice.findById(ticket.finalInvoiceId).session(session);
    if (!invoice) {
      console.error(`[RepairService] handleInvoicePayment: Could not find linked invoice for ticket ${ticket.ticketNumber}.`);
      return;
    }

    console.log("ticket.status ====>>> ", ticket.status);

    //await ticket.save({ session });

    // --- Definitive Fix #1: Create a detailed audit trail record ---
    // Log that the financial part of this transaction is complete.
    await RepairTicketHistory.create(
      [
        {
          ticketId: ticket._id,
          previousStatus: ticket.status,
          newStatus: ticket.status, // The status doesn't change yet
          changedBy: invoice.soldBy, // The user who processed the payment
          notes: `Payment for final invoice #${invoice.invoiceId} was completed.`,
        },
      ],
      { session }
    );

    // --- Definitive Fix #2: Trigger the "Ready for Pickup" notification ---
    // The ticket is now financially cleared and ready for the customer.
    try {
      const populatedTicket = await RepairTicket.findById(ticket._id).populate("customerId", "name email phone").populate("assets").lean();
      console.log("repair.ready_for_pickup is called ===>>>>>>>>>>>>>>>>>>>");
      // Announce a new, specific event. The NotificationService will handle the rest.
      await notificationService.triggerNotification(models, `repair.ready_for_pickup`, { ticket: populatedTicket });
    } catch (error) {
      console.error(`Failed to trigger 'ready_for_pickup' notification for ticket ${ticketId}:`, error);
      // Do not fail the main transaction if notification fails.
    }

    console.log(`Service-related payment for ticket ${ticket.ticketNumber} processed. Customer has been notified for pickup.`);

    return true;
  }

  /**
   * Confirms the physical pickup of a device by the customer.
   * This is the final step in the repair lifecycle, moving the ticket to 'closed'.
   */
  async confirmDevicePickup(models, { ticketId, userId }, session) {
    const { RepairTicket, RepairTicketHistory } = models;
    const ticket = await RepairTicket.findById(ticketId).session(session);

    if (!ticket) {
      throw new Error("Repair ticket not found.");
    }

    // --- Definitive Fix #1: CRITICAL SAFETY CHECK ---
    // Ensure the ticket is in the correct state for this action.
    if (ticket.status !== "pickup_pending") {
      throw new Error(`Cannot confirm pickup. Ticket is in status '${ticket.status}', not 'pickup_pending'.`);
    }

    const previousStatus = ticket.status;
    ticket.status = "closed";
    await ticket.save({ session });

    // Create the final audit log entry for the job.
    await RepairTicketHistory.create(
      [
        {
          ticketId: ticket._id,
          previousStatus: previousStatus,
          newStatus: ticket.status,
          changedBy: userId,
          notes: `Device pickup confirmed by cashier. Job is now closed.`,
        },
      ],
      { session }
    );

    // In a future chapter, this would emit a `repair.closed` event for post-service follow-ups.
    try {
      const scheduleDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
      await jobSchedulerService.scheduleJob("send-post-service-feedback", scheduleDate, {
        ticketId: ticket._id,
        tenantDbName: tenant.dbName, // Pass the tenant DB name for the job runner
      });
    } catch (error) {
      // Log the scheduling error, but do not fail the main transaction.
      console.error(`Failed to schedule follow-up for ticket ${ticketId}:`, error);
    }
    return ticket;
  }
}

module.exports = new RepairService();
