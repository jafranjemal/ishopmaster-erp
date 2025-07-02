const asyncHandler = require("../../../middleware/asyncHandler");
const ErrorResponse = require("../../../utils/errorResponse");

/**
 * @desc    Get all employees with pagination, plus unassigned users for the form dropdown.
 * @route   GET /api/v1/tenant/hr/employees
 * @access  Private (Requires 'hr:employee:view' or 'hr:employee:manage' permission)
 */
exports.getAllEmployees = asyncHandler(async (req, res, next) => {
  const { Employee, User } = req.models;
  const { page = 1, limit = 25, search = "" } = req.query;
  const skip = (page - 1) * limit;

  // --- Find Unassigned Users ---
  // 1. Get all user IDs that are already linked to an employee record.
  const linkedUserIds = (await Employee.find({ userId: { $ne: null } }).select("userId")).map(
    (e) => e.userId
  );

  // 2. Find all users whose IDs are NOT in the linked list.
  const unassignedUsers = await User.find({ _id: { $nin: linkedUserIds } }).select("name email");

  // --- Find Employees with Search and Pagination ---
  const query = {};
  if (search) {
    // A robust search that looks at name, designation, and employeeId
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { designation: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } },
    ];
  }

  const [employees, total] = await Promise.all([
    Employee.find(query)
      .populate("branchId", "name")
      .populate("userId", "email")
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Employee.countDocuments(query),
  ]);

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

  const employee = await Employee.findById(employeeId)
    .populate("branchId", "name")
    .populate("userId", "email")
    .lean();

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

/**
 * @desc    Create a new employee
 * @route   POST /api/v1/tenant/hr/employees
 * @access  Private (Requires 'hr:employee:manage' permission)
 */
exports.createEmployee = asyncHandler(async (req, res, next) => {
  const { Employee } = req.models;
  const employeeData = req.body;

  // Ensure userId is set to null if an empty string is passed from the form
  if (employeeData.userId === "") {
    employeeData.userId = null;
  }

  const newEmployee = await Employee.create(employeeData);
  res.status(201).json({ success: true, data: newEmployee });
});

/**
 * @desc    Update an employee
 * @route   PUT /api/v1/tenant/hr/employees/:id
 * @access  Private (Requires 'hr:employee:manage' permission)
 */
exports.updateEmployee = asyncHandler(async (req, res, next) => {
  const { Employee } = req.models;
  const employeeData = req.body;

  if (employeeData.userId === "") {
    employeeData.userId = null;
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, employeeData, {
    new: true,
    runValidators: true,
  });

  if (!updatedEmployee) {
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
