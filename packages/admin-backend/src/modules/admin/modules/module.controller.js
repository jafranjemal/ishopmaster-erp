const asyncHandler = require("../../../middleware/asyncHandler");
const Module = require("./Module");

// @desc    Get all system modules available in the ERP
// @route   GET /api/v1/admin/modules
// @access  Private (Super Admin)
exports.getAllModules = asyncHandler(async (req, res, next) => {
  // Find all documents in the Module collection.
  // We can add sorting, e.g., .sort({ name: 1 }) to always return them alphabetically.
  const modules = await Module.find({}).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: modules.length,
    data: modules,
  });
});

// @desc    Get a single module by its ID
// @route   GET /api/v1/admin/modules/:id
// @access  Private (Super Admin)
exports.getModuleById = asyncHandler(async (req, res, next) => {
  const module = await Module.findById(req.params.id);

  if (!module) {
    return res.status(404).json({ success: false, error: "Module not found" });
  }

  res.status(200).json({
    success: true,
    data: module,
  });
});

// @desc    Create one or multiple system modules
// @route   POST /api/v1/admin/modules
// @access  Private (Super Admin)
exports.createModule = asyncHandler(async (req, res, next) => {
  // Normalize incoming data to an array
  const payload = req.body;
  const modulesArray = Array.isArray(payload)
    ? payload
    : payload.modules || [payload];

  if (!Array.isArray(modulesArray) || modulesArray.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Please provide module data (single or array).",
    });
  }

  const docs = modulesArray.map((mod) => ({
    name: mod.name,
    key: mod.key,
    description: mod.description,
    isGloballyActive: mod.isGloballyActive,
  }));

  try {
    const created = await Module.insertMany(docs, { ordered: true });
    res.status(201).json({
      success: true,
      count: created.length,
      data: created,
    });
  } catch (error) {
    return next(
      new ErrorResponse("Failed to create modules: " + error.message, 400)
    );
  }
});

// @desc    Update an existing system module
// @route   PUT /api/v1/admin/modules/:id
// @access  Private (Super Admin)
exports.updateModule = asyncHandler(async (req, res, next) => {
  // Whitelist the fields that can be updated. The unique 'key' should not be updatable.
  const fieldsToUpdate = {
    name: req.body.name,
    description: req.body.description,
    isGloballyActive: req.body.isGloballyActive,
  };

  // Remove any fields that were not provided in the request body to avoid overwriting with undefined.
  Object.keys(fieldsToUpdate).forEach((key) => {
    if (fieldsToUpdate[key] === undefined) {
      delete fieldsToUpdate[key];
    }
  });

  const updatedModule = await Module.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema rules are still applied
    }
  );

  if (!updatedModule) {
    return res.status(404).json({ success: false, error: "Module not found" });
  }

  res.status(200).json({
    success: true,
    data: updatedModule,
  });
});

// @desc    Delete a system module
// @route   DELETE /api/v1/admin/modules/:id
// @access  Private (Super Admin)
exports.deleteModule = asyncHandler(async (req, res, next) => {
  const module = await Module.findById(req.params.id);

  if (!module) {
    return res.status(404).json({ success: false, error: "Module not found" });
  }

  // In a real-world scenario, you might want to check if any tenants are currently using this module
  // before allowing deletion. For now, we will proceed directly.
  await module.deleteOne();

  res.status(200).json({
    success: true,
    data: {}, // No data to return on successful deletion
    message: "Module deleted successfully.",
  });
});

// Note: The 'updateModuleModules' function does not exist in this context.
// The function to assign modules to a tenant lives in the tenant.controller.js, not here.
