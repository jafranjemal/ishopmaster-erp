const { default: mongoose } = require("mongoose");
const asyncHandler = require("../../../middleware/asyncHandler");
const timeTrackingService = require("../../../services/timeTracking.service");

exports.startTimer = asyncHandler(async (req, res, next) => {
  const employee = await getEmployee(req.models, req.user._id);
  const session = await req.dbConnection.startSession();
  try {
    await session.withTransaction(async () => {
      const newLog = await timeTrackingService.startTimer(req.models, { ticketId: req.params.ticketId, employeeId: employee._id }, session);
      res.status(201).json({ success: true, data: newLog });
    });
  } finally {
    session.endSession();
  }
});

exports.pauseTimer = asyncHandler(async (req, res, next) => {
  const employee = await getEmployee(req.models, req.user._id);
  const session = await req.dbConnection.startSession();
  try {
    await session.withTransaction(async () => {
      const pausedLog = await timeTrackingService.pauseTimer(
        req.models,
        { ticketId: req.params.ticketId, employeeId: employee._id },
        session
      );
      res.status(200).json({ success: true, data: pausedLog });
    });
  } finally {
    session.endSession();
  }
});

exports.stopTimer = asyncHandler(async (req, res, next) => {
  const employee = await getEmployee(req.models, req.user._id);
  const session = await req.dbConnection.startSession();
  try {
    await session.withTransaction(async () => {
      const { ticket } = await timeTrackingService.stopTimer(
        req.models,
        { ticketId: req.params.ticketId, employeeId: employee._id },
        session
      );
      res.status(200).json({ success: true, data: ticket });
    });
  } finally {
    session.endSession();
  }
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
    // If user isn't an employee, send back a default state
    return res.status(200).json({
      success: true,
      data: { activeTimer: null, totalHoursLogged: 0 },
    });
  }

  // 1. Find the currently active timer (if any)
  const activeTimer = await LaborLog.findOne({
    repairTicketId: ticketId,
    employeeId: employee._id,
    status: { $in: ["in_progress", "paused"] },
  }).lean();

  // 2. Calculate the sum of all previously logged minutes for this ticket/employee
  const totalMinutesAggregation = await LaborLog.aggregate([
    {
      $match: {
        repairTicketId: new mongoose.Types.ObjectId(ticketId),
        employeeId: employee._id,
      },
    },
    {
      $group: {
        _id: null, // Group all matched logs together
        totalMinutes: { $sum: "$durationMinutes" },
      },
    },
  ]);

  const totalMinutes = totalMinutesAggregation.length > 0 ? totalMinutesAggregation[0].totalMinutes : 0;

  // 3. Send both the active timer and the total logged hours in the response
  res.status(200).json({
    success: true,
    data: {
      ...activeTimer,
      totalHoursLogged: totalMinutes / 60,
    },
  });
});

const getEmployee = async (models, userId) => {
  const employee = await models.Employee.findOne({ userId });
  if (!employee) throw new Error("Only employees can track time.");
  return employee;
};
