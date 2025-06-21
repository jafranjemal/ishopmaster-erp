const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");

// Middleware to protect routes by verifying JWT
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  console.log("Auth middleware running...");

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token Not found, Not authorized to access this route",
    });
  }

  try {
    // Verify token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get the User model from the request (attached by tenantResolver)
    const { User } = req.models;

    // Find user by the ID in the token payload and attach it to the request
    req.user = await User.findById(decoded.id.id).populate("role");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "The user belonging to this token does no longer exist.",
      });
    }

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: "Not authorized to access this route" });
  }
});

// Middleware to grant access to specific roles/permissions
exports.authorize = (...permissions) => {
  return (req, res, next) => {
    // console.log("Authorization middleware running...");
    // console.log("Required permissions:", permissions);
    // console.log("User role permissions:", req.user?.role?.permissions);
    // console.log("User role name:", req.user?.role?.name);
    // console.log("User ID:", req.user?._id);
    // console.log("Request user object:", req.user);

    // If no permissions are specified, allow access
    const userPermissions = req.user?.role?.permissions || [];

    // Check if the user's permission list includes at least one of the required permissions
    const hasPermission = permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `User with role '${req.user?.role?.name}' is not authorized to perform this action.`,
      });
    }
    next();
  };
};
