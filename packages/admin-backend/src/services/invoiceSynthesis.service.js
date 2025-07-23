const mongoose = require("mongoose");
const salesService = require("./sales.service");
const inventoryService = require("./inventory.service");

/**
 * The InvoiceSynthesisService is the "automated billing department".
 * It is responsible for taking a completed repair job and synthesizing a
 * perfect, auditable SalesInvoice from it.
 */
class InvoiceSynthesisService {
  /**
   * Creates a final SalesInvoice from a completed RepairTicket.
   * @param {object} models - The tenant's compiled models.
   * @param {string} ticketId - The ID of the RepairTicket to invoice.
   * @param {string} userId - The ID of the user triggering the action (for auditing).
   * @param {object} session - The Mongoose session for the transaction.
   * @param {object} tenant - The full tenant object.
   * @returns {Promise<object>} The newly created SalesInvoice.
   */
  async createInvoiceFromRepair(models, { ticketId, userId }, session, tenant) {
    const { RepairTicket, RepairQuote, Asset } = models;
    const baseCurrency = tenant.settings.localization.baseCurrency;

    // 1. Fetch all necessary documents for synthesis.
    const ticket = await RepairTicket.findById(ticketId).session(session);
    if (!ticket || ticket.status !== "pickup_pending") {
      throw new Error("Invoice can only be created for tickets pending pickup.");
    }

    const approvedQuote = await RepairQuote.findOne({
      repairTicketId: ticketId,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .session(session);
    // A business rule could enforce that an approved quote is required.

    // 2. Synthesize the final cart data for the SalesService.
    // const cartData = {
    //   items: ticket.jobSheet.map((item) => ({
    //     productVariantId: item.productVariantId,
    //     description: item.description,
    //     quantity: item.quantity || item.laborHours,
    //     unitPrice: item.unitPrice || item.laborRate,
    //     lineDiscount: null, // Line discounts are already baked into the unitPrice from the quote
    //     isService: item.itemType !== "part",
    //     serialNumber: item.serialNumber,
    //     batchNumber: item.batchNumber,
    //     employeeId: item.employeeId,
    //     laborHours: item.laborHours,
    //     laborRate: item.laborRate,
    //   })),
    //   globalDiscount: approvedQuote?.globalDiscount || null,
    //   additionalCharges: approvedQuote?.additionalCharges || [],
    // };
    const cartData = {
      items: approvedQuote.lineItems.map((item) => {
        const itemType = item.itemType;
        const jobItem = ticket.jobSheet.find((x) => x.itemType === itemType && x.description === item.description);
        return {
          productVariantId: item.productVariantId,
          itemType: item.itemType,
          description: item.description,
          quantity: item.quantity || item.laborHours,
          unitPrice: item.unitPrice || item.laborRate,
          lineDiscount: null, // Line discounts are already baked into the unitPrice from the quote
          isService: item.itemType !== "part",
          serialNumber: item.serialNumber,
          batchNumber: item.batchNumber,
          employeeId: jobItem.employeeId,
          laborHours: jobItem.laborHours,
          laborRate: jobItem.laborRate,
        };
      }),

      troubleshootFee: approvedQuote?.troubleshootFee,
      totalGlobalDiscount: approvedQuote?.totalGlobalDiscount,
      totalTax: approvedQuote?.totalTax,
      grandTotal: approvedQuote?.grandTotal,
      globalDiscount: approvedQuote?.globalDiscount || null,
      additionalCharges: approvedQuote?.additionalCharges || [],
    };

    // Add the troubleshoot fee as a line item if it wasn't waived
    if (ticket.troubleshootFee?.status === "pending") {
      // This requires a "Troubleshoot Fee" service product to exist in the DB for perfect accounting.
      // For now, we add it as a custom charge.
      cartData.additionalCharges.push({
        description: "Troubleshooting & Diagnostic Fee",
        amount: ticket.troubleshootFee.amount,
      });
    }

    // 3. Call the main SalesService to create the invoice.
    const salesInvoice = await salesService.finalizeSale(
      models,
      {
        cartData,
        paymentData: { paymentLines: [] }, // No payment is made at this stage
        customerId: ticket.customerId,
        branchId: ticket.branchId,
        userId,
        couponId: null,
      },
      baseCurrency,
      tenant,
      session
    );

    // 4. Update the original repair ticket with the final invoice ID and pickup_pending it.
    ticket.finalInvoiceId = salesInvoice._id;
    ticket.status = "pickup_pending";
    await ticket.save({ session });

    // 5. Commit any reserved stock for this repair.
    for (const item of ticket.jobSheet) {
      if (item.itemType === "part") {
        await inventoryService.commitStockReservation(
          models,
          {
            productVariantId: item.productVariantId,
            branchId: ticket.branchId,
            quantity: item.quantity,
            serialNumber: item.serialNumber,
            refs: { repairTicketId: ticket._id },
            userId,
          },
          session
        );
      }
    }

    return salesInvoice;
  }
}

module.exports = new InvoiceSynthesisService();
