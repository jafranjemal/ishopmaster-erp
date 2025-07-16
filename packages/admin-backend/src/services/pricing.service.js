const mongoose = require("mongoose");

class PricingService {
  async calculatePrices(models, { cartData, customerId }) {
    const { PricingRule, Promotion, Customer, ProductVariants } = models;
    const now = new Date();

    console.log("Calculating prices for cart data:", cartData);
    const [customer, activeRules, activePromotions, cartVariants] = await Promise.all([
      Customer.findById(customerId).lean(),
      PricingRule.find({ isActive: true }).sort({ priority: -1 }).lean(),
      Promotion.find({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } }).lean(),
      ProductVariants.find({ _id: { $in: cartData.items.map((i) => i.productVariantId) } })
        .populate("templateId")
        .lean(),
    ]);

    let subTotal = 0;
    let totalLineDiscount = 0;
    const pricedCartItems = [];

    // --- PASS 1 & 2: Automatic Promotions & Rules + Manual Line Discounts ---
    for (const item of cartData.items) {
      const variantDetails = cartVariants.find(
        (v) => v._id.toString() === item.productVariantId.toString()
      );
      if (!variantDetails) continue;

      let lineSubtotal = item.unitPrice * item.quantity;
      subTotal += lineSubtotal;
      let currentLinePrice = lineSubtotal;

      // Apply automatic promotions first
      let bestPromotionDiscount = 0;
      for (const promo of activePromotions) {
        const applies = promo.conditions?.items.some((id) => id.equals(variantDetails._id)); // Simplified
        if (applies) {
          const discount =
            promo.discount.type === "percentage"
              ? lineSubtotal * (promo.discount.value / 100)
              : promo.discount.value;
          if (discount > bestPromotionDiscount) bestPromotionDiscount = discount;
        }
      }
      currentLinePrice -= bestPromotionDiscount;

      // Then apply automatic customer rules
      const applicableRules = activeRules.filter(
        (rule) =>
          !rule.productCategoryId ||
          rule.productCategoryId.equals(variantDetails.templateId.categoryId)
      );
      for (const rule of applicableRules) {
        const ruleDiscount =
          rule.discount.type === "percentage"
            ? currentLinePrice * (rule.discount.value / 100)
            : rule.discount.value;
        currentLinePrice -= ruleDiscount;
      }

      // Then apply manual line-item discounts
      if (item.lineDiscount) {
        const manualDiscount =
          item.lineDiscount.type === "percentage"
            ? currentLinePrice * (item.lineDiscount.value / 100)
            : item.lineDiscount.value * item.quantity;
        currentLinePrice -= manualDiscount;
      }

      const totalDiscountForLine = lineSubtotal - currentLinePrice;
      totalLineDiscount += totalDiscountForLine;

      pricedCartItems.push({ ...item, finalPrice: currentLinePrice / item.quantity });
    }

    // --- PASS 3 & 4: Global Discounts & Charges ---
    const subtotalAfterLineDiscounts = subTotal - totalLineDiscount;
    let totalGlobalDiscount = 0;
    if (cartData.globalDiscount) {
      totalGlobalDiscount =
        cartData.globalDiscount.type === "percentage"
          ? subtotalAfterLineDiscounts * (cartData.globalDiscount.value / 100)
          : cartData.globalDiscount.value;
    }

    const totalCharges = (cartData.additionalCharges || []).reduce(
      (sum, charge) => sum + charge.amount,
      0
    );

    // --- PASS 5: Final Calculation (Pre-Tax) ---
    const totalAmount = subtotalAfterLineDiscounts - totalGlobalDiscount + totalCharges;
    console.log("Total amount after all calculations:", parseFloat(totalAmount.toFixed(2)));
    console.log("Total totalGlobalDiscount:", totalGlobalDiscount);

    console.log("Total totalCharges:", totalCharges);
    console.log("Total totalLineDiscount:", totalLineDiscount);
    console.log("Total cartData.globalDiscount:", cartData.globalDiscount);
    console.log("Total cartData.additionalCharges:", cartData.additionalCharges);
    return {
      items: pricedCartItems,
      subTotal: parseFloat(subTotal.toFixed(2)),
      totalLineDiscount: parseFloat(totalLineDiscount.toFixed(2)),
      totalGlobalDiscount: parseFloat(totalGlobalDiscount.toFixed(2)),
      totalCharges: parseFloat(totalCharges.toFixed(2)),
      totalTax: 0, // or your tax calculation
      taxBreakdown: [],
      grandTotal: parseFloat(totalAmount.toFixed(2)),

      // 👇 Add these to preserve structure
      globalDiscount: cartData.globalDiscount || null,
      additionalCharges: cartData.additionalCharges || [],
    };
  }
}

module.exports = new PricingService();
