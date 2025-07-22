const asyncHandler = require("../../../middleware/asyncHandler");
const ErrorResponse = require("../../../utils/errorResponse");
const mongoose = require("mongoose");
// @desc    Get all employees with pagination, search, plus unassigned users for the form dropdown.
// @route   GET /api/v1/tenant/hr/employees
exports.getAllEmployees = asyncHandler(async (req, res, next) => {
  const { Employee, User } = req.models;
  const { page = 1, limit = 25, search = "" } = req.query;
  const skip = (page - 1) * limit;

  // --- Your excellent logic for finding unassigned users remains the same ---
  const linkedUserIds = (await Employee.find({ userId: { $ne: null } }).select("userId")).map((e) => e.userId);
  const unassignedUsers = await User.find({ _id: { $nin: linkedUserIds } }).select("name email");

  // --- THE DEFINITIVE FIX: Using an Aggregation Pipeline for Robust Search ---
  const searchMatchStage = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { employeeId: { $regex: search, $options: "i" } },
          // We can now search by the populated job title text
          { "jobPosition.title": { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const aggregationPipeline = [
    // 1. Lookup related documents first
    {
      $lookup: {
        from: "jobpositions",
        localField: "jobPositionId",
        foreignField: "_id",
        as: "jobPosition",
      },
    },
    { $lookup: { from: "branches", localField: "branchId", foreignField: "_id", as: "branch" } },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    // Use $unwind to deconstruct the array from the lookup
    { $unwind: { path: "$jobPosition", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    // 2. Now apply the search filter on the populated fields
    { $match: searchMatchStage },
  ];

  // 3. Execute queries in parallel: one for the paginated data, one for the total count
  const [employees, totalResult] = await Promise.all([
    Employee.aggregate([
      ...aggregationPipeline,
      { $sort: { firstName: 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      // 4. Project the final shape
      {
        $project: {
          employeeId: 1,
          firstName: 1,
          lastName: 1,
          contactInfo: 1,
          isActive: 1,
          createdAt: 1,
          branchId: { _id: "$branch._id", name: "$branch.name" },
          userId: { _id: "$user._id", email: "$user.email" },
          jobPositionId: { _id: "$jobPosition._id", title: "$jobPosition.title" },
        },
      },
    ]),
    Employee.aggregate([...aggregationPipeline, { $count: "total" }]),
  ]);

  const total = totalResult[0]?.total || 0;
  console.log(employees);
  res.status(200).json({
    success: true,
    count: employees.length,
    pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), total },
    data: {
      employees,
      unassignedUsers,
    },
  });
});

/**
 * @desc    Get a single employee by ID with all related history.
 * @route   GET /api/v1/tenant/hr/employees/:id
 * @access  Private
 */
exports.getEmployeeById = asyncHandler(async (req, res, next) => {
  const { Employee, Attendance, Leave, Payslip, Commission } = req.models;
  const employeeId = req.params.id;

  const employee = await Employee.findById(employeeId).populate("branchId", "name").populate("userId", "email").lean();

  if (!employee) {
    return next(new ErrorResponse("Employee not found.", 404, "NOT_FOUND"));
  }

  // Fetch all related historical data in parallel for maximum performance
  const [attendanceHistory, leaveHistory, payslipHistory, commissionHistory] = await Promise.all([
    Attendance.find({ employeeId }).sort({ checkInTime: -1 }).limit(100).lean(),
    Leave.find({ employeeId }).sort({ startDate: -1 }).limit(100).lean(),
    Payslip.find({ employeeId }).sort({ "payPeriod.endDate": -1 }).limit(100).lean(),
    Commission.find({ employeeId }).sort({ saleDate: -1 }).limit(100).lean(),
  ]);

  // Attach the historical data to the main employee object
  employee.history = {
    attendance: attendanceHistory,
    leave: leaveHistory,
    payslips: payslipHistory,
    commissions: commissionHistory,
  };

  res.status(200).json({ success: true, data: employee });
});

exports.createEmployee = asyncHandler(async (req, res, next) => {
  const { Employee, User } = req.models;
  const employeeData = req.body;

  if (employeeData.userId === "") {
    employeeData.userId = null;
  }
  if (employeeData.reportsTo === "") {
    employeeData.reportsTo = null;
  }

  // --- THE DEFINITIVE FIX: DATA INTEGRITY CHECK ---
  if (employeeData.userId) {
    const existingEmployeeLink = await Employee.findOne({ userId: employeeData.userId });
    if (existingEmployeeLink) {
      return res.status(400).json({
        success: false,
        error: `This user account is already linked to another employee (${existingEmployeeLink.name}).`,
      });
    }
  }
  // --- END OF FIX ---

  const newEmployee = await Employee.create(employeeData);
  res.status(201).json({ success: true, data: newEmployee });
});

exports.updateEmployee = asyncHandler(async (req, res, next) => {
  const { Employee } = req.models;
  const employeeData = req.body;
  const employeeId = req.params.id;

  if (employeeData.userId === "") {
    employeeData.userId = null;
  }

  // --- THE DEFINITIVE FIX: DATA INTEGRITY CHECK ---
  if (employeeData.userId) {
    // Check if another employee (not the one we are currently editing) is already using this userId
    const existingEmployeeLink = await Employee.findOne({
      userId: employeeData.userId,
      _id: { $ne: employeeId }, // Exclude the current employee from the check
    });
    if (existingEmployeeLink) {
      return res.status(400).json({
        success: false,
        error: `This user account is already linked to another employee (${existingEmployeeLink.name}).`,
      });
    }
  }
  // --- END OF FIX ---

  const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, employeeData, {
    new: true,
    runValidators: true,
  });

  if (!updatedEmployee) {
    // Assuming ErrorResponse is a custom utility we have.
    return next(new ErrorResponse("Employee not found.", 404, "NOT_FOUND"));
  }
  res.status(200).json({ success: true, data: updatedEmployee });
});

/**
 * @desc    Delete an employee
 * @route   DELETE /api/v1/tenant/hr/employees/:id
 * @access  Private (Requires 'hr:employee:manage' permission)
 */
exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const { Employee, Attendance, Payslip } = req.models;
  const employeeId = req.params.id;

  // --- Professional Integrity Check ---
  // Before deleting, ensure this employee has no dependent records.
  const payslipCount = await Payslip.countDocuments({ employeeId });
  if (payslipCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete. Employee has ${payslipCount} historical payslip(s). Please deactivate the employee instead.`,
        400,
        "HAS_DEPENDENTS"
      )
    );
  }

  const attendanceCount = await Attendance.countDocuments({ employeeId });
  if (attendanceCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete. Employee has ${attendanceCount} attendance records. Please deactivate the employee instead.`,
        400,
        "HAS_DEPENDENTS"
      )
    );
  }

  const employee = await Employee.findByIdAndDelete(employeeId);
  if (!employee) {
    return next(new ErrorResponse("Employee not found.", 404, "NOT_FOUND"));
  }

  res.status(200).json({ success: true, data: {} });
});
