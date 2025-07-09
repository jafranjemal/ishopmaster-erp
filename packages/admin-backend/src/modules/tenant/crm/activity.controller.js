const asyncHandler = require("../../../middleware/asyncHandler");
const activityService = require("../../../services/activity.service");

// @desc    Get all activities for a specific related document (Lead, Opportunity, etc.)
// @route   GET /api/v1/tenant/crm/activities?relatedToId=...&relatedToType=...
exports.getAllActivities = asyncHandler(async (req, res, next) => {
  const { Activity } = req.models;
  const { relatedToId, relatedToType } = req.query;

  if (!relatedToId || !relatedToType) {
    return res
      .status(400)
      .json({
        success: false,
        error: "relatedToId and relatedToType are required query parameters.",
      });
  }

  const filters = {
    relatedToId: new mongoose.Types.ObjectId(relatedToId),
    relatedToType: relatedToType,
  };

  const activities = await Activity.find(filters)
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: activities });
});

// @desc    Create a new activity
// @route   POST /api/v1/tenant/crm/activities
exports.createActivity = asyncHandler(async (req, res, next) => {
  const activity = await activityService.createActivity(req.models, req.body, req.user._id);
  res.status(201).json({ success: true, data: activity });
});
