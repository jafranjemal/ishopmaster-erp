const inventoryService = require("./inventory.service");
const accountingService = require("./accounting.service");
const paymentsService = require("./payments.service");

class ReturnsService {
  async processReturn(models, { returnData, userId, branchId }, session, tenant) {
    const { RMA, SalesInvoice, Account, RefundVoucher } = models;

    const originalInvoice = await SalesInvoice.findById(returnData.originalInvoiceId).session(
      session
    );
    if (!originalInvoice) throw new Error("Original sales invoice not found.");
    // Add more validation here (e.g., check if items were on the original invoice)

    const rmaData = { ...returnData, processedBy: userId, branchId };
    const [newRma] = await RMA.create([rmaData], { session });

    for (const item of newRma.items) {
      // Cost needs to be fetched from original sale for perfect accuracy
      const originalItem = originalInvoice.items.find((i) =>
        i.productVariantId.equals(item.productVariantId)
      );
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
      );
    }

    const [arAccount, salesReturnAccount] = await Promise.all([
      Account.findById(originalInvoice.customerId.ledgerAccountId).session(session),
      Account.findOne({ isSystemAccount: true, name: "Sales Returns & Allowances" }).session(
        session
      ),
    ]);

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
    );

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
      );
      newRma.resolution.paymentId = payment._id;
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
      );
      newRma.resolution.voucherId = voucher._id;
    }
    await newRma.save({ session });
    return newRma;
  }
}
module.exports = new ReturnsService();
