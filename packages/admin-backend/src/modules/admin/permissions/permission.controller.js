const Permission = require("./permission.model"); // Assuming the model is in the same folder
const asyncHandler = require("../../../middleware/asyncHandler");

// @desc    Get all system-wide permissions
// @route   GET /api/v1/admin/permissions
// @access  Private (Super Admin)
exports.getAllPermissions = asyncHandler(async (req, res, next) => {
  // We can group permissions by module for a more organized response in the UI
  const permissions = await Permission.find({}).sort({ module: 1, key: 1 });

  // Group permissions by module
  const groupedByModule = permissions.reduce((acc, permission) => {
    const { module } = permission;
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    count: permissions.length,
    data: groupedByModule,
  });
});

// @desc    Get a single permission by its ID
// @route   GET /api/v1/admin/permissions/:id
// @access  Private (Super Admin)
exports.getPermissionById = asyncHandler(async (req, res, next) => {
  const permission = await Permission.findById(req.params.id);

  if (!permission) {
    return res
      .status(404)
      .json({ success: false, error: "Permission not found" });
  }

  res.status(200).json({
    success: true,
    data: permission,
  });
});

// @desc    Create one or multiple system permissions
// @route   POST /api/v1/admin/permissions
// @access  Private (Super Admin)
exports.createPermission = asyncHandler(async (req, res, next) => {
  // Normalize incoming body to always be an array for consistent processing.
  const items = Array.isArray(req.body) ? req.body : [req.body];

  if (items.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: "Request body cannot be empty." });
  }

  // --- REGEX FIX IS HERE ---
  // The new regex allows for multiple colon-separated parts in the key.
  // It checks for one or more groups of (':_a-z') after the initial module.
  const validKeyFormat = /^[a-z]+(:[a-z_]+)+$/;

  for (const perm of items) {
    if (
      !perm.key ||
      typeof perm.key !== "string" ||
      !validKeyFormat.test(perm.key)
    ) {
      return res.status(400).json({
        success: false,
        error: `Each permission key must be in format 'module:resource:action' (e.g., 'sales:invoice:create'). Error at key: "${perm.key}"`,
      });
    }
  }
  // --- END OF FIX ---

  // Map to the structure needed for insertMany
  const docs = items.map((perm) => ({
    key: perm.key,
    description: perm.description,
    module: perm.module,
  }));

  try {
    // Use insertMany for efficient bulk creation. `ordered: false` would continue on some errors.
    const createdPermissions = await Permission.insertMany(docs, {
      ordered: true,
    });
    res.status(201).json({
      success: true,
      count: createdPermissions.length,
      data: createdPermissions,
    });
  } catch (err) {
    // This will catch errors like duplicate keys if one already exists.
    return res
      .status(400)
      .json({
        success: false,
        error: "Failed to create permission(s). " + err.message,
      });
  }
});

// @desc    Update an existing permission
// @route   PUT /api/v1/admin/permissions/:id
// @access  Private (Super Admin)
exports.updatePermission = asyncHandler(async (req, res, next) => {
  // The unique 'key' should generally not be updatable as code might depend on it.
  // We only allow updating the human-readable description.
  const fieldsToUpdate = {
    description: req.body.description,
    module: req.body.module,
  };

  Object.keys(fieldsToUpdate).forEach((key) => {
    if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
  });

  const updatedPermission = await Permission.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPermission) {
    return res
      .status(404)
      .json({ success: false, error: "Permission not found" });
  }

  res.status(200).json({
    success: true,
    data: updatedPermission,
  });
});

// @desc    Delete a system permission
// @route   DELETE /api/v1/admin/permissions/:id
// @access  Private (Super Admin)
exports.deletePermission = asyncHandler(async (req, res, next) => {
  const permission = await Permission.findById(req.params.id);

  if (!permission) {
    return res
      .status(404)
      .json({ success: false, error: "Permission not found" });
  }

  // CRITICAL: Before deleting a permission, you should have logic to remove
  // this permission key from all `Role` documents across all tenant databases.
  // This is a complex, asynchronous task best handled by a background job.
  // For this chapter, we will perform a direct delete.

  // Example placeholder for future logic:
  // await backgroundJobService.queue('removePermissionFromAllRoles', { permissionKey: permission.key });

  await permission.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message:
      "Permission deleted successfully. Note: Roles may need to be updated.",
  });
});
