const inventoryService = require("./inventory.service")
const accountingService = require("./accounting.service")
const paymentsService = require("./payments.service")

class ReturnsService {
  async processReturnOld(models, { returnData, userId, branchId }, session, tenant) {
    const { RMA, SalesInvoice, Account, RefundVoucher } = models

    const originalInvoice = await SalesInvoice.findById(returnData.originalInvoiceId).session(session)
    if (!originalInvoice) throw new Error("Original sales invoice not found.")
    // Add more validation here (e.g., check if items were on the original invoice)

    const rmaData = { ...returnData, processedBy: userId, branchId }
    const [newRma] = await RMA.create([rmaData], { session })

    for (const item of newRma.items) {
      // Cost needs to be fetched from original sale for perfect accuracy
      const originalItem = originalInvoice.items.find((i) => i.productVariantId.equals(item.productVariantId))
      await inventoryService.increaseStock(
        models,
        {
          productVariantId: item.productVariantId,
          branchId: newRma.branchId,
          quantity: item.quantityReturned,
          costPriceInBaseCurrency: originalItem?.costPriceInBaseCurrency || 0,
          batchNumber: `RETURN-RMA-${newRma.rmaNumber}`,
          type: "return",
        },
        session
      )
    }

    const [arAccount, salesReturnAccount] = await Promise.all([
      Account.findById(originalInvoice.customerId.ledgerAccountId).session(session),
      Account.findOne({ isSystemAccount: true, name: "Sales Returns & Allowances" }).session(session),
    ])

    await accountingService.createJournalEntry(
      models,
      {
        description: `Sales Return for RMA #${newRma.rmaNumber}`,
        entries: [
          { accountId: salesReturnAccount._id, debit: newRma.totalRefundAmount },
          { accountId: arAccount._id, credit: newRma.totalRefundAmount },
        ],
        currency: tenant.settings.localization.baseCurrency,
        exchangeRateToBase: 1,
        refs: { rmaId: newRma._id },
      },
      session,
      tenant
    )

    if (returnData.resolution.type !== "store_credit") {
      const payment = await paymentsService.recordPayment(
        models,
        {
          paymentSourceId: newRma._id,
          paymentSourceType: "RMA",
          paymentLines: [
            {
              paymentMethodId: returnData.resolution.paymentMethodId,
              amount: newRma.totalRefundAmount,
            },
          ],
          direction: "outflow",
        },
        userId,
        tenant.settings.localization.baseCurrency,
        session,
        tenant
      )
      newRma.resolution.paymentId = payment._id
    } else {
      const [voucher] = await RefundVoucher.create(
        [
          {
            initialAmount: newRma.totalRefundAmount,
            currentBalance: newRma.totalRefundAmount,
            customerId: newRma.customerId,
            issuedOnRmaId: newRma._id,
          },
        ],
        { session }
      )
      newRma.resolution.voucherId = voucher._id
    }
    await newRma.save({ session })
    return newRma
  }

  /**
   * Processes a complete return, including inventory updates,
   * financial reversals, and refund generation.
   */
  async processReturn(models, { invoiceId, itemsToReturn, refundMethod, userId }, session, tenant) {
    const { SalesInvoice, RMA, CreditNote, Account, Customer } = models

    // 1. Validate the original invoice
    const originalInvoice = await SalesInvoice.findById(invoiceId).session(session)
    if (!originalInvoice) throw new Error("Original sales invoice not found.")

    let totalRefundAmount = 0
    const returnedItems = []

    // 2. Validate and calculate totals for the items being returned
    for (const returnItem of itemsToReturn) {
      const originalItem = originalInvoice.items.find((item) => item.productVariantId.equals(returnItem.productVariantId))
      if (!originalItem) throw new Error(`Item ${returnItem.description} not found on original invoice.`)
      // In a real system, you'd check if the quantity being returned is valid.

      const refundAmountForItem = originalItem.finalPrice * returnItem.quantity
      totalRefundAmount += refundAmountForItem
      returnedItems.push({
        productVariantId: returnItem.productVariantId,
        quantity: returnItem.quantity,
        reason: returnItem.reason,
        unitPrice: originalItem.finalPrice, // Price at time of sale
      })

      // 3. Put the item back into inventory
      await inventoryService.increaseStock(
        models,
        {
          productVariantId: returnItem.productVariantId,
          branchId: originalInvoice.branchId,
          quantity: returnItem.quantity,
          costPriceInBaseCurrency: originalItem.costPriceInBaseCurrency,
          userId,
          refs: { rma: true, originalInvoiceId: originalInvoice._id },
        },
        session
      )
    }

    // 4. Create the official RMA document
    const [newRma] = await RMA.create(
      [
        {
          originalSalesInvoiceId: invoiceId,
          customerId: originalInvoice.customerId,
          branchId: originalInvoice.branchId,
          items: returnedItems,
          totalRefundAmount,
          refundMethod,
          processedBy: userId,
          status: "completed",
        },
      ],
      { session }
    )

    // 5. Post the reversing financial journal entry
    const customer = await Customer.findById(originalInvoice.customerId).session(session)
    const [salesReturnsAccount, arAccount] = await Promise.all([
      Account.findOne({ isSystemAccount: true, name: "Sales Returns and Allowances" }).session(session),
      Account.findById(customer.ledgerAccountId).session(session),
    ])
    if (!salesReturnsAccount || !arAccount) throw new Error("Financial accounts for returns are not configured.")

    await accountingService.createJournalEntry(
      models,
      {
        description: `Return for Invoice #${originalInvoice.invoiceId}`,
        entries: [
          { accountId: salesReturnsAccount._id, debit: totalRefundAmount },
          { accountId: arAccount._id, credit: totalRefundAmount },
        ],
        currency: tenant.settings.localization.baseCurrency,
        refs: { rmaId: newRma._id, salesInvoiceId: originalInvoice._id },
      },
      session,
      tenant
    )

    // 6. Process the refund
    if (refundMethod === "credit_note") {
      const newCreditNote = await CreditNote.create(
        [
          {
            customerId: originalInvoice.customerId,
            initialAmount: totalRefundAmount,
            currentBalance: totalRefundAmount,
            originalRmaId: newRma._id,
            code: `CN-${Date.now()}`, // Simple unique code generation
          },
        ],
        { session }
      )
      newRma.creditNoteId = newCreditNote._id
    } else {
      // Logic for cash/card refunds would call the PaymentsService
      // This is a complex workflow that would be built out here.
    }

    await newRma.save({ session })
    return newRma
  }
}
module.exports = new ReturnsService()
