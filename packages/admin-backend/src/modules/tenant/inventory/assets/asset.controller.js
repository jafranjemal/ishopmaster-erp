const asyncHandler = require("../../../../middleware/asyncHandler");
const mongoose = require("mongoose");
const assetService = require("../../../../services/asset.service");

/**
 * @desc    Get all assets with filtering, sorting, and pagination
 * @route   GET /api/v1/tenant/inventory/assets
 * @access  Private (Requires 'inventory:asset:view' permission)
 */
exports.getAllAssets = asyncHandler(async (req, res, next) => {
  const { Asset } = req.models;
  const { page = 1, limit = 25, search, deviceId, customerId } = req.query;
  const skip = (page - 1) * limit;

  const filters = {};
  if (search) {
    const regex = new RegExp(search, "i");
    filters.$or = [{ serialNumber: regex }, { imei: regex }];
  }
  if (deviceId) filters.deviceId = new mongoose.Types.ObjectId(deviceId);
  if (customerId) filters["owner.item"] = new mongoose.Types.ObjectId(customerId);

  const [assets, total] = await Promise.all([
    Asset.find(filters)
      .populate("deviceId", "name")
      .populate("owner.item", "name") // Populates Customer or Tenant name
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Asset.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    },
    data: assets,
  });
});

/**
 * @desc    Get a single asset by its ID
 * @route   GET /api/v1/tenant/inventory/assets/:id
 * @access  Private (Requires 'inventory:asset:view' permission)
 */
exports.getAssetById = asyncHandler(async (req, res, next) => {
  const { Asset } = req.models;
  const asset = await Asset.findById(req.params.id)
    .populate("deviceId")
    .populate("owner.item")
    .populate({
      path: "repairHistory",
      select: "ticketNumber status createdAt",
    });

  if (!asset) {
    return res.status(404).json({ success: false, error: "Asset not found." });
  }
  res.status(200).json({ success: true, data: asset });
});

/**
 * @desc    Create a new asset (typically done via service intake, but available for admins)
 * @route   POST /api/v1/tenant/inventory/assets
 * @access  Private (Requires 'inventory:asset:manage' permission)
 */
exports.createAsset = asyncHandler(async (req, res, next) => {
  const { Asset } = req.models;
  const newAsset = await Asset.create(req.body);
  res.status(201).json({ success: true, data: newAsset });
});

/**
 * @desc    Update an existing asset
 * @route   PUT /api/v1/tenant/inventory/assets/:id
 * @access  Private (Requires 'inventory:asset:manage' permission)
 */
exports.updateAsset = asyncHandler(async (req, res, next) => {
  const { Asset } = req.models;
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!asset) {
    return res.status(404).json({ success: false, error: "Asset not found." });
  }
  res.status(200).json({ success: true, data: asset });
});

/**
 * @desc    Delete an asset
 * @route   DELETE /api/v1/tenant/inventory/assets/:id
 * @access  Private (Requires 'inventory:asset:manage' permission)
 */
exports.deleteAsset = asyncHandler(async (req, res, next) => {
  const { Asset, RepairTicket } = req.models;
  const assetId = req.params.id;

  // Integrity Check: Prevent deletion if the asset is linked to any repair tickets.
  const ticketCount = await RepairTicket.countDocuments({ assetId: assetId });
  if (ticketCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete. This asset is linked to ${ticketCount} repair ticket(s).`,
    });
  }

  const asset = await Asset.findByIdAndDelete(assetId);
  if (!asset) {
    return res.status(404).json({ success: false, error: "Asset not found." });
  }
  res.status(200).json({ success: true, data: {} });
});
