const asyncHandler = require("../../../middleware/asyncHandler");
const { generateToken } = require("../../../utils/token.util"); // Assume token util exists

// @desc    Login a tenant user
// @route   POST /api/v1/tenant/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // The User model is specific to the tenant's DB, provided by our resolver
  const { User, Role } = req.models;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Please provide email and password" });
  }

  // Find user in their specific tenant database and explicitly include the password
  const user = await User.findOne({ email }).select("+password").populate("role");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, error: "Your account is disabled." });
  }

  // Prepare the JWT payload with all necessary info for the frontend
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user?.role?.name,
    permissions: user?.role?.permissions,
    tenantId: req.tenant._id,
    companyName: req.tenant.companyName,
    subdomain: req.tenant.subdomain,
    branchId: user.assignedBranchId, // For later use
    enabledModules: req.tenant.enabledModules,
    localization: req.tenant.settings.localization,
  };

  const token = generateToken(payload);

  res.status(200).json({ success: true, token });
});

// @desc    Validate an access card and check for a specific permission
// @route   POST /api/v1/tenant/auth/validate-card
exports.validateAccessCard = asyncHandler(async (req, res, next) => {
  const { Employee } = req.models;
  const { cardId, requiredPermission } = req.body;

  if (!cardId || !requiredPermission) {
    return res
      .status(400)
      .json({ success: false, error: "Card ID and required permission are required." });
  }

  // 1. Find the employee by their access card
  const employee = await Employee.findOne({ accessCardId: cardId }).populate({
    path: "userId",
    select: "name permissions",
    populate: { path: "role", select: "permissions" },
  });

  if (!employee) {
    return res.status(401).json({ success: false, error: "Invalid access card." });
  }

  // 2. Check if the employee is linked to a system user
  const user = employee.userId;
  if (!user) {
    return res.status(403).json({ success: false, error: "Employee has no system access." });
  }

  // 3. Check if the user has the required permission
  const userPermissions = new Set([...(user.permissions || []), ...(user.role?.permissions || [])]);
  if (!userPermissions.has(requiredPermission)) {
    return res
      .status(403)
      .json({ success: false, error: "Authorization failed: Insufficient permissions." });
  }

  // On success, return the name of the authorizing user
  res.status(200).json({ success: true, data: { authorizedBy: user.name } });
});
