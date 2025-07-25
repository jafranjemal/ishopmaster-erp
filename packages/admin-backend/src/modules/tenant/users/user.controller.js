const asyncHandler = require("../../../middleware/asyncHandler");

// @desc    Get all users for the tenant (scoped by branch for managers)
// @route   GET /api/v1/tenant/users
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { User } = req.models;
  const loggedInUser = req.user;

  let query = {};

  // SECURITY: If the user does not have the permission to view all employees,
  // we add a filter to the database query to only return users from their own branch.
  if (!loggedInUser.role.permissions.includes("hr:employee:view_all")) {
    query.assignedBranchId = loggedInUser.assignedBranchId;
  }

  const users = await User.find(query).populate("role", "name").populate("assignedBranchId", "name").sort({ name: 1 });

  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Get single user by ID
// @route   GET /api/v1/tenant/users/:id
exports.getUserById = asyncHandler(async (req, res, next) => {
  const { User } = req.models;
  const user = await User.findById(req.params.id).populate("role", "name").populate("assignedBranchId", "name");
  if (!user) return res.status(404).json({ success: false, error: "User not found" });
  res.status(200).json({ success: true, data: user });
});

// @desc    Create a new user for the tenant
// @route   POST /api/v1/tenant/users
exports.createUser = asyncHandler(async (req, res, next) => {
  const { User } = req.models;
  const newUser = await User.create(req.body);
  res.status(201).json({ success: true, data: newUser });
});

// @desc    Update a user's details (but not their password)
// @route   PUT /api/v1/tenant/users/:id
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { User } = req.models;
  const { name, email, phone, address, role, assignedBranchId, isActive } = req.body;
  // Password changes MUST happen via a separate, dedicated endpoint for security.
  const fieldsToUpdate = {
    name,
    email,
    phone,
    address,
    role,
    assignedBranchId,
    isActive,
  };

  const updatedUser = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) return res.status(404).json({ success: false, error: "User not found" });
  res.status(200).json({ success: true, data: updatedUser });
});

// @desc    Deactivate a user (soft delete)
// @route   DELETE /api/v1/tenant/users/:id
exports.deactivateUser = asyncHandler(async (req, res, next) => {
  const { User } = req.models;
  // Instead of deleting, we set the user to inactive.
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ success: false, error: "User not found" });
  res.status(200).json({ success: true, data: {}, message: "User has been deactivated." });
});

// @desc    Reset a user's password (by an admin)
// @route   PATCH /api/v1/tenant/users/:id/reset-password
// @access  Private (Requires 'hr:employee:manage_credentials' permission)
exports.adminResetUserPassword = asyncHandler(async (req, res, next) => {
  const { User } = req.models;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: "New password must be at least 6 characters." });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found." });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, data: { message: `Password for ${user.name} has been reset.` } });
});

/**
 * @desc    Get the default dashboard URL for the currently logged-in user based on their role.
 * @route   GET /api/v1/admin/users/me/default-dashboard
 * @access  Private
 */
exports.getMyDefaultDashboard = asyncHandler(async (req, res, next) => {
  const user = req.user; // Assuming user object with roles/permissions is attached by auth middleware

  // --- Definitive Fix #1: Role-based redirect logic ---
  // This hierarchy determines the user's primary workspace.
  // The first match in this list will be their destination.
  let defaultUrl = "/dashboard"; // Fallback for general admins

  if (user.role.name.includes("technician")) {
    defaultUrl = "/service/my-dashboard";
  } else if (user.role.name.includes("cashier")) {
    defaultUrl = "/pos/shifts"; // Send cashiers to the gatekeeper first
  } else if (user.role.name.includes("service_advisor")) {
    defaultUrl = "/service/dashboard";
  }
  // Add other role-based redirects here.

  res.status(200).json({ success: true, data: { defaultUrl } });
});
