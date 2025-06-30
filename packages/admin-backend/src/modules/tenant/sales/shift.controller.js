const asyncHandler = require("../../../middleware/asyncHandler");
const shiftService = require("../../../services/shift.service");

exports.openShift = asyncHandler(async (req, res, next) => {
  const { openingFloat } = req.body;
  const newShift = await shiftService.openShift(req.models, {
    userId: req.user._id,
    branchId: req.user.assignedBranchId, // Assumes user has assigned branch
    openingFloat,
  });
  res.status(201).json({ success: true, data: newShift });
});

exports.closeShift = asyncHandler(async (req, res, next) => {
  const { closingFloat } = req.body;
  const closedShift = await shiftService.closeShift(req.models, {
    shiftId: req.params.id,
    userId: req.user._id,
    closingFloat,
  });
  res.status(200).json({ success: true, data: closedShift });
});

exports.getActiveShift = asyncHandler(async (req, res, next) => {
  const { ShiftSummary } = req.models;
  const activeShift = await ShiftSummary.findOne({ userId: req.user._id, status: "open" });
  res.status(200).json({ success: true, data: activeShift }); // Will be null if no active shift
});

exports.getShiftHistory = asyncHandler(async (req, res, next) => {
  // Full pagination logic would be added here
  const { ShiftSummary } = req.models;
  const history = await ShiftSummary.find({ status: "closed" })
    .populate("userId", "name")
    .populate("branchId", "name")
    .sort({ shift_end: -1 });
  res.status(200).json({ success: true, data: history });
});
