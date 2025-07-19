const inventoryService = require("./inventory.service");
const accountingService = require("./accounting.service");
const paymentsService = require("./payments.service");
const mongoose = require("mongoose");
const couponService = require("./coupon.service");
const taxService = require("./tax.service");
const pricingService = require("./pricing.service");
const salesCalculationService = require("./salesCalculation.service");
const { ERPComplianceError } = require("../errors/erpComplianceError");

/**
 * The SalesService handles all complex business logic related to sales,
 * quotations, and orchestrating other services.
 */
class SalesService {
  /**
   * Creates a draft sale or a quotation without affecting stock or processing payments.
   */
  async createQuoteOrDraft(models, params) {
    const { SalesInvoice } = models;

    // Destructure parameters safely
    const { cartData, customerId, branchId, userId, status, expiryDate } = params || {};

    // Add null checks and default values
    if (!cartData) throw new Error("cartData is required");
    if (!cartData.items) throw new Error("cartData.items is required");

    const [newDoc] = await SalesInvoice.create([
      {
        customerId,
        branchId,
        items: cartData.items,
        subTotal: cartData.subTotal || 0,
        totalDiscount: cartData.totalDiscount || 0,
        totalTax: cartData.totalTax || 0,
        totalAmount: cartData.totalAmount || cartData.grandTotal || 0,
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
    { cartData, paymentData, customerId, branchId, userId, couponId },
    baseCurrency,
    tenant,
    session = null
  ) {
    try {
      const { ProductVariants, SalesInvoice, Account, Customer, Employee, Commission } = models;

      // const pricedCart = await pricingService.calculatePrices(models, { cartData, customerId });
      const pricedCart = await salesCalculationService.calculateCartTotals(models, {
        cartData,
        customerId,
        branchId,
      });
      const { grandTotal, totalTax, taxBreakdown } = pricedCart;
      // const { totalTax, taxBreakdown } = await taxService.calculateTax(models, {
      //   cartData,
      //   branchId,
      // });
      const finalTotalAmount = grandTotal;
      // const grandTotal = pricedCart.totalAmount + totalTax;
      // --- 1. CREDIT LIMIT VALIDATION ---
      const amountPaid = paymentData.paymentLines.reduce((sum, line) => sum + line.amount, 0);
      const amountDue = cartData.totalAmount - amountPaid;
      if (amountDue > 0) {
        const customer = await Customer.findById(customerId).session(session);
        if (!customer || customer.creditLimit === 0)
          throw new Error("This customer is not eligible for credit sales.");

        const arAccount = await Account.findById(customer.ledgerAccountId).session(session);
        // --- THE DEFINITIVE FIX: Correctly read balance from the Map ---
        const currentBalance = arAccount.balance.get(baseCurrency) || 0;
        const newBalance = currentBalance + amountDue;
        if (newBalance > customer.creditLimit) {
          throw new Error(
            `Credit limit exceeded. Limit: ${customer.creditLimit}, New Balance: ${newBalance}`
          );
        }
      }

      // --- END OF CREDIT LIMIT VALIDATION ---

      // 2. Verify inventory availability - skip pure service items
      for (const item of cartData.items) {
        const variant = await ProductVariants.findById(item.productVariantId)
          .populate("templateId")
          .lean();

        // Skip inventory check for pure service items
        if (variant.templateId.type === "service" && !variant.templateId.requiredParts?.length) {
          continue;
        }

        const inventoryStatus = await inventoryService.checkAvailability(
          models,
          {
            productVariantId: item.productVariantId,
            branchId,
            quantity: item.quantity,
          },
          session
        );

        if (!inventoryStatus.available) {
          throw new ERPComplianceError("INV-102", {
            productVariantId: item.productVariantId,
            requested: item.quantity,
            available: inventoryStatus.availableQuantity,
            isBundle: inventoryStatus.isBundle,
            components: inventoryStatus.components,
          });
        }
      }

      // 3. Deduct stock and create invoice items and modified to handle services
      let totalCostOfGoodsSold = 0;
      const saleItems = [];

      const inventoryItemIds = []; // To track for the audit link
      for (const item of pricedCart.items) {
        const variant = await ProductVariants.findById(item.productVariantId)
          .populate("templateId")
          .lean();

        // Handle service items
        if (variant.templateId.type === "service") {
          let costOfGoodsSold = 0;
          let partDeductedIds = [];

          // Deduct required parts if any
          if (variant.templateId.requiredParts?.length > 0) {
            const result = await inventoryService.decreaseStock(
              models,
              {
                productVariantId: item.productVariantId,
                branchId,
                quantity: item.quantity,
                userId,
                refs: { salesInvoice: true },
              },
              session
            );
            costOfGoodsSold = result.costOfGoodsSold;
            partDeductedIds = result.deductedItemIds || [];
          }

          // Get the priced item for this service
          const pricedItem = pricedCart.items.find((pi) => pi.cartId === item.cartId);
          if (!pricedItem) throw new Error("Priced item not found");

          saleItems.push({
            ...pricedItem,
            costPriceInBaseCurrency: costOfGoodsSold / item.quantity,
            isService: true,
            laborHours: item.laborHours,
            laborRate: item.laborRate,
            requiredParts: variant.templateId.requiredParts.map((part) => ({
              productVariantId: part.productVariantId,
              quantity: part.quantity * item.quantity,
              costPrice: part.costPrice,
            })),
          });

          if (partDeductedIds.length) inventoryItemIds.push(...partDeductedIds);
        }
        // Handle product items
        else {
          const pricedItem = pricedCart.items.find((pi) => pi.cartId === item.cartId);
          if (!pricedItem) throw new Error("Priced item not found");

          const { costOfGoodsSold, deductedItemIds } = await inventoryService.decreaseStock(
            models,
            {
              productVariantId: item.productVariantId,
              branchId,
              quantity: item.quantity,
              serialNumber: item.serialNumber,
              batchInfo: item?.batchInfo,
              userId,
              refs: { salesInvoice: true }, // A flag for the ledger
            },
            session
          );
          totalCostOfGoodsSold += costOfGoodsSold;
          // If the item is serialized or has batch info, we need to track it
          // Create the invoice item, now including the traceability fields
          saleItems.push({
            ...item,
            costPriceInBaseCurrency: costOfGoodsSold / item.quantity,
            serialNumber: item.serialNumber,
            batchNumber: item.batchInfo?.batchNumber,
            inventoryLotId: item.batchInfo?.lotId,
          });

          if (deductedItemIds) inventoryItemIds.push(...deductedItemIds);
        }
      } //end of loop

      const [salesInvoice] = await SalesInvoice.create(
        [
          {
            paymentStatus:
              amountDue <= 0.01 ? "paid" : amountPaid > 0 ? "partially_paid" : "unpaid",
            customerId,
            branchId,
            soldBy: userId,
            status: "completed",
            workflowStatus: "completed",
            items: pricedCart.items,
            subTotal: pricedCart.subTotal,
            totalLineDiscount: pricedCart.totalLineDiscount,
            totalGlobalDiscount: pricedCart.totalGlobalDiscount,
            globalDiscount: cartData.globalDiscount, // Save the rule itself
            totalCharges: pricedCart.totalCharges,
            additionalCharges: cartData.additionalCharges, // Save the charge details
            totalTax,
            totalAmount: grandTotal, // Use the final calculated grand total
          },
        ],
        { session }
      );

      // Now that we have the invoice ID, we can update the stock movement refs
      // In a real high-performance system, this might be done as a background job.
      await inventoryService.linkSaleToMovements(
        models,
        { saleId: salesInvoice._id, inventoryItemIds },
        session
      );

      // 3. Post the core Sales and COGS journal entries
      const [arAccount, salesRevenueAccount, cogsAccount, inventoryAssetAccount] =
        await Promise.all([
          Customer.findById(customerId)
            .select("ledgerAccountId")
            .then((c) => Account.findById(c.ledgerAccountId)),
          Account.findOne({ isSystemAccount: true, name: "Sales Revenue" }),
          Account.findOne({ isSystemAccount: true, name: "Cost of Goods Sold" }),
          Account.findOne({ isSystemAccount: true, name: "Inventory Asset" }),
        ]);

      // Revenue & Tax Journal Entry
      const revenueEntries = [
        { accountId: arAccount._id, debit: grandTotal },
        // The actual revenue we earned (after discounts, before tax).
        {
          accountId: salesRevenueAccount._id,
          credit:
            pricedCart.subTotal - pricedCart.totalLineDiscount - pricedCart.totalGlobalDiscount,
        },
      ];

      // Add a separate credit line for each tax liability.
      taxBreakdown.forEach((tax) =>
        revenueEntries.push({ accountId: tax.linkedAccountId, credit: tax.amount })
      );

      // This entry is now guaranteed to be balanced.
      await accountingService.createJournalEntry(
        models,
        {
          description: `Sale - Invoice #${salesInvoice.invoiceId}`,
          entries: revenueEntries,
          currency: baseCurrency,
          refs: { salesInvoiceId: salesInvoice._id },
        },
        session,
        tenant
      );

      // await accountingService.createJournalEntry(models, {
      //   description: `Sale to customer for Invoice #${salesInvoice.invoiceId}`,
      //   entries: revenueEntries,
      //   refs: { salesInvoiceId: salesInvoice._id },
      // });

      await accountingService.createJournalEntry(
        models,
        {
          description: `COGS for Invoice #${salesInvoice.invoiceId}`,
          entries: [
            { accountId: cogsAccount._id, debit: totalCostOfGoodsSold },
            { accountId: inventoryAssetAccount._id, credit: totalCostOfGoodsSold },
          ],
          currency: baseCurrency,
          refs: { salesInvoiceId: salesInvoice._id },
        },
        session,
        tenant
      );

      console.log("salesInvoice._id ", salesInvoice?._id);
      // 6. Record Payment & Finalize Coupon
      if (amountPaid > 0)
        await paymentsService.recordPayment(
          models,
          {
            paymentSourceId: salesInvoice._id,
            paymentSourceType: "SalesInvoice",
            paymentLines: paymentData.paymentLines,
            direction: "inflow",
            sourceDocumentObject: salesInvoice, // Pass the sales invoice object directly
          },
          userId,
          baseCurrency,
          tenant,
          session
        );
      if (couponId)
        await couponService.markCouponAsRedeemed(
          models,
          { couponId, invoiceId: salesInvoice._id },
          session
        );

      // 4. Record the payment using the universal PaymentsService
      // if (paymentData && paymentData.paymentLines.length > 0) {
      //   await paymentsService.recordPayment(
      //     models,
      //     {
      //       paymentSourceId: salesInvoice._id,
      //       paymentSourceType: "SalesInvoice",
      //       paymentLines: paymentData.paymentLines,
      //       paymentDate: new Date(),
      //       direction: "inflow",
      //       notes: paymentData.notes,
      //     },
      //     userId,
      //     baseCurrency
      //   );
      // }

      // if (couponId) {
      //   await couponService.markCouponAsRedeemed(
      //     models,
      //     { couponId, invoiceId: salesInvoice._id },
      //     session
      //   );
      // }

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
    } catch (error) {
      if (couponId) {
        // This runs if any of the above `await` calls fail.
        await couponService.releaseCouponLock(models, { couponId }, session);
      }

      console.error("Error in finalizeSale:", error);
      throw new Error("Failed to finalize sale. Please try again.");
    }
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
      quote.status = "cancelled"; // Or some other expired status
      await quote.save({ session });
      throw new Error("This quotation has expired and cannot be converted.");
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
