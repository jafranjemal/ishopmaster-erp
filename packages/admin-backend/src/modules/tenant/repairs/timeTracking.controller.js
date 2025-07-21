const asyncHandler = require("../../../middleware/asyncHandler");
const timeTrackingService = require("../../../services/timeTracking.service");

exports.startTimer = asyncHandler(async (req, res, next) => {
  const { Employee } = req.models;
  const employee = await Employee.findOne({ userId: req.user._id });
  if (!employee) return res.status(403).json({ success: false, error: "Only employees can track time." });

  const newLog = await timeTrackingService.startTimer(req.models, {
    ticketId: req.params.ticketId,
    employeeId: employee._id,
    userId: req.user._id,
  });
  res.status(201).json({ success: true, data: newLog });
});

exports.stopTimer = asyncHandler(async (req, res, next) => {
  const { Employee } = req.models;
  const employee = await Employee.findOne({ userId: req.user._id });
  if (!employee) return res.status(403).json({ success: false, error: "Only employees can track time." });

  const { ticket } = await timeTrackingService.stopTimer(req.models, {
    ticketId: req.params.ticketId,
    employeeId: employee._id,
    userId: req.user._id,
  });
  res.status(200).json({ success: true, data: ticket });
});

/**
 * @desc    Get the active timer log for the current user on a specific ticket
 * @route   GET /api/v1/tenant/repairs/time-tracking/tickets/:ticketId/timer/active
 * @access  Private
 */
exports.getActiveTimer = asyncHandler(async (req, res, next) => {
  const { LaborLog, Employee } = req.models;
  const { ticketId } = req.params;

  const employee = await Employee.findOne({ userId: req.user._id });
  if (!employee) {
    // Return null if the user is not an employee, as they can't have a timer.
    return res.status(200).json({ success: true, data: null });
  }

  const activeTimer = await LaborLog.findOne({
    repairTicketId: ticketId,
    employeeId: employee._id,
    status: "in_progress",
  }).lean();

  res.status(200).json({ success: true, data: activeTimer });
});
