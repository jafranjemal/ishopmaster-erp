const pricingService = require("./pricing.service");
const taxService = require("./tax.service");

/**
 * This service orchestrates other services to perform a full, real-time
 * calculation of a sales cart, including discounts and taxes.
 */
class SalesCalculationService {
  /**
   * Takes raw cart data and returns a fully priced-out cart object.
   */
  async calculateCartTotals(models, { cartData, customerId, branchId }) {
    // 1. Get final prices after discounts are applied.
    console.log("######################## Priced Cart ########################");
    console.log("cartData", cartData);
    const pricedCart = await pricingService.calculatePrices(models, { cartData, customerId });
    console.log("pricedCart", pricedCart);

    // 2. Calculate taxes based on the final discounted prices.
    const { totalTax, taxBreakdown } = await taxService.calculateTax(models, {
      cartData: pricedCart,
      branchId,
    });

    console.log("totalTax", totalTax);
    console.log("taxBreakdown", taxBreakdown);

    // 3. Assemble and return the final, complete cart object.
    return {
      ...pricedCart,
      totalTax,
      taxBreakdown,
      //grandTotal: pricedCart.totalAmount + totalTax,
    };
  }
}

module.exports = new SalesCalculationService();
