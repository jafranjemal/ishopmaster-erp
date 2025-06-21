const asyncHandler = require("../../../middleware/asyncHandler");

// --- WAREHOUSE CONTROLLERS ---

// @desc    Get all warehouses for the current tenant
// @route   GET /api/v1/tenant/locations/warehouses
exports.getAllWarehouses = asyncHandler(async (req, res, next) => {
  const { Warehouse } = req.models;
  const warehouses = await Warehouse.find({}).sort({ isPrimary: -1, name: 1 });
  res.status(200).json({ success: true, data: warehouses });
});

// @desc    Create a new warehouse for the current tenant
// @route   POST /api/v1/tenant/locations/warehouses
exports.createWarehouse = asyncHandler(async (req, res, next) => {
  const { Warehouse } = req.models;
  const newWarehouse = await Warehouse.create(req.body);
  res.status(201).json({ success: true, data: newWarehouse });
});

// @desc    Update a warehouse
// @route   PUT /api/v1/tenant/locations/warehouses/:id
exports.updateWarehouse = asyncHandler(async (req, res, next) => {
  const { Warehouse } = req.models;
  const updatedWarehouse = await Warehouse.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedWarehouse)
    return res
      .status(404)
      .json({ success: false, error: "Warehouse not found" });
  res.status(200).json({ success: true, data: updatedWarehouse });
});

// @desc    Delete a warehouse
// @route   DELETE /api/v1/tenant/locations/warehouses/:id
exports.deleteWarehouse = asyncHandler(async (req, res, next) => {
  const { Warehouse, Branch } = req.models; // Add Branch model to check for links

  // Check if any branches are linked to this warehouse before deleting
  const linkedBranchCount = await Branch.countDocuments({
    linkedWarehouseId: req.params.id,
  });
  if (linkedBranchCount > 0) {
    return res
      .status(400)
      .json({
        success: false,
        error: `Cannot delete. This warehouse is linked to ${linkedBranchCount} branch(es).`,
      });
  }

  const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
  if (!warehouse)
    return res
      .status(404)
      .json({ success: false, error: "Warehouse not found" });

  res.status(200).json({ success: true, data: {} });
});

// --- BRANCH CONTROLLERS ---

// @desc    Get all branches for the current tenant
// @route   GET /api/v1/tenant/locations/branches
exports.getAllBranches = asyncHandler(async (req, res, next) => {
  const { Branch } = req.models;
  const branches = await Branch.find({})
    .populate("linkedWarehouseId", "name")
    .sort({ isPrimary: -1, name: 1 });
  res.status(200).json({ success: true, data: branches });
});

// @desc    Create a new branch for the current tenant
// @route   POST /api/v1/tenant/locations/branches
exports.createBranch = asyncHandler(async (req, res, next) => {
  const { Branch } = req.models;
  const newBranch = await Branch.create(req.body);
  res.status(201).json({ success: true, data: newBranch });
});

// @desc    Update a branch
// @route   PUT /api/v1/tenant/locations/branches/:id
exports.updateBranch = asyncHandler(async (req, res, next) => {
  const { Branch } = req.models;
  const updatedBranch = await Branch.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedBranch)
    return res.status(404).json({ success: false, error: "Branch not found" });
  res.status(200).json({ success: true, data: updatedBranch });
});

// @desc    Delete a branch
// @route   DELETE /api/v1/tenant/locations/branches/:id
exports.deleteBranch = asyncHandler(async (req, res, next) => {
  const { Branch } = req.models;
  // Add logic here to check if branch has active sales, inventory etc. before deleting
  const branch = await Branch.findByIdAndDelete(req.params.id);
  if (!branch)
    return res.status(404).json({ success: false, error: "Branch not found" });
  res.status(200).json({ success: true, data: {} });
});
