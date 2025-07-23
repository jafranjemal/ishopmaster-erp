const mongoose = require("mongoose");

class PricingService {
  async calculatePricesOld(models, { cartData, customerId }) {
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
      const variantDetails = cartVariants.find((v) => v._id.toString() === item.productVariantId.toString());
      if (!variantDetails) continue;

      let lineSubtotal = item.unitPrice * item.quantity;
      subTotal += lineSubtotal;
      let currentLinePrice = lineSubtotal;

      // Apply automatic promotions first
      let bestPromotionDiscount = 0;
      for (const promo of activePromotions) {
        const applies = promo.conditions?.items.some((id) => id.equals(variantDetails._id)); // Simplified
        if (applies) {
          const discount = promo.discount.type === "percentage" ? lineSubtotal * (promo.discount.value / 100) : promo.discount.value;
          if (discount > bestPromotionDiscount) bestPromotionDiscount = discount;
        }
      }
      currentLinePrice -= bestPromotionDiscount;

      // Then apply automatic customer rules
      const applicableRules = activeRules.filter(
        (rule) => !rule.productCategoryId || rule.productCategoryId.equals(variantDetails.templateId.categoryId)
      );
      for (const rule of applicableRules) {
        const ruleDiscount = rule.discount.type === "percentage" ? currentLinePrice * (rule.discount.value / 100) : rule.discount.value;
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

    const totalCharges = (cartData.additionalCharges || []).reduce((sum, charge) => sum + charge.amount, 0);

    // --- PASS 5: Final Calculation (Pre-Tax) ---
    const totalAmount = subtotalAfterLineDiscounts - totalGlobalDiscount + totalCharges;
    console.log("Total amount after all calculations:", parseFloat(totalAmount.toFixed(2)));
    console.log("Total totalGlobalDiscount:", totalGlobalDiscount);

    console.log("Total totalCharges:", totalCharges);
    console.log("Total totalLineDiscount:", totalLineDiscount);
    console.log("Total cartData.globalDiscount:", cartData.globalDiscount);
    console.log("Total cartData.additionalCharges:", cartData.additionalCharges);

    const totalDiscount = (totalLineDiscount || 0) + (totalGlobalDiscount || 0) || 0;

    return {
      items: pricedCartItems,
      subTotal: parseFloat(subTotal.toFixed(2)),
      totalLineDiscount: parseFloat(totalLineDiscount.toFixed(2)),
      totalGlobalDiscount: parseFloat(totalGlobalDiscount.toFixed(2)),
      totalCharges: parseFloat(totalCharges.toFixed(2)),
      totalTax: 0, // or your tax calculation
      taxBreakdown: [],
      grandTotal: parseFloat(totalAmount.toFixed(2)),
      totalDiscount: totalDiscount,
      // 👇 Add these to preserve structure
      globalDiscount: cartData.globalDiscount || null,
      additionalCharges: cartData.additionalCharges || [],
    };
  }

  async calculatePrices(models, { cartData, customerId }) {
    const { PricingRule, Promotion, Customer, ProductVariants } = models;
    const now = new Date();
    let subTotal = 0;
    let totalLineDiscount = 0;
    try {
      // --- Definitive Fix #1: The service is now "type-aware" ---
      // It intelligently separates items that can have automatic discounts (products/services)
      // from items that cannot (labor).
      const processableItems = cartData.items.filter((item) => item.productVariantId);
      const laborItems = cartData.items.filter((item) => item.itemType === "labor");

      // 1. Fetch all relevant data in parallel for performance.
      const [customer, activeRules, activePromotions, cartVariants] = await Promise.all([
        Customer.findById(customerId).lean(),
        PricingRule.find({ isActive: true }).sort({ priority: -1 }).lean(),
        Promotion.find({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } }).lean(),
        ProductVariants.find({ _id: { $in: processableItems.map((i) => i.productVariantId) } })
          .populate("templateId")
          .lean(),
      ]);

      // --- PASS 1 & 2: Automatic Promotions & Rules + Manual Line Discounts ---
      const pricedProductItems = processableItems.map((item) => {
        const variantDetails = cartVariants.find((v) => v._id.toString() === item.productVariantId.toString());
        if (!variantDetails) return item;

        const lineSubtotal = item.unitPrice * item.quantity;
        subTotal += lineSubtotal;
        let currentLinePrice = lineSubtotal;

        // Apply automatic promotions first
        let bestPromotionDiscount = 0;
        for (const promo of activePromotions) {
          const applies = promo.conditions?.items.some((id) => id.equals(variantDetails._id)); // Simplified
          if (applies) {
            const discount = promo.discount.type === "percentage" ? lineSubtotal * (promo.discount.value / 100) : promo.discount.value;
            if (discount > bestPromotionDiscount) bestPromotionDiscount = discount;
          }
        }
        currentLinePrice -= bestPromotionDiscount;

        // Then apply automatic customer rules
        const applicableRules = activeRules.filter(
          (rule) => !rule.productCategoryId || rule.productCategoryId.equals(variantDetails.templateId.categoryId)
        );
        for (const rule of applicableRules) {
          const ruleDiscount = rule.discount.type === "percentage" ? currentLinePrice * (rule.discount.value / 100) : rule.discount.value;
          currentLinePrice -= ruleDiscount;
        }

        // Then apply manual line-item discounts from the cart object
        if (item.lineDiscount) {
          const manualDiscount =
            item.lineDiscount.type === "percentage"
              ? currentLinePrice * (item.lineDiscount.value / 100)
              : item.lineDiscount.value * item.quantity;
          currentLinePrice -= manualDiscount;
        }

        const totalDiscountForLine = lineSubtotal - currentLinePrice;
        totalLineDiscount += totalDiscountForLine;

        return { ...item, finalPrice: currentLinePrice / item.quantity };
      });

      // Add the value of labor items to the subtotal *after* product discounts are calculated.
      laborItems.forEach((item, index) => {
        const unit = item.unitPrice || item.laborRate || 0;
        const qty = item.quantity || item.laborHours || 1;
        const price = unit * qty;

        subTotal += price;

        laborItems[index] = {
          ...item,
          finalPrice: unit, // per-unit price
        };
      });

      const finalItems = [...pricedProductItems, ...laborItems];

      // --- PASS 3 & 4: Global Discounts & Charges ---
      const subtotalAfterLineDiscounts = subTotal - totalLineDiscount;
      let totalGlobalDiscount = 0;
      if (cartData.globalDiscount) {
        totalGlobalDiscount =
          cartData.globalDiscount.type === "percentage"
            ? subtotalAfterLineDiscounts * (cartData.globalDiscount.value / 100)
            : cartData.globalDiscount.value;
      }

      const totalCharges = (cartData.additionalCharges || []).reduce((sum, charge) => sum + charge.amount, 0);

      // --- PASS 5: Final Calculation (Pre-Tax) ---
      const totalAmount = subtotalAfterLineDiscounts - totalGlobalDiscount + totalCharges;
      const totalDiscount = (totalLineDiscount || 0) + (totalGlobalDiscount || 0) || 0;

      const payload = {
        items: finalItems,
        subTotal: parseFloat(subTotal.toFixed(2)),
        totalLineDiscount: parseFloat(totalLineDiscount.toFixed(2)),
        totalGlobalDiscount: parseFloat(totalGlobalDiscount.toFixed(2)),
        totalCharges: parseFloat(totalCharges.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalDiscount,
        grandTotal: totalAmount,
        // Preserve the raw discount/charge objects for the final invoice record
        globalDiscount: cartData.globalDiscount || null,
        additionalCharges: cartData.additionalCharges || [],
      };
      console.log("\n\n\ncalculate prices payload", payload);
      return payload;
    } catch (error) {
      console.error("Error during price calculation:", error);
      throw new Error("Could not calculate prices due to a server error.");
    }
  }

  /**
   * Special pricing for service items
   */
  calculateServicePricing(item, variant, customer) {
    const basePrice = item.unitPrice;

    // Calculate labor cost
    const laborHours = item.laborHours || 1;
    const laborRate = item.laborRate || variant.defaultLaborRate || 50;
    const laborCost = laborHours * laborRate;

    // Calculate parts cost
    let partsCost = 0;
    let partsMarkup = 0;

    if (item.requiredParts && item.requiredParts.length > 0) {
      partsCost = item.requiredParts.reduce((total, part) => total + part.quantity * part.costPrice, 0);

      // Apply markup to parts
      const partsMarkupRate = item.partsMarkup || variant.defaultPartsMarkup || 0.2;
      partsMarkup = partsCost * partsMarkupRate;
    }

    // Calculate final price
    const finalPrice = basePrice + laborCost + partsCost + partsMarkup;

    return {
      ...item,
      unitPrice: basePrice,
      finalPrice,
      costComponents: {
        basePrice,
        laborCost,
        partsCost,
        partsMarkup,
      },
      isService: true,
    };
  }
}

module.exports = new PricingService();
