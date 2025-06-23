const asyncHandler = require("../../../middleware/asyncHandler");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// @desc    Generate a signature for direct-to-cloudinary uploads
// @route   POST /api/v1/tenant/uploads/signature
// @access  Private
exports.getCloudinarySignature = asyncHandler(async (req, res, next) => {
  // Get the timestamp from the request body sent by the frontend
  const timestamp = req.body.timestamp;

  // Use the SDK to securely generate a signature on the backend
  const signature = cloudinary.utils.api_sign_request(
    { timestamp: timestamp },
    process.env.CLOUD_API_SECRET
  );

  res.status(200).json({
    success: true,
    signature: signature,
    timestamp: timestamp,
  });
});
