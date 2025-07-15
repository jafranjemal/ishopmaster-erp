const asyncHandler = require("../../../../middleware/asyncHandler");
const returnsService = require("../../../../services/returns.service");

exports.createReturn = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      result = await returnsService.processReturn(
        req.models,
        { returnData: req.body, userId: req.user._id, branchId: req.user.assignedBranchId },
        session,
        req.tenant
      );
    });
    res.status(201).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});
exports.getReturnById = asyncHandler(async (req, res, next) => {
  const rma = await req.models.RMA.findById(req.params.id)
    .populate("customerId", "name")
    .populate("items.productVariantId", "name sku")
    .lean();
  if (!rma) {
    return res.status(404).json({ success: false, message: "RMA not found" });
  }
  res.status(200).json({ success: true, data: rma });
});
exports.getAllReturns = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const returns = await req.models.RMA.find()
    .populate("customerId", "name")
    .populate("items.productVariantId", "name sku")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalCount = await req.models.RMA.countDocuments();
  res.status(200).json({
    success: true,
    data: returns,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
    },
  });
});
exports.updateReturn = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  let updatedRma;
  try {
    await session.withTransaction(async () => {
      updatedRma = await req.models.RMA.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        session,
      })
        .populate("customerId", "name")
        .populate("items.productVariantId", "name sku")
        .lean();
    });
    if (!updatedRma) {
      return res.status(404).json({ success: false, message: "RMA not found" });
    }
    res.status(200).json({ success: true, data: updatedRma });
  } finally {
    session.endSession();
  }
});
exports.deleteReturn = asyncHandler(async (req, res, next) => {
  const session = await req.dbConnection.startSession();
  try {
    await session.withTransaction(async () => {
      const deletedRma = await req.models.RMA.findByIdAndDelete(req.params.id, { session });
      if (!deletedRma) {
        return res.status(404).json({ success: false, message: "RMA not found" });
      }
      res.status(200).json({ success: true, message: "RMA deleted successfully" });
    });
  } finally {
    session.endSession();
  }
});
exports.getReturnSummary = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalReturns: { $sum: 1 },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: summary.length > 0 ? summary[0] : { totalReturns: 0, totalRefundAmount: 0 },
  });
});
exports.getReturnItems = asyncHandler(async (req, res, next) => {
  const rma = await req.models.RMA.findById(req.params.id)
    .populate("items.productVariantId", "name sku")
    .lean();
  if (!rma) {
    return res.status(404).json({ success: false, message: "RMA not found" });
  }
  res.status(200).json({ success: true, data: rma.items });
});
exports.getReturnByInvoiceId = asyncHandler(async (req, res, next) => {
  const rma = await req.models.RMA.findOne({ originalInvoiceId: req.params.invoiceId })
    .populate("customerId", "name")
    .populate("items.productVariantId", "name sku")
    .lean();
  if (!rma) {
    return res.status(404).json({ success: false, message: "RMA not found for this invoice" });
  }
  res.status(200).json({ success: true, data: rma });
});
exports.getReturnByCustomerId = asyncHandler(async (req, res, next) => {
  const rmas = await req.models.RMA.find({ customerId: req.params.customerId })
    .populate("customerId", "name")
    .populate("items.productVariantId", "name sku")
    .sort({ createdAt: -1 })
    .lean();
  if (rmas.length === 0) {
    return res.status(404).json({ success: false, message: "No RMAs found for this customer" });
  }
  res.status(200).json({ success: true, data: rmas });
});
exports.getReturnByBranchId = asyncHandler(async (req, res, next) => {
  const rmas = await req.models.RMA.find({ branchId: req.params.branchId })
    .populate("customerId", "name")
    .populate("items.productVariantId", "name sku")
    .sort({ createdAt: -1 })
    .lean();
  if (rmas.length === 0) {
    return res.status(404).json({ success: false, message: "No RMAs found for this branch" });
  }
  res.status(200).json({ success: true, data: rmas });
});
exports.getReturnByRmaNumber = asyncHandler(async (req, res, next) => {
  const rma = await req.models.RMA.findOne({ rmaNumber: req.params.rmaNumber })
    .populate("customerId", "name")
    .populate("items.productVariantId", "name sku")
    .lean();
  if (!rma) {
    return res.status(404).json({ success: false, message: "RMA not found" });
  }
  res.status(200).json({ success: true, data: rma });
});
exports.getReturnCountByStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const query = status ? { status } : {};

  const count = await req.models.RMA.countDocuments(query);
  res.status(200).json({ success: true, data: { count } });
});
exports.getReturnSummaryByCustomer = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$customerId",
        totalReturns: { $sum: 1 },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customerDetails",
      },
    },
    { $unwind: "$customerDetails" },
    {
      $project: {
        _id: 0,
        customerId: "$_id",
        customerName: "$customerDetails.name",
        totalReturns: 1,
        totalRefundAmount: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: summary });
});
exports.getReturnSummaryByBranch = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$branchId",
        totalReturns: { $sum: 1 },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "_id",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    { $unwind: "$branchDetails" },
    {
      $project: {
        _id: 0,
        branchId: "$_id",
        branchName: "$branchDetails.name",
        totalReturns: 1,
        totalRefundAmount: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: summary });
});
exports.getReturnSummaryByDateRange = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalReturns: { $sum: 1 },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalReturns: 1,
        totalRefundAmount: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);

  res.status(200).json({ success: true, data: summary });
});
exports.getReturnSummaryByProduct = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productVariantId",
        totalReturns: { $sum: "$items.quantityReturned" },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
    {
      $lookup: {
        from: "productvariants",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: "$productDetails.name",
        totalReturns: 1,
        totalRefundAmount: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: summary });
});
exports.getReturnSummaryByReason = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.reason",
        totalReturns: { $sum: "$items.quantityReturned" },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        reason: "$_id",
        totalReturns: 1,
        totalRefundAmount: 1,
      },
    },
    { $sort: { totalReturns: -1 } },
  ]);

  res.status(200).json({ success: true, data: summary });
});
exports.getReturnSummaryByPaymentMethod = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$resolution.type",
        totalReturns: { $sum: 1 },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        paymentMethod: "$_id",
        totalReturns: 1,
        totalRefundAmount: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: summary });
});
exports.getReturnSummaryByStatus = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$status",
        totalReturns: { $sum: 1 },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        totalReturns: 1,
        totalRefundAmount: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: summary });
});
exports.getReturnSummaryByBranchAndDate = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$branchId",
        totalReturns: { $sum: 1 },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "_id",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    { $unwind: "$branchDetails" },
    {
      $project: {
        _id: 0,
        branchId: "$_id",
        branchName: "$branchDetails.name",
        totalReturns: 1,
        totalRefundAmount: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: summary });
});
exports.getReturnSummaryByCustomerAndDate = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$customerId",
        totalReturns: { $sum: 1 },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "customerDetails",
      },
    },
    { $unwind: "$customerDetails" },
    {
      $project: {
        _id: 0,
        customerId: "$_id",
        customerName: "$customerDetails.name",
        totalReturns: 1,
        totalRefundAmount: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: summary });
});
exports.getReturnSummaryByProductAndDate = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const query = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const summary = await req.models.RMA.aggregate([
    { $match: query },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productVariantId",
        totalReturns: { $sum: "$items.quantityReturned" },
        totalRefundAmount: { $sum: "$totalRefundAmount" },
      },
    },
    {
      $lookup: {
        from: "productvariants",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: "$productDetails.name",
        totalReturns: 1,
        totalRefundAmount: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: summary });
});
