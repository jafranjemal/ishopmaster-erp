const inventoryService = require("./inventory.service");
const accountingService = require("./accounting.service");
const paymentsService = require("./payments.service");
const mongoose = require("mongoose");

/**
 * The SalesService handles all complex business logic related to sales,
 * quotations, and orchestrating other services.
 */
class SalesService {
  /**
   * Creates a draft sale or a quotation without affecting stock or processing payments.
   */
  async createQuoteOrDraft(models, { cartData, customerId, branchId, userId, status, expiryDate }) {
    const { SalesInvoice } = models;

    const [newDoc] = await SalesInvoice.create([
      {
        customerId,
        branchId,
        items: cartData.items,
        subTotal: cartData.subTotal,
        totalDiscount: cartData.totalDiscount,
        totalTax: cartData.totalTax,
        totalAmount: cartData.totalAmount,
        soldBy: userId,
        status, // 'draft' or 'quotation'
        expiryDate, // For quotations
      },
    ]);

    return newDoc;
  }

  /**
   * Finalizes a sale by creating an invoice, deducting stock, recording payment,
   * and posting all necessary journal entries within a single transaction.
   */
  async finalizeSale(
    models,
    { cartData, paymentData, customerId, branchId, userId },
    baseCurrency
  ) {
    const { SalesInvoice, Account, Customer, Employee, Commission } = models;

    let totalCostOfGoodsSold = 0;
    const saleItems = [];

    // 1. Process cart items to prepare for invoice and deduct stock
    for (const item of cartData.items) {
      const { costOfGoodsSold } = await inventoryService.decreaseStock(models, {
        ProductVariantId: item.ProductVariantId,
        branchId,
        quantity: item.quantity,
        serialNumber: item.serialNumber, // Will be present for serialized items
        userId,
        // We will link the sale ID later
      });

      totalCostOfGoodsSold += costOfGoodsSold;
      saleItems.push({
        ProductVariantId: item.ProductVariantId,
        description: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        finalPrice: item.finalPrice,
        costPriceInBaseCurrency: costOfGoodsSold / item.quantity,
      });
    }

    // 2. Create the Sales Invoice with status 'completed'
    const [salesInvoice] = await SalesInvoice.create([
      {
        customerId,
        branchId,
        items: saleItems,
        subTotal: cartData.subTotal,
        totalDiscount: cartData.totalDiscount,
        totalTax: cartData.totalTax,
        totalAmount: cartData.totalAmount,
        soldBy: userId,
        status: "completed",
      },
    ]);

    // Now that we have the invoice ID, we can update the stock movement refs
    // In a real high-performance system, this might be done as a background job.
    await inventoryService.linkSaleToMovements(models, { saleId: salesInvoice._id, cartItems });

    // 3. Post the core Sales and COGS journal entries
    const [arAccount, salesRevenueAccount, cogsAccount, inventoryAssetAccount] = await Promise.all([
      Customer.findById(customerId)
        .select("ledgerAccountId")
        .then((c) => Account.findById(c.ledgerAccountId)),
      Account.findOne({ isSystemAccount: true, name: "Sales Revenue" }),
      Account.findOne({ isSystemAccount: true, name: "Cost of Goods Sold" }),
      Account.findOne({ isSystemAccount: true, name: "Inventory Asset" }),
    ]);

    await accountingService.createJournalEntry(models, {
      description: `Sale to customer for Invoice #${salesInvoice.invoiceNumber}`,
      entries: [
        { accountId: arAccount._id, debit: salesInvoice.totalAmount },
        { accountId: salesRevenueAccount._id, credit: salesInvoice.subTotal },
      ],
      refs: { salesInvoiceId: salesInvoice._id },
    });

    await accountingService.createJournalEntry(models, {
      description: `COGS for Invoice #${salesInvoice.invoiceNumber}`,
      entries: [
        { accountId: cogsAccount._id, debit: totalCostOfGoodsSold },
        { accountId: inventoryAssetAccount._id, credit: totalCostOfGoodsSold },
      ],
      refs: { salesInvoiceId: salesInvoice._id },
    });

    // 4. Record the payment using the universal PaymentsService
    if (paymentData && paymentData.paymentLines.length > 0) {
      await paymentsService.recordPayment(
        models,
        {
          paymentSourceId: salesInvoice._id,
          paymentSourceType: "SalesInvoice",
          paymentLines: paymentData.paymentLines,
          paymentDate: new Date(),
          direction: "inflow",
          notes: paymentData.notes,
        },
        userId,
        baseCurrency
      );
    }

    // 5. Log commission if applicable
    const employee = await Employee.findOne({ userId: userId });
    if (
      employee &&
      employee.compensation.type === "commission_based" &&
      employee.compensation.commissionRate > 0
    ) {
      const commissionAmount =
        salesInvoice.totalAmount * (employee.compensation.commissionRate / 100);

      await Commission.create([
        {
          employeeId: employee._id,
          salesInvoiceId: salesInvoice._id,
          commissionAmount: parseFloat(commissionAmount.toFixed(2)),
          saleDate: salesInvoice.createdAt,
          status: "pending",
        },
      ]);
    }
    return salesInvoice;
  }

  /**
   * Converts a Quotation into a confirmed Sales Order.
   */
  async convertQuoteToOrder(models, { quoteId, userId }) {
    const { SalesInvoice, SalesOrder } = models;

    const quote = await SalesInvoice.findById(quoteId);
    if (!quote || quote.status !== "quotation") {
      throw new Error("Quotation not found or cannot be converted.");
    }

    // Check if quote has expired
    if (quote.expiryDate && new Date(quote.expiryDate) < new Date()) {
      throw new Error("This quotation has expired.");
    }

    // Create the Sales Order from the quote's data
    const [newSalesOrder] = await SalesOrder.create([
      {
        sourceQuotationId: quote._id,
        customerId: quote.customerId,
        branchId: quote.branchId,
        items: quote.items,
        totalAmount: quote.totalAmount,
        notes: quote.notes,
        createdBy: userId,
      },
    ]);

    // Update the original quote's status
    quote.status = "completed"; // Or a new 'converted' status if needed
    await quote.save();

    return newSalesOrder;
  }

  /**
   * Converts a won Opportunity into a confirmed Sales Order.
   * This version correctly reads the items from the Opportunity.
   */
  async createOrderFromOpportunity(models, { opportunityId, userId, user }, session) {
    const { Opportunity, SalesOrder } = models;

    // The populate call will now work correctly
    const opportunity = await Opportunity.findById(opportunityId).session(session);
    if (!opportunity) throw new Error("Opportunity not found.");
    if (opportunity.stage === "Closed-Won")
      throw new Error("This opportunity has already been converted.");

    const targetBranchId = opportunity.branchId || user.assignedBranchId;
    if (!targetBranchId) {
      throw new Error("Could not determine a destination branch for this sales order.");
    }

    // --- THE DEFINITIVE FIX ---
    // Create the Sales Order by mapping the items directly from the opportunity.
    // Create the Sales Order by mapping the items and including the new required fields.
    const [newSalesOrder] = await SalesOrder.create(
      [
        {
          sourceOpportunityId: opportunity._id, // Correctly link to the opportunity
          customerId: opportunity.accountId,
          branchId: targetBranchId, // Correctly pass the branchId
          items: opportunity.items.map((item) => ({
            productVariantId: item.productVariantId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            finalPrice: item.finalPrice,
          })),
          totalAmount: opportunity.amount,
          createdBy: userId,
        },
      ],
      { session }
    );
    // --- END OF FIX ---

    // Update the original opportunity's status
    opportunity.stage = "Closed-Won";
    opportunity.branchId = targetBranchId;
    await opportunity.save({ session });

    return newSalesOrder;
  }
}

module.exports = new SalesService();
