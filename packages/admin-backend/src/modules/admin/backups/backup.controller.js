// ========== File: modules/admin/backups/backup.controller.js (New File) ==========

const asyncHandler = require("../../../middleware/asyncHandler")
const backupService = require("../../../services/backup.service")
const Tenant = require("../tenants/tenant.model")
const BackupRecord = require("./backupRecord") // Assuming model is registered

// @desc    Get all backup records for all tenants (Super Admin only)
// @route   GET /api/v1/admin/backups
exports.getAllBackups = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 25, tenantId } = req.query
  const skip = (page - 1) * limit

  const query = {}
  if (tenantId) {
    query.tenant = tenantId
  }

  const [records, total] = await Promise.all([
    BackupRecord.find(query).populate("tenant", "companyName subdomain").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    BackupRecord.countDocuments(query),
  ])

  res.status(200).json({
    success: true,
    count: records.length,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), total },
    data: records,
  })
})

/**
 * @desc    Restore a tenant's database from a specific backup.
 * @route   POST /api/v1/admin/backups/:id/restore
 * @access  Private (Super Admin only)
 */
exports.restoreBackup = asyncHandler(async (req, res, next) => {
  const { id: backupRecordId } = req.params
  //const adminUserId = req.user._id // Assuming user is attached by auth middleware

  // Note: In a production system, this API would trigger a background job
  // for long-running restores. For now, we do it synchronously.
  const result = await backupService.restoreTenantDatabase(backupRecordId, "manual")

  res.status(200).json(result)
})

// ✅ NEW: Controller function to trigger a manual backup.
/**
 * @desc    Trigger a new, on-demand backup for a specific tenant.
 * @route   POST /api/v1/admin/backups/trigger
 * @access  Private (Super Admin only)
 */
exports.triggerManualBackup = asyncHandler(async (req, res, next) => {
  const { tenantId } = req.body
  const adminUserId = req?.user?._id // Get the admin user from the auth middleware

  if (!tenantId) {
    return next(new ErrorResponse("Tenant ID is required.", 400))
  }

  const tenant = await Tenant.findById(tenantId)
  if (!tenant) {
    return next(new ErrorResponse("Tenant not found.", 404))
  }

  // We call the service but we DO NOT wait for it to finish.
  // A backup can take a long time. We trigger it and immediately
  // send a response to the admin so their UI doesn't hang.
  // This is a professional, asynchronous workflow.
  backupService.backupTenantDatabase(tenant.dbName, tenant._id, "manual_admin", "manual")

  res.status(202).json({
    success: true,
    message: `Backup job for tenant "${tenant.companyName}" has been successfully triggered. It will run in the background.`,
  })
})
