const mongoose = require("mongoose");

class PricingService {
  /**
   * Takes a cart and customer, applies all valid pricing rules and promotions,
   * and returns a new cart object with final calculated prices.
   */
  async calculatePrices(models, { cartData, customerId }) {
    const { PricingRule, Promotion, Customer, ProductVariants } = models;
    const now = new Date();

    // 1. Fetch all relevant data in parallel for performance
    const [customer, activeRules, activePromotions, cartVariants] = await Promise.all([
      Customer.findById(customerId).lean(),
      PricingRule.find({ isActive: true }).sort({ priority: -1 }).lean(),
      Promotion.find({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } }).lean(),
      // Fetch full variant details for every item in the cart to check their categories
      ProductVariants.find({ _id: { $in: cartData.items.map((i) => i.productVariantId) } })
        .populate("templateId")
        .lean(),
    ]);

    const pricedCartItems = [];
    let totalDiscountAmount = 0;

    // 2. Loop through each item in the original cart
    for (const item of cartData.items) {
      const variantDetails = cartVariants.find(
        (v) => v._id.toString() === item.productVariantId.toString()
      );
      if (!variantDetails) continue;

      let currentPrice = item.unitPrice;
      let appliedDiscounts = [];

      // --- PASS 1: APPLY THE BEST PROMOTION ---
      let bestPromotionDiscount = 0;
      let appliedPromotion = null;

      for (const promo of activePromotions) {
        const appliesToAll = promo.conditions.appliesTo === "all_products";
        const appliesToCategory =
          promo.conditions.appliesTo === "specific_categories" &&
          promo.conditions.items.some((id) => id.equals(variantDetails.templateId.categoryId));
        const appliesToProduct =
          promo.conditions.appliesTo === "specific_products" &&
          promo.conditions.items.some((id) => id.equals(variantDetails._id));

        if (appliesToAll || appliesToCategory || appliesToProduct) {
          const discount =
            promo.discount.type === "percentage"
              ? currentPrice * (promo.discount.value / 100)
              : promo.discount.value;
          if (discount > bestPromotionDiscount) {
            bestPromotionDiscount = discount;
            appliedPromotion = promo;
          }
        }
      }

      if (appliedPromotion) {
        currentPrice -= bestPromotionDiscount;
        appliedDiscounts.push({ name: appliedPromotion.name, amount: bestPromotionDiscount });
      }

      // --- PASS 2: APPLY CUSTOMER-LEVEL RULES (to the already discounted price) ---
      const applicableRules = activeRules.filter((rule) => {
        const customerMatch =
          !rule.customerGroupId || rule.customerGroupId.equals(customer?.customerGroupId);
        const categoryMatch =
          !rule.productCategoryId ||
          rule.productCategoryId.equals(variantDetails.templateId.categoryId);
        return customerMatch && categoryMatch;
      });

      for (const rule of applicableRules) {
        const ruleDiscount =
          rule.discount.type === "percentage"
            ? currentPrice * (rule.discount.value / 100)
            : rule.discount.value;
        if (ruleDiscount > 0) {
          currentPrice -= ruleDiscount;
          appliedDiscounts.push({ name: rule.name, amount: ruleDiscount });
        }
      }

      const finalLinePrice = currentPrice * item.quantity;
      const totalLineDiscount = item.unitPrice * item.quantity - finalLinePrice;
      totalDiscountAmount += totalLineDiscount;

      pricedCartItems.push({
        ...item,
        finalPrice: parseFloat(currentPrice.toFixed(2)),
        appliedDiscounts, // For receipt transparency
      });
    }

    const subTotal = cartData.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalAmount = subTotal - totalDiscountAmount;

    return {
      items: pricedCartItems,
      subTotal: parseFloat(subTotal.toFixed(2)),
      totalDiscount: parseFloat(totalDiscountAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  }
}

module.exports = new PricingService();
