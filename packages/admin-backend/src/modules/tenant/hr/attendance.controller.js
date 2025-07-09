const asyncHandler = require("../../../middleware/asyncHandler");
const mongoose = require("mongoose");

// @desc    Get the current user's active (not clocked out) session
// @route   GET /api/v1/tenant/hr/attendance/active
exports.getActiveSession = asyncHandler(async (req, res, next) => {
  const { Attendance } = req.models;
  const employee = await req.models.Employee.findOne({ userId: req.user.id });
  if (!employee) return res.status(200).json({ success: true, data: null }); // User is not an employee

  const activeSession = await Attendance.findOne({ employeeId: employee._id, checkOutTime: null });
  res.status(200).json({ success: true, data: activeSession });
});

// @desc    Create a manual attendance entry (for managers)
// @route   POST /api/v1/tenant/hr/attendance/manual
// @access  Private (Requires 'hr:attendance:manage' permission)
exports.createManualEntry = asyncHandler(async (req, res, next) => {
  const { Attendance } = req.models;
  const { employeeId, branchId, checkInTime, checkOutTime, notes } = req.body;

  if (!employeeId || !branchId || !checkInTime) {
    return res
      .status(400)
      .json({ success: false, error: "Employee, Branch, and Check-In Time are required." });
  }

  const newEntry = await Attendance.create({
    employeeId,
    branchId,
    checkInTime,
    checkOutTime: checkOutTime || null, // Allow checkout to be optional
    notes: `(Manual Entry) ${notes}`,
  });

  res.status(201).json({ success: true, data: newEntry });
});

// @desc    Clock in the current user
// @route   POST /api/v1/tenant/hr/attendance/clock-in
exports.clockIn = asyncHandler(async (req, res, next) => {
  const { Attendance, Employee } = req.models;
  const employee = await Employee.findOne({ userId: req.user.id });
  if (!employee)
    return res
      .status(400)
      .json({ success: false, error: "Only registered employees can clock in." });

  const existingSession = await Attendance.findOne({
    employeeId: employee._id,
    checkOutTime: null,
  });
  if (existingSession)
    return res.status(400).json({ success: false, error: "You are already clocked in." });

  const newSession = await Attendance.create({
    employeeId: employee._id,
    branchId: employee.branchId,
    checkInTime: new Date(),
  });
  res.status(201).json({ success: true, data: newSession });
});

// @desc    Clock out the current user
// @route   PATCH /api/v1/tenant/hr/attendance/clock-out
exports.clockOut = asyncHandler(async (req, res, next) => {
  const { Attendance, Employee } = req.models;
  const employee = await Employee.findOne({ userId: req.user.id });
  if (!employee)
    return res.status(400).json({ success: false, error: "Employee record not found." });

  const activeSession = await Attendance.findOne({ employeeId: employee._id, checkOutTime: null });
  if (!activeSession)
    return res.status(400).json({ success: false, error: "You are not currently clocked in." });

  activeSession.checkOutTime = new Date();
  await activeSession.save();
  res.status(200).json({ success: true, data: activeSession });
});

// @desc    Get a paginated timesheet for managers
// @route   GET /api/v1/tenant/hr/attendance/timesheet
exports.getTimesheet = asyncHandler(async (req, res, next) => {
  const { Attendance } = req.models;
  const { page = 1, limit = 25, branchId, employeeId, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  const filters = {};
  if (branchId) filters.branchId = new mongoose.Types.ObjectId(branchId);
  if (employeeId) filters.employeeId = new mongoose.Types.ObjectId(employeeId);
  if (startDate && endDate) {
    filters.checkInTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const [records, total] = await Promise.all([
    Attendance.find(filters)
      .populate("employeeId", "name")
      .populate("branchId", "name")
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Attendance.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit) },
    data: records,
  });
});

// @desc    Update an attendance record (for managers)
// @route   PUT /api/v1/tenant/hr/attendance/:id
exports.updateEntry = asyncHandler(async (req, res, next) => {
  const { Attendance } = req.models;
  const updatedEntry = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedEntry)
    return res.status(404).json({ success: false, error: "Attendance record not found." });
  res.status(200).json({ success: true, data: updatedEntry });
});

// @desc    Receive a punch from a hardware device
// @route   POST /api/v1/public/attendance/punch?vendor=zkteco
exports.receiveDevicePunch = asyncHandler(async (req, res, next) => {
  const { vendor } = req.query;
  const rawData = req.body;

  let parsedData;

  // The "Universal Adapter" logic
  switch (vendor) {
    case "zkteco":
      parsedData = attendanceParser.parseZKTecoData(rawData);
      break;
    // Add cases for other vendors here
    default:
      return res.status(400).json({ success: false, error: "Unsupported device vendor." });
  }

  // Now that data is standardized, process it.
  // Note: This needs a transaction, which is complex for a public webhook.
  // A robust solution would add this to a queue for processing.
  // For now, we'll process it directly.
  await attendanceService.processPunch(req.models, parsedData);

  res.status(200).json({ success: true, message: "Punch received." });
});
