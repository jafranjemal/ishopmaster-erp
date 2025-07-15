const asyncHandler = require("../../../../middleware/asyncHandler");
const mongoose = require("mongoose");

exports.getLedgerHistory = asyncHandler(async (req, res, next) => {
  const { InventoryLedger } = req.models;
  const { page = 1, limit = 25, productVariantId, branchId, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  const filters = {};
  if (productVariantId) filters.productVariantId = new mongoose.Types.ObjectId(productVariantId);
  if (branchId) filters.branchId = new mongoose.Types.ObjectId(branchId);
  if (startDate && endDate)
    filters.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const [records, total] = await Promise.all([
    InventoryLedger.find(filters)
      .populate("productVariantId", "variantName sku")
      .populate("branchId", "name")
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    InventoryLedger.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit) },
    data: records,
  });
});
