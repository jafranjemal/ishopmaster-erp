const mongoose = require("mongoose");

class TaxService {
  /**
   * Calculates the total tax for a given cart.
   */
  async calculateTax(models, { cartData, branchId }) {
    const { TaxRule, ProductVariants } = models;
    const activeRules = await TaxRule.find({
      isActive: true,
      $or: [{ branchId: null }, { branchId }],
    }).sort({ priority: 1 });
    if (activeRules.length === 0) return { totalTax: 0, taxBreakdown: [] };

    const cartVariantIds = cartData.items.map((item) => item.productVariantId);
    const variantsInCart = await ProductVariants.find({ _id: { $in: cartVariantIds } })
      .populate("templateId", "categoryId")
      .lean();

    let totalTax = 0;
    const taxBreakdown = [];
    let runningTotal = cartData.subTotal;

    for (const rule of activeRules) {
      let taxableAmountForRule = 0;
      for (const item of cartData.items) {
        const variantDetails = variantsInCart.find((v) => v._id.equals(item.productVariantId));
        if (
          variantDetails &&
          (!rule.productCategoryId ||
            rule.productCategoryId.equals(variantDetails.templateId.categoryId))
        ) {
          taxableAmountForRule += item.finalPrice;
        }
      }

      if (taxableAmountForRule > 0) {
        const taxBase = rule.isCompound ? runningTotal : taxableAmountForRule;
        const taxAmount = taxBase * (rule.rate / 100);
        totalTax += taxAmount;
        runningTotal += taxAmount;
        taxBreakdown.push({
          ruleName: rule.name,
          rate: rule.rate,
          amount: taxAmount,
          linkedAccountId: rule.linkedAccountId,
        });
      }
    }
    return { totalTax: parseFloat(totalTax.toFixed(2)), taxBreakdown };
  }
}
module.exports = new TaxService();
