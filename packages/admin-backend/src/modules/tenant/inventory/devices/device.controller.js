const asyncHandler = require("../../../../middleware/asyncHandler");
const mongoose = require("mongoose");

// @desc    Get all devices, with optional filtering by manufacturer
// @route   GET /api/v1/tenant/inventory/devices?brandId=:brandId
exports.getAllDevices = asyncHandler(async (req, res, next) => {
  const { Device } = req.models;
  const { brandId } = req.query;

  const filters = {};
  if (brandId) {
    filters.brandId = new mongoose.Types.ObjectId(brandId);
  }

  const devices = await Device.find(filters)
    .populate("brandId", "name")
    .populate("categoryId", "name")
    .sort({ name: 1 });

  res.status(200).json({ success: true, data: devices });
});

// @desc    Get a single device by ID
// @route   GET /api/v1/tenant/inventory/devices/:id
exports.getDeviceById = asyncHandler(async (req, res, next) => {
  const { Device } = req.models;
  const device = await Device.findById(req.params.id).populate("brandId", "name");
  if (!device) return res.status(404).json({ success: false, error: "Device not found" });
  res.status(200).json({ success: true, data: device });
});

// @desc    Create a new device
// @route   POST /api/v1/tenant/inventory/devices
exports.createDevice = asyncHandler(async (req, res, next) => {
  const { Device } = req.models;
  const newDevice = await Device.create(req.body);
  res.status(201).json({ success: true, data: newDevice });
});

// @desc    Update a device
// @route   PUT /api/v1/tenant/inventory/devices/:id
exports.updateDevice = asyncHandler(async (req, res, next) => {
  const { Device } = req.models;
  const updatedDevice = await Device.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedDevice) return res.status(404).json({ success: false, error: "Device not found" });
  res.status(200).json({ success: true, data: updatedDevice });
});

// @desc    Delete a device
// @route   DELETE /api/v1/tenant/inventory/devices/:id
exports.deleteDevice = asyncHandler(async (req, res, next) => {
  const { Device, ProductVariants } = req.models;
  const deviceId = req.params.id;

  // Integrity Check: Prevent deleting if any product variant is linked to this device
  const variantCount = await ProductVariants.countDocuments({ deviceId: deviceId });
  if (variantCount > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete. This device is linked to ${variantCount} product(s) or service(s).`,
    });
  }

  const device = await Device.findByIdAndDelete(deviceId);
  if (!device) return res.status(404).json({ success: false, error: "Device not found" });

  res.status(200).json({ success: true, data: {} });
});
