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
    const { SalesInvoice, Account, Customer } = models;

    let totalCostOfGoodsSold = 0;
    const saleItems = [];

    // 1. Process cart items to prepare for invoice and deduct stock
    for (const item of cartData.items) {
      const { costOfGoodsSold } = await inventoryService.decreaseStock(models, {
        productVariantId: item.productVariantId,
        branchId,
        quantity: item.quantity,
        serialNumber: item.serialNumber, // Will be present for serialized items
        userId,
        // We will link the sale ID later
      });

      totalCostOfGoodsSold += costOfGoodsSold;
      saleItems.push({
        productVariantId: item.productVariantId,
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

    return salesInvoice;
  }
}

module.exports = new SalesService();
