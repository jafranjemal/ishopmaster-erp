const inventoryService = require("./inventory.service");
const accountingService = require("./accounting.service");
const paymentsService = require("./payments.service");

class SalesService {
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
        // We will link the sale ID later after the invoice is created
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

    // 2. Create the Sales Invoice
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
      },
    ]);

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
        // Add tax account credit here if applicable
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

    return salesInvoice;
  }
}

module.exports = new SalesService();
