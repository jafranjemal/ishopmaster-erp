const asyncHandler = require("../../../middleware/asyncHandler");
const shiftService = require("../../../services/shift.service");

// @desc    Get the current user's active (open) shift
// @route   GET /api/v1/tenant/sales/shifts/active
exports.getActiveShift = asyncHandler(async (req, res, next) => {
  const { ShiftSummary, Employee } = req.models;
  const employee = await Employee.findOne({ userId: req.user.id });
  if (!employee) {
    return res.status(200).json({ success: true, data: null });
  }
  const activeShift = await ShiftSummary.findOne({ userId: req.user.id, status: "open" });
  res.status(200).json({ success: true, data: activeShift });
});

// @desc    Open a new shift for the current user (handles both employees and admins)
// @route   POST /api/v1/tenant/sales/shifts/open
exports.openShift = asyncHandler(async (req, res, next) => {
  const { openingFloat, branchId } = req.body; // Admin can provide a branchId
  const { Employee } = req.models;
  const user = req.user;

  let targetBranchId;
  let targetEmployeeId = null;

  // --- THE DEFINITIVE FIX: ROLE-AWARE LOGIC ---
  const isSuperAdmin = user.role?.name === "Super Admin"; // Or check for a specific permission

  if (isSuperAdmin) {
    // Admin Workflow: They must specify which branch they are opening a shift for.
    if (!branchId) {
      // return res
      //   .status(400)
      //   .json({ success: false, error: "Branch ID is required for an administrative session." });
    }
    targetBranchId = branchId || user.assignedBranchId;
    // employeeId remains null for an admin session
  } else {
    // Employee Workflow: Fetch the employee record to get their assigned branch.
    const employee = await Employee.findOne({ userId: user._id });
    if (!employee) {
      return res
        .status(403)
        .json({ success: false, error: "Only registered employees or admins can start a shift." });
    }
    if (!employee.branchId) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot start shift: You are not assigned to a branch." });
    }
    targetBranchId = employee.branchId;
    targetEmployeeId = employee._id;
  }
  // --- END OF FIX ---

  const newShift = await shiftService.openShift(req.models, {
    userId: user._id,
    employeeId: targetEmployeeId,
    branchId: targetBranchId,
    openingFloat,
  });

  res.status(201).json({ success: true, data: newShift });
});

exports.closeShift = asyncHandler(async (req, res, next) => {
  const { closingFloat } = req.body;
  console.log(req.body);
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
