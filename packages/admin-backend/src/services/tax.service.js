const mongoose = require("mongoose");

class TaxService {
  async calculateTax(models, { cartData, branchId, taxMode = "exclusive" }) {
    const { TaxRule, ProductVariants } = models;
    const _branchId = branchId ? new mongoose.Types.ObjectId(branchId) : null;
    const activeRules = await TaxRule.find({
      isActive: true,
      $or: [{ branchId: null }, { _branchId }],
    }).sort({ priority: 1 });

    if (activeRules.length === 0) return { totalTax: 0, taxBreakdown: [] };

    const cartVariantIds = cartData.items.map((item) => item.productVariantId);
    const variantsInCart = await ProductVariants.find({
      _id: { $in: cartVariantIds },
    })
      .populate("templateId", "taxCategoryId")
      .lean();

    let totalTax = 0;
    const taxBreakdownMap = new Map();

    for (const item of cartData.items) {
      const variantDetails = variantsInCart.find((v) => v._id.equals(item.productVariantId));
      if (!variantDetails) continue;

      const taxCategoryId = variantDetails.templateId?.taxCategoryId;
      const applicableRules = activeRules.filter(
        (rule) => !rule.taxCategoryId || rule.taxCategoryId.equals(taxCategoryId)
      );

      let lineTotal = item.finalPrice * item.quantity;
      let runningTotal = lineTotal;

      for (const rule of applicableRules) {
        let base = rule.isCompound ? runningTotal : lineTotal;

        if (taxMode === "inclusive") {
          base = base / (1 + rule.rate / 100);
        }

        const taxAmount = +(base * (rule.rate / 100)).toFixed(2);
        runningTotal += taxAmount;
        totalTax += taxAmount;

        const key = rule.name;
        if (taxBreakdownMap.has(key)) {
          taxBreakdownMap.get(key).amount += taxAmount;
        } else {
          taxBreakdownMap.set(key, {
            ruleName: rule.name,
            rate: rule.rate,
            amount: taxAmount,
            linkedAccountId: rule.linkedAccountId,
          });
        }
      }
    }

    const taxBreakdown = Array.from(taxBreakdownMap.values()).map((rule) => ({
      ...rule,
      amount: +rule.amount.toFixed(2),
    }));

    return {
      totalTax: +totalTax.toFixed(2),
      taxBreakdown,
    };
  }
}

module.exports = new TaxService();
