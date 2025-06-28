const asyncHandler = require("../../../../middleware/asyncHandler");
const mongoose = require("mongoose");

// @desc    Get a paginated history of all manual stock adjustments
// @route   GET /api/v1/tenant/inventory/adjustments/history
// @access  Private (Requires 'inventory:stock:adjust' permission)
exports.getAdjustmentHistory = asyncHandler(async (req, res, next) => {
  const { StockMovement } = req.models;
  const {
    page = 1,
    limit = 25,
    branchId,
    userId,
    startDate,
    endDate,
  } = req.query;
  const skip = (page - 1) * limit;

  // --- Build the Filter Query ---
  const filters = {
    // This is the core filter for this endpoint
    type: { $in: ["adjustment_in", "adjustment_out"] },
  };

  if (branchId) filters.branchId = new mongoose.Types.ObjectId(branchId);
  if (userId) filters.userId = new mongoose.Types.ObjectId(userId);
  if (startDate && endDate) {
    filters.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  // --- Execute Queries in Parallel ---
  const [adjustments, total] = await Promise.all([
    StockMovement.find(filters)
      .populate("userId", "name")
      .populate("branchId", "name")
      .populate("productVariantId", "variantName sku")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    StockMovement.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    total,
    pagination: {
      currentPage: Number(page),
      totalPages,
      count: adjustments.length,
      limit: Number(limit),
    },
    data: adjustments,
  });
});
