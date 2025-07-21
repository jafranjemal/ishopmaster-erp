const pricingService = require("./pricing.service");
const taxService = require("./tax.service");

/**
 * The ServiceCostingService handles all complex business logic related to
 * calculating the final price of a repair job for a quotation.
 */
class ServiceCostingService {
  /**
   * Calculates all totals for a repair ticket's job sheet in a multi-pass process.
   * @param {object} models - The tenant's compiled models.
   * @param {object} ticket - The full RepairTicket document.
   * @param {object} [quoteData={}] - Optional data like global discounts.
   * @returns {Promise<object>} A fully calculated quote object with all totals.
   *

   * Calculates all totals for a repair ticket's job sheet in a multi-pass process.
   * This definitive version correctly integrates with the main PricingService.
   * @param {object} models - The tenant's compiled models.
   * @param {object} ticket - The full RepairTicket document.
   * @returns {Promise<object>} A fully calculated quote object with all totals.
   */
  async calculateQuoteTotalsOld(models, { ticket }) {
    // --- PASS 1: Apply Automatic Promotions & Rules using the main PricingService ---
    // First, we treat the job sheet like a sales cart to get automatic discounts.
    const cartDataForPricing = {
      items: ticket.jobSheet.map((item) => ({
        productVariantId: item.productVariantId,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineDiscount: null, // Start with no manual discounts
      })),
      globalDiscount: null,
      additionalCharges: [],
    };

    // --- THE DEFINITIVE FIX: Call the correct, existing async method ---
    const pricedResult = await pricingService.calculatePrices(models, {
      cartData: cartDataForPricing,
      customerId: ticket.customerId,
    });
    // --- END OF FIX ---

    // --- PASS 2: Add Troubleshoot Fee ---
    const troubleshootFee = ticket.troubleshootFee?.status === "pending" ? ticket.troubleshootFee.amount || 0 : 0;

    // The total after automatic discounts + fees
    const subTotal = pricedResult.totalAmount + troubleshootFee;

    // --- PASS 3: Calculate Taxes on the final subtotal ---
    const cartForTaxCalc = {
      items: pricedResult.items,
      totalAmount: subTotal, // Tax is calculated on the final discounted price + fees
    };
    const { totalTax, taxBreakdown } = await taxService.calculateTax(models, {
      cartData: cartForTaxCalc,
      branchId: ticket.branchId,
    });

    // --- PASS 4: Final Grand Total ---
    const grandTotal = subTotal + totalTax;

    return {
      lineItems: pricedResult.items, // Return the priced items
      subTotal: parseFloat(pricedResult.subTotal.toFixed(2)),
      totalDiscount: parseFloat(pricedResult.totalDiscount.toFixed(2)),
      troubleshootFee,
      totalTax: parseFloat(totalTax.toFixed(2)),
      taxBreakdown,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  }

  /**
   * Calculates all totals for a repair ticket's job sheet in a multi-pass process.
   * @param {object} models - The tenant's compiled models.
   * @param {object} ticket - The full RepairTicket document.
   * @returns {Promise<object>} A fully calculated quote object with all totals.
   */
  async calculateQuoteTotalsOldd(models, { ticket }) {
    // --- Definitive Fix #1: Initialize all accumulators to 0 to prevent NaN errors ---
    let totalPartsCost = 0;
    let totalLaborPrice = 0;
    let totalServicesPrice = 0;

    // --- PASS 1: Calculate base costs and prices from the job sheet ---
    for (const item of ticket.jobSheet) {
      if (item.itemType === "part") {
        totalPartsCost += (item.costPrice || 0) * item.quantity;
      } else if (item.itemType === "labor") {
        totalLaborPrice += (item.laborHours || 0) * (item.laborRate || 0);
      } else {
        // 'service'
        totalServicesPrice += (item.unitPrice || 0) * item.quantity;
      }
    }

    // --- PASS 2: Apply Parts Markup ---
    const partsMarkupRate = 0.4; // This should be a tenant setting
    const totalPartsMarkup = totalPartsCost * partsMarkupRate;
    const totalPartsSellingPrice = totalPartsCost + totalPartsMarkup;

    // --- PASS 3: Add Troubleshoot Fee ---
    const troubleshootFee = ticket.troubleshootFee?.status === "pending" ? ticket.troubleshootFee.amount || 0 : 0;

    // --- PASS 4: Calculate Subtotal Before Global Discounts ---
    const subTotal = totalPartsSellingPrice + totalLaborPrice + totalServicesPrice + troubleshootFee;

    // --- PASS 5: Apply Automatic Promotions & Rules ---
    // We create a temporary cart-like object to pass to the main pricing service
    const cartForPricing = {
      items: ticket.jobSheet,
      totalAmount: subTotal, // The pricing service will calculate discounts based on this
    };
    const pricedResult = await pricingService.calculatePrices(models, {
      cartData: cartForPricing,
      customerId: ticket.customerId,
    });
    const totalDiscount = pricedResult.totalDiscount;

    const totalAfterDiscounts = subTotal - totalDiscount;

    // --- PASS 6: Calculate Taxes ---
    const cartForTaxCalc = { items: ticket.jobSheet, totalAmount: totalAfterDiscounts };
    const { totalTax, taxBreakdown } = await taxService.calculateTax(models, {
      cartData: cartForTaxCalc,
      branchId: ticket.branchId,
    });

    // --- PASS 7: Final Grand Total ---
    const grandTotal = totalAfterDiscounts + totalTax;

    return {
      lineItems: ticket.jobSheet,
      totalPartsCost: parseFloat(totalPartsCost.toFixed(2)),
      totalPartsMarkup: parseFloat(totalPartsMarkup.toFixed(2)),
      totalLaborPrice: parseFloat(totalLaborPrice.toFixed(2)),
      troubleshootFee,
      subTotal: parseFloat(subTotal.toFixed(2)),
      totalGlobalDiscount: parseFloat(totalDiscount.toFixed(2)), // For now, all discounts are global
      totalTax: parseFloat(totalTax.toFixed(2)),
      taxBreakdown,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  }

  async calculateQuoteTotals__old(models, { ticket, quoteData = {} }) {
    // --- Definitive Fix #1: Separate item types for correct processing ---
    const partsAndServices = ticket.jobSheet.filter((item) => item.itemType === "part" || item.itemType === "service");
    const laborItems = ticket.jobSheet.filter((item) => item.itemType === "labor");

    // --- PASS 1: Calculate discounts for parts and services ONLY ---
    const pricedPartsAndServicesResult = await pricingService.calculatePrices(models, {
      cartData: { items: partsAndServices },
      customerId: ticket.customerId,
    });

    // --- PASS 2: Calculate base costs and prices ---
    const totalPartsCost = pricedPartsAndServicesResult.items
      .filter((item) => item.itemType === "part")
      .reduce((sum, item) => sum + (item.costPrice || 0) * item.quantity, 0);

    const totalServicesPrice = pricedPartsAndServicesResult.items
      .filter((item) => item.itemType === "service")
      .reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

    const totalLaborPrice = laborItems.reduce((sum, item) => sum + (item.laborHours || 0) * (item.laborRate || 0), 0);

    // --- PASS 3: Apply Parts Markup ---
    const partsMarkupRate = 0.4; // Should be a tenant setting
    const totalPartsMarkup = totalPartsCost * partsMarkupRate;
    const totalPartsSellingPrice = totalPartsCost + totalPartsMarkup;

    // --- PASS 4: Add Troubleshoot Fee ---
    const troubleshootFee = ticket.troubleshootFee?.status === "pending" ? ticket.troubleshootFee.amount || 0 : 0;

    // --- PASS 5: Calculate Final Subtotal & Apply Global Discounts ---
    const subTotal = totalPartsSellingPrice + totalServicesPrice + totalLaborPrice + troubleshootFee;
    let totalGlobalDiscount = 0;
    if (quoteData.globalDiscount) {
      totalGlobalDiscount =
        quoteData.globalDiscount.type === "percentage" ? subTotal * (quoteData.globalDiscount.value / 100) : quoteData.globalDiscount.value;
    }
    const totalAfterDiscounts = subTotal - totalGlobalDiscount;

    // --- PASS 6: Calculate Taxes ---
    const finalPricedItems = [...pricedPartsAndServicesResult.items, ...laborItems];
    const cartForTaxCalc = { items: finalPricedItems, totalAmount: totalAfterDiscounts };
    const { totalTax, taxBreakdown } = await taxService.calculateTax(models, {
      cartData: cartForTaxCalc,
      branchId: ticket.branchId,
    });

    // --- PASS 7: Final Grand Total ---
    const grandTotal = totalAfterDiscounts + totalTax;

    return {
      lineItems: finalPricedItems,
      totalPartsCost: parseFloat(totalPartsCost.toFixed(2)),
      totalPartsMarkup: parseFloat(totalPartsMarkup.toFixed(2)),
      totalLaborPrice: parseFloat(totalLaborPrice.toFixed(2)),
      troubleshootFee,
      subTotal: parseFloat(subTotal.toFixed(2)),
      totalGlobalDiscount: parseFloat(totalGlobalDiscount.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      taxBreakdown,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  }

  async calculateQuoteTotals(models, { ticket, quoteData = {} }) {
    // --- Definitive Fix #1: Initialize all accumulators to 0 to prevent NaN errors ---
    let totalPartsPrice = 0;
    let totalLaborPrice = 0;
    let totalServicesPrice = 0;

    // --- PASS 1: Calculate base prices from the job sheet ---
    // This loop now correctly processes all three item types based on their stored prices.
    for (const item of ticket.jobSheet) {
      if (item.itemType === "part") {
        // For parts, the price is the official selling price (unitPrice)
        totalPartsPrice += (item.unitPrice || 0) * item.quantity;
      } else if (item.itemType === "labor") {
        // For labor, the price is the rate * hours.
        totalLaborPrice += (item.laborHours || 0) * (item.laborRate || 0);
      } else {
        // 'service'
        // For services, the price is also the pre-defined selling price (unitPrice).
        totalServicesPrice += (item.unitPrice || 0) * item.quantity;
      }
    }

    // --- PASS 2: Add Troubleshoot Fee ---
    const troubleshootFee = ticket.troubleshootFee?.status === "pending" ? ticket.troubleshootFee.amount || 0 : 0;

    // --- PASS 3: Calculate Subtotal Before Automatic Discounts ---
    const subTotal = totalPartsPrice + totalLaborPrice + totalServicesPrice + troubleshootFee;

    // --- PASS 4: Apply Automatic Promotions & Rules from PricingService ---
    // We create a temporary cart-like object to get automatic discounts.
    const cartForPricing = {
      items: ticket.jobSheet,
      totalAmount: subTotal,
    };

    const pricedResult = await pricingService.calculatePrices(models, {
      cartData: cartForPricing,
      customerId: ticket.customerId,
    });

    const totalAutomaticDiscount = pricedResult.totalDiscount;

    const totalAfterAutoDiscounts = subTotal - totalAutomaticDiscount;

    // --- PASS 5: Apply Manual Global Discounts from the Quote ---
    let totalGlobalDiscount = 0;
    if (quoteData.globalDiscount) {
      totalGlobalDiscount =
        quoteData.globalDiscount.type === "percentage"
          ? totalAfterAutoDiscounts * (quoteData.globalDiscount.value / 100)
          : quoteData.globalDiscount.value;
    }
    const totalAfterAllDiscounts = totalAfterAutoDiscounts - totalGlobalDiscount;

    // --- PASS 6: Calculate Taxes ---
    const cartForTaxCalc = { items: ticket.jobSheet, totalAmount: totalAfterAllDiscounts };
    const { totalTax, taxBreakdown } = await taxService.calculateTax(models, {
      cartData: cartForTaxCalc,
      branchId: ticket.branchId,
    });

    // --- PASS 7: Final Grand Total ---
    const grandTotal = totalAfterAllDiscounts + totalTax;
    console.log("totalAfterAllDiscounts ", totalAfterAllDiscounts);
    console.log("totalTax ", totalTax);
    console.log("ticket.branchId ", ticket.branchId);
    console.log("grandTotal ", grandTotal);
    return {
      lineItems: ticket.jobSheet,
      totalPartsPrice: parseFloat(totalPartsPrice.toFixed(2)),
      totalLaborPrice: parseFloat(totalLaborPrice.toFixed(2)),
      totalServicesPrice: parseFloat(totalServicesPrice.toFixed(2)),
      troubleshootFee,
      subTotal: parseFloat(subTotal.toFixed(2)),
      totalDiscount: parseFloat((totalAutomaticDiscount + totalGlobalDiscount).toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      taxBreakdown,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  }
}

// Export a singleton instance
module.exports = new ServiceCostingService();
