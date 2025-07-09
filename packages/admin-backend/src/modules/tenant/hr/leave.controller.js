const asyncHandler = require("../../../middleware/asyncHandler");
const mongoose = require("mongoose");

// @desc    Get leave history (own for employees, all/filtered for managers)
// @route   GET /api/v1/tenant/hr/leave
exports.getLeaveHistory = asyncHandler(async (req, res, next) => {
  const { Leave, Employee } = req.models;
  const { page = 1, limit = 25, employeeId, status } = req.query;
  const skip = (page - 1) * limit;

  const filters = {};

  // If the user is not a manager, they can only see their own leave.
  if (!req.user.role.permissions.includes("hr:leave:manage")) {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) return res.status(200).json({ success: true, data: [] }); // Not an employee, no leave
    filters.employeeId = employee._id;
  } else if (employeeId) {
    // A manager can filter by a specific employee
    filters.employeeId = new mongoose.Types.ObjectId(employeeId);
  }

  if (status) filters.status = status;

  const [records, total] = await Promise.all([
    Leave.find(filters)
      .populate("employeeId", "name")
      .populate("approvedBy", "name")
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Leave.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    total,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit) },
    data: records,
  });
});

// @desc    Submit a new leave request (by an employee)
// @route   POST /api/v1/tenant/hr/leave/request
// @desc    Submit a new leave request (handles both self-service and manager-initiated)
// @route   POST /api/v1/tenant/hr/leave/reques

exports.requestLeave = asyncHandler(async (req, res, next) => {
  const { Leave, Employee } = req.models;
  const { leaveType, startDate, endDate, reason, employeeId } = req.body; // `employeeId` is now accepted

  let targetEmployeeId;

  if (employeeId) {
    // --- MANAGER WORKFLOW ---
    // An employeeId was provided, so a manager is submitting on someone's behalf.
    // First, check if the logged-in user has permission to do this.
    if (!req.user.role.permissions.includes("hr:leave:manage")) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to submit leave for other employees.",
      });
    }
    // Check if the target employee exists
    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists) {
      return res.status(404).json({ success: false, error: "Target employee not found." });
    }
    targetEmployeeId = employeeId;
  } else {
    // --- SELF-SERVICE WORKFLOW ---
    // No employeeId provided, so this is a self-service request.
    // Find the employee record linked to the logged-in user.
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(400).json({
        success: false,
        error:
          "Your user account is not linked to an employee record. Only employees can request leave.",
      });
    }
    targetEmployeeId = employee._id;
  }

  // Create the leave request for the determined employee
  const newLeaveRequest = await Leave.create({
    employeeId: targetEmployeeId,
    leaveType,
    startDate,
    endDate,
    reason,
    status: "pending", // All new requests start as pending
  });

  res.status(201).json({ success: true, data: newLeaveRequest });
});
// @desc    Approve or reject a leave request (by a manager)
// @route   PATCH /api/v1/tenant/hr/leave/:id/status
exports.updateLeaveStatus = asyncHandler(async (req, res, next) => {
  const { Leave } = req.models;
  const { status } = req.body;
  const leaveId = req.params.id;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status provided." });
  }

  const leaveRequest = await Leave.findById(leaveId);
  if (!leaveRequest)
    return res.status(404).json({ success: false, error: "Leave request not found." });

  leaveRequest.status = status;
  leaveRequest.approvedBy = req.user._id;
  await leaveRequest.save();

  res.status(200).json({ success: true, data: leaveRequest });
});
