// const asyncHandler = require("../../middleware/asyncHandler");
// const { generateToken } = require("../utils/token.util");

// // @desc    Login a tenant user
// // @route   POST /api/v1/tenant/auth/login
// // @access  Public (but requires tenant context)
// exports.login = asyncHandler(async (req, res, next) => {
//   const { email, password } = req.body;
//   const { User } = req.models; // Get the User model specific to this tenant's DB

//   if (!email || !password) {
//     return res
//       .status(400)
//       .json({ success: false, error: "Please provide email and password" });
//   }

//   // Find user in the specific tenant's database
//   const user = await User.findOne({ email }).select("+password");

//   if (!user || !(await user.comparePassword(password))) {
//     return res
//       .status(401)
//       .json({ success: false, error: "Invalid credentials" });
//   }

//   const token = generateToken(user._id);

//   res.status(200).json({ success: true, token });
// });
