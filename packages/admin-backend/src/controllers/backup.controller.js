const asyncHandler = require("../middleware/asyncHandler");
const Tenant = require("../modules/admin/tenants/tenant.model");

const {
  backupTenantDatabase,
  restoreTenantDatabase,
} = require("../services/backup.service");

// @desc    Trigger a manual backup for a tenant
// @route   POST /api/v1/tenants/:id/backup
// @access  Private (Super Admin)
exports.triggerBackup = asyncHandler(async (req, res, next) => {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) {
    return res.status(404).json({ success: false, error: "Tenant not found" });
  }

  const backupFilePath = await backupTenantDatabase(tenant.dbName);

  res.status(200).json({
    success: true,
    message: `Backup for tenant ${tenant.companyName} created successfully.`,
    file: backupFilePath,
  });
});

// @desc    Restore a tenant from the latest backup
// @route   POST /api/v1/tenants/:id/restore
// @access  Private (Super Admin)
exports.triggerRestore = asyncHandler(async (req, res, next) => {
  // In a real app, you would list available backups and let the admin choose.
  // For simplicity, we are not implementing that here. This assumes a backup file is known.
  const { backupFileName } = req.body;
  if (!backupFileName) {
    return res.status(400).json({
      success: false,
      error: "backupFileName is required in the request body.",
    });
  }

  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) {
    return res.status(404).json({ success: false, error: "Tenant not found" });
  }

  const message = await restoreTenantDatabase(tenant.dbName, backupFileName);

  res.status(200).json({ success: true, message });
});
