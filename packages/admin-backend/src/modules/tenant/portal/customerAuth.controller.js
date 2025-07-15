const asyncHandler = require("../../../middleware/asyncHandler");
const notificationService = require("../../../services/notification.service");
const tokenService = require("../../../services/token.service");
const jwt = require("jsonwebtoken"); // Ensure jsonwebtoken is installed

// Helper to sign a JWT for the customer
const generateCustomerToken = (customerId) => {
  return jwt.sign({ id: customerId, type: "customer" }, process.env.JWT_SECRET, {
    expiresIn: "1d", // Customer session lasts for 1 day
  });
};

exports.validateToken = asyncHandler(async (req, res, next) => {
  const { CustomerAuthToken } = req.models;
  const { token } = req.body;

  if (!token) return res.status(400).json({ success: false, error: "Token is required." });

  const authToken = await CustomerAuthToken.findOne({ token }).populate("customerId");

  let responseData = {};
  let sessionToken = null;
  console.log("tenant id ", req.tenant);
  console.log(authToken);

  if (authToken?.repairTicketId) {
    // This is a limited, single-repair token
    const repairTicket = await req.models.RepairTicket.findById(authToken.repairTicketId);
    responseData.ticket = repairTicket;
    responseData.customer = authToken.customerId;
  } else {
    // This is a full-access token, so we issue a session JWT
    sessionToken = generateCustomerToken(authToken.customerId._id);
    responseData.customer = authToken.customerId;
  }

  authToken.status = "used";
  await authToken.save();

  res.status(200).json({ success: true, data: responseData, sessionToken });
});

// @desc    Request a full login link to be sent to the customer's email
// @route   POST /api/v1/portal/auth/request-login-link
exports.requestFullLoginLink = asyncHandler(async (req, res, next) => {
  const { token } = req.body; // Use the initial, limited token to identify the customer
  const { CustomerAuthToken, NotificationService } = req.models;

  const initialToken = await CustomerAuthToken.findOne({ token, status: "used" }).populate(
    "customerId"
  );
  if (!initialToken || !initialToken.customerId.email) {
    return res.status(400).json({ success: false, error: "Invalid session or no email on file." });
  }

  console.log("Initial token found:", initialToken);
  // Generate a new, more powerful token (in a real app, this might have different scopes)
  const fullAccessLoginToken = await tokenService.generateForCustomer(models, {
    customerId: initialToken.customerId._id,
    tenantId: req.tenant.tenantId, // Include tenantId for multi-tenant support
  });

  // Send email via NotificationService
  await notificationService.sendEmail({
    to: initialToken.customerId.email,
    subject: "Your Secure Login Link for iShopMaster",
    html: `<p>Hi ${initialToken.customerId.name},</p><p>Click this secure, one-time link to access your full account dashboard. This link will expire in 15 minutes.</p><p><a href="http://localhost:5174/portal/login?token=${fullAccessLoginToken}">Click here to sign in</a></p>`,
  });

  res
    .status(200)
    .json({ success: true, message: `Login link sent to ${initialToken.customerId.email}` });
});

// @desc    Allow a customer to request a new access link via their email
// @route   POST /api/v1/portal/auth/resend-link
exports.resendAccessLink = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email address is required." });

  const { Customer, RepairTicket } = req.models;

  const customer = await Customer.findOne({ email });
  if (!customer) {
    // We send a success response even if the customer isn't found to prevent email enumeration attacks.
    return res.status(200).json({
      success: true,
      message: "If an account with this email exists, a new access link has been sent.",
    });
  }

  // Find their most recent active repair ticket to generate a link for.
  const lastTicket = await RepairTicket.findOne({ customerId: customer._id }).sort({
    createdAt: -1,
  });
  if (!lastTicket) {
    return res.status(200).json({
      success: true,
      message: "If an account with this email exists, a new access link has been sent.",
    });
  }

  // Generate a new token and send the email (logic from TokenService and NotificationService)
  const token = await tokenService.generateForRepairTicket(req.models, { ticket: lastTicket });
  const loginUrl = `${process.env.FRONTEND_PORTAL_BASE_URL}/portal/track?token=${token}`;

  await notificationService.sendEmail({
    to: customer.email,
    subject: "Your New Secure Access Link for iShopMaster",
    html: `<p>Hi ${customer.name},</p><p>As requested, here is a new, secure link to track your repair status. This link will expire in 7 days.</p><p><a href="${loginUrl}">Click here to view your repair status</a></p>`,
  });

  res.status(200).json({
    success: true,
    message: "If an account with this email exists, a new access link has been sent.",
  });
});
// @desc    Generate a one-time login token for a customer to access their portal
// @route   POST /api/v1/tenant/portal/auth/generate-token
exports.generateToken = asyncHandler(async (req, res, next) => {
  const { CustomerAuthToken } = req.models;
  const { customerId } = req.body;

  if (!customerId)
    return res.status(400).json({ success: false, error: "Customer ID is required." });

  // Generate a new token for the customer
  const token = await tokenService.generateForCustomer(req.models, { customerId });

  // Create a new auth token record
  const authToken = await CustomerAuthToken.create({
    token,
    customerId,
    status: "active",
    expiryDate: new Date(Date.now() + 15 * 60 * 1000), // Expires in 15 minutes
  });

  res.status(201).json({ success: true, data: authToken });
});
