const { default: mongoose } = require("mongoose");
const asyncHandler = require("../../../../middleware/asyncHandler");
const couponService = require("../../../../services/coupon.service");

// --- CouponBatch (Admin Campaign Management) Controllers ---

// @desc    Get all coupon batches
// @route   GET /api/v1/tenant/sales/pricing/coupons/batches
exports.getAllCouponBatches = asyncHandler(async (req, res, next) => {
  const { CouponBatch } = req.models;
  const batches = await CouponBatch.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: batches });
});

// @desc    Get all unique coupons for a specific batch, with filtering and pagination
// @route   GET /api/v1/tenant/sales/pricing/coupons/by-batch/:batchId
exports.getCouponsForBatch = asyncHandler(async (req, res, next) => {
  const { Coupon } = req.models;
  const { batchId } = req.params;
  const { page = 1, limit = 50, status } = req.query;
  const skip = (page - 1) * limit;

  const filters = { batchId: new mongoose.Types.ObjectId(batchId) };
  if (status) {
    filters.status = status;
  }

  const [coupons, total] = await Promise.all([
    Coupon.find(filters).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Coupon.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit) },
    data: coupons,
  });
});

// @desc    Create a new coupon batch/campaign
// @route   POST /api/v1/tenant/sales/pricing/coupons/batches
exports.createCouponBatch = asyncHandler(async (req, res, next) => {
  const { CouponBatch } = req.models;
  const batch = await CouponBatch.create(req.body);
  res.status(201).json({ success: true, data: batch });
});

// @desc    Update a coupon batch
// @route   PUT /api/v1/tenant/sales/pricing/coupons/batches/:id
exports.updateCouponBatch = asyncHandler(async (req, res, next) => {
  const { CouponBatch } = req.models;
  const batch = await CouponBatch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!batch) return res.status(404).json({ success: false, error: "Coupon batch not found." });
  res.status(200).json({ success: true, data: batch });
});

// @desc    Generate unique coupons from a batch
// @route   POST /api/v1/tenant/sales/pricing/coupons/batches/:id/generate
exports.generateCouponsFromBatch = asyncHandler(async (req, res, next) => {
  const { count = 1 } = req.body;
  const newCoupons = await couponService.generateCoupons(req.models, {
    batchId: req.params.id,
    count,
  });
  res.status(201).json({
    success: true,
    data: newCoupons,
    message: `${count} coupon(s) generated successfully.`,
  });
});

// --- Coupon (POS Redemption) Controller ---

// @desc    Validate and LOCK a discount coupon for use in a transaction
// @route   POST /api/v1/tenant/sales/pricing/coupons/validate
exports.validateAndLockCoupon = asyncHandler(async (req, res, next) => {
  const { code, cartTotal } = req.body;
  const session = await req.dbConnection.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      result = await couponService.validateAndLockCoupon(req.models, { code, cartTotal }, session);
    });
    res.status(200).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});
