const mongoose = require("mongoose");

class PricingService {
  /**
   * Takes a cart and customer, applies all valid pricing rules and promotions,
   * and returns a new cart object with final calculated prices.
   */
  async calculatePrices(models, { cartData, customerId }) {
    const { PricingRule, Promotion, Customer } = models;
    const now = new Date();

    // 1. Fetch all relevant data in parallel for performance
    const [customer, activeRules, activePromotions] = await Promise.all([
      Customer.findById(customerId).lean(),
      PricingRule.find({ isActive: true }).lean(),
      Promotion.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      }).lean(),
    ]);

    const pricedCartItems = [];
    let totalDiscountAmount = 0;

    // 2. Loop through each item in the original cart
    for (const item of cartData.items) {
      let currentPrice = item.unitPrice;
      let lineItemDiscount = 0;
      let appliedDiscountDetails = null;

      // Logic to apply promotions first (can be made more complex with priorities)
      const itemPromotion = activePromotions.find(
        (p) => /* logic to match item to promotion */ true
      );
      if (itemPromotion) {
        if (itemPromotion.discount.type === "percentage") {
          lineItemDiscount = currentPrice * (itemPromotion.discount.value / 100);
        } else {
          // fixed
          lineItemDiscount = itemPromotion.discount.value;
        }
        appliedDiscountDetails = {
          type: itemPromotion.discount.type,
          value: itemPromotion.discount.value,
        };
      }

      // Logic to apply customer group rules next
      if (customer?.customerGroupId) {
        const customerRule = activeRules.find(
          (r) => r.customerGroupId?.toString() === customer.customerGroupId.toString()
        );
        if (customerRule) {
          let ruleDiscount = 0;
          if (customerRule.discount.type === "percentage") {
            ruleDiscount = (currentPrice - lineItemDiscount) * (customerRule.discount.value / 100);
          } else {
            // fixed
            ruleDiscount = customerRule.discount.value;
          }
          // This simplified logic just adds discounts. A real system might have rules on stacking.
          lineItemDiscount += ruleDiscount;
          appliedDiscountDetails = {
            type: customerRule.discount.type,
            value: customerRule.discount.value,
          };
        }
      }

      const finalLinePrice = (item.unitPrice - lineItemDiscount) * item.quantity;
      totalDiscountAmount += lineItemDiscount * item.quantity;

      pricedCartItems.push({
        ...item,
        finalPrice: parseFloat(finalLinePrice.toFixed(2)),
        discount: appliedDiscountDetails,
      });
    }

    const subTotal = pricedCartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalAmount = subTotal - totalDiscountAmount; // Simplified total, not including tax yet

    // 3. Return the new, fully calculated cart object
    return {
      items: pricedCartItems,
      subTotal: parseFloat(subTotal.toFixed(2)),
      totalDiscount: parseFloat(totalDiscountAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  }
}

module.exports = new PricingService();
