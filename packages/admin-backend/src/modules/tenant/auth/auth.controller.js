const asyncHandler = require("../../../middleware/asyncHandler");
const { generateToken } = require("../../../utils/token.util"); // Assume token util exists

// @desc    Login a tenant user
// @route   POST /api/v1/tenant/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // The User model is specific to the tenant's DB, provided by our resolver
  const { User, Role } = req.models;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide email and password" });
  }

  // Find user in their specific tenant database and explicitly include the password
  const user = await User.findOne({ email })
    .select("+password")
    .populate("role");

  if (!user || !(await user.comparePassword(password))) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res
      .status(403)
      .json({ success: false, error: "Your account is disabled." });
  }

  console.log(JSON.stringify(user?.role?.permissions)); // Debugging line to inspect user object
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
