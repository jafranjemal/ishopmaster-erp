const { v4: uuidv4 } = require("uuid");

class CouponService {
  async generateCoupons(models, { batchId, count = 1 }) {
    const { CouponBatch, Coupon } = models;
    const batch = await CouponBatch.findById(batchId);
    if (!batch) throw new Error("Coupon batch not found.");

    const couponsToCreate = [];
    for (let i = 0; i < count; i++) {
      const uniqueCode = `${batch.prefix}-${uuidv4().split("-")[0].toUpperCase()}`;
      couponsToCreate.push({
        batchId: batch._id,
        code: uniqueCode,
        discount: batch.discount,
        usageLimit: batch.usageLimit,
        expiryDate: batch.validForDays
          ? new Date(new Date().setDate(new Date().getDate() + batch.validForDays))
          : null,
      });
    }
    const newCoupons = await Coupon.create(couponsToCreate);
    return newCoupons;
  }

  async redeemCoupon(models, { code, cartTotal }) {
    const { Coupon } = models;
    const coupon = await Coupon.findOne({ code });

    if (!coupon) throw new Error("Invalid coupon code.");
    if (coupon.status !== "active") throw new Error(`This coupon is ${coupon.status}.`);
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      coupon.status = "expired";
      await coupon.save();
      throw new Error("This coupon has expired.");
    }
    if (coupon.timesUsed >= coupon.usageLimit)
      throw new Error("This coupon has reached its usage limit.");

    let discountAmount = 0;
    if (coupon.discount.type === "percentage") {
      discountAmount = cartTotal * (coupon.discount.value / 100);
    } else {
      // fixed_amount
      discountAmount = coupon.discount.value;
    }

    // In a real system, you would mark this coupon as "locked" during the transaction
    // and then update to "redeemed" upon successful sale completion.
    // For now, we'll just return the discount.
    return { discountAmount, couponId: coupon._id };
  }

  /**
   * Validates a coupon code and places a lock on it to prevent concurrent use.
   * This is the first phase of the redemption process.
   */
  async validateAndLockCoupon(models, { code, cartTotal }, session) {
    const { Coupon } = models;
    const coupon = await Coupon.findOne({ code }).session(session);

    if (!coupon) throw new Error("Invalid coupon code.");
    if (coupon.status !== "active") throw new Error(`This coupon is currently ${coupon.status}.`);
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      coupon.status = "expired";
      await coupon.save({ session });
      throw new Error("This coupon has expired.");
    }

    let discountAmount =
      coupon.discount.type === "percentage"
        ? cartTotal * (coupon.discount.value / 100)
        : coupon.discount.value;

    // Lock the coupon to prevent other transactions from using it.
    coupon.status = "locked";
    await coupon.save({ session });

    return { discountAmount: parseFloat(discountAmount.toFixed(2)), couponId: coupon._id };
  }

  /**
   * Permanently redeems a locked coupon. Called after a sale is successfully completed.
   */
  async markCouponAsRedeemed(models, { couponId, invoiceId }, session) {
    const { Coupon } = models;
    const coupon = await Coupon.findById(couponId).session(session);
    if (coupon && coupon.status === "locked") {
      coupon.status = "redeemed";
      coupon.timesUsed += 1;
      coupon.redeemedAt = new Date();
      coupon.redeemedOnInvoiceId = invoiceId;
      await coupon.save({ session });
    }
  }

  /**
   * Releases the lock on a coupon if a transaction fails.
   */
  async releaseCouponLock(models, { couponId }, session) {
    const { Coupon } = models;
    const coupon = await Coupon.findById(couponId).session(session);
    if (coupon && coupon.status === "locked") {
      coupon.status = "active"; // Return it to the pool of usable coupons
      await coupon.save({ session });
    }
  }
}
module.exports = new CouponService();
