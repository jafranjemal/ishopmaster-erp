const asyncHandler = require("../../../../middleware/asyncHandler");

// @desc    Get all repair types
// @route   GET /api/v1/tenant/inventory/repairs
exports.getAllRepairTypes = asyncHandler(async (req, res, next) => {
  const { RepairType } = req.models;
  const repairTypes = await RepairType.find({}).sort({ name: 1 });
  res.status(200).json({ success: true, data: repairTypes });
});

// @desc    Create a new repair type
// @route   POST /api/v1/tenant/inventory/repairs
exports.createRepairType = asyncHandler(async (req, res, next) => {
  const { RepairType } = req.models;
  const newRepairType = await RepairType.create(req.body);
  res.status(201).json({ success: true, data: newRepairType });
});

// @desc    Update a repair type
// @route   PUT /api/v1/tenant/inventory/repairs/:id
exports.updateRepairType = asyncHandler(async (req, res, next) => {
  const { RepairType } = req.models;
  const updatedRepairType = await RepairType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedRepairType)
    return res.status(404).json({ success: false, error: "Repair type not found" });
  res.status(200).json({ success: true, data: updatedRepairType });
});

// @desc    Delete a repair type
// @route   DELETE /api/v1/tenant/inventory/repairs/:id
exports.deleteRepairType = asyncHandler(async (req, res, next) => {
  const { RepairType, ProductVariant } = req.models;
  const repairTypeId = req.params.id;

  // Integrity Check
  const variantCount = await ProductVariant.countDocuments({ repairTypeId: repairTypeId });
  if (variantCount > 0) {
    return res
      .status(400)
      .json({
        success: false,
        error: `Cannot delete. This repair type is linked to ${variantCount} service(s).`,
      });
  }

  const repairType = await RepairType.findByIdAndDelete(repairTypeId);
  if (!repairType) return res.status(404).json({ success: false, error: "Repair type not found" });

  res.status(200).json({ success: true, data: {} });
});
