const asyncHandler = require("../../../middleware/asyncHandler")

// @desc    Get backup history for the currently authenticated tenant
// @route   GET /api/v1/tenant/backups
exports.getTenantBackups = asyncHandler(async (req, res, next) => {
  // We need to get the BackupRecord model from the Admin DB connection
  const AdminBackupRecord = req.adminDbConnection.model("BackupRecord")

  const { page = 1, limit = 25 } = req.query
  const skip = (page - 1) * limit

  const query = { tenant: req.tenant._id }

  const [records, total] = await Promise.all([
    AdminBackupRecord.find(query)
      .select("-tenant") // Don't need to show the tenant since they are the one asking
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    AdminBackupRecord.countDocuments(query),
  ])

  res.status(200).json({
    success: true,
    count: records.length,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), total },
    data: records,
  })
})
