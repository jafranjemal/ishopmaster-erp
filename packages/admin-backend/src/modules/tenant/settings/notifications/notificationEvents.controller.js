const asyncHandler = require("../../../../middleware/asyncHandler");
const notificationEvents = require("../../../admin/constants/notificationEvents.masterlist");

exports.getNotificationEvents = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: notificationEvents });
});
