const asyncHandler = require("../../../middleware/asyncHandler");
const payrollService = require("../../../services/payroll.service");

// @desc    Run payroll for a specific date range
// @route   POST /api/v1/tenant/hr/payroll/run
// @access  Private (Requires 'hr:payroll:run' permission)
exports.runPayroll = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, error: "Start date and end date are required." });
  }

  const session = await req.dbConnection.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await payrollService.runPayrollForPeriod(
        req.models,
        {
          baseCurrency: req.tenant.settings.localization.baseCurrency,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          userId: req.user._id,
        },
        session,
        req.tenant
      );
    });
    res.status(200).json({ success: true, data: result });
  } finally {
    session.endSession();
  }
});

// ✅ NEW: Controller function to get the payroll history
// @desc    Get a paginated history of all payroll runs
// @route   GET /api/v1/tenant/hr/payroll/history
exports.getPayrollHistory = asyncHandler(async (req, res, next) => {
  const { PayrollRun } = req.models;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {}; // No filters for now, get all history

  const history = await PayrollRun.find(query)
    .sort({ runDate: -1 }) // Sort by most recent first
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await PayrollRun.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    count: history.length,
    pagination: { page, totalPages, total },
    data: history,
  });
});

// ✅ NEW: Controller function to get the full details of a single payroll run
// @desc    Get a single payroll run by its ID, with populated payslip and employee data.
// @route   GET /api/v1/tenant/hr/payroll/history/:id
exports.getPayrollRunDetails = asyncHandler(async (req, res, next) => {
  const { PayrollRun } = req.models;
  const { id } = req.params;

  // Find the payroll run and use .populate() to fetch the related data.
  // This is a nested populate: it first gets the payslips, and for each payslip,
  // it gets the associated employee's details.
  const payrollRun = await PayrollRun.findById(id)
    .populate({
      path: "payslips",
      populate: {
        path: "employeeId",
        model: "Employee", // Explicitly specify the model name
        select: "name employeeId designation branchId", // Select only the fields we need
      },
    })
    .lean();

  if (!payrollRun) {
    return res.status(404).json({ success: false, error: "Payroll run not found." });
  }

  res.status(200).json({ success: true, data: payrollRun });
});

// ✅ CORRECTED: Controller function to get the full details of a single payslip
// @desc    Get a single payslip by its ID, with populated employee and branch data.
// @route   GET /api/v1/tenant/hr/payroll/payslips/:id
exports.getPayslipDetails = asyncHandler(async (req, res, next) => {
  const { Payslip } = req.models;
  const { id } = req.params;

  const payslip = await Payslip.findById(id)
    .populate({
      path: "employeeId",
      // ✅ FIX: The `select` statement now matches your new employeeSchema.
      // It selects the top-level 'name' field instead of the old 'personalInfo'.
      select: "name designation branchId employeeId",
      populate: {
        path: "branchId",
        model: "Branch",
        select: "name",
      },
    })
    .lean();

  if (!payslip) {
    return res.status(404).json({ success: false, error: "Payslip not found." });
  }

  res.status(200).json({ success: true, data: payslip });
});

// ✅ NEW: Controller function to generate a multi-page PDF for an entire payroll run.
// @desc    Generate a single PDF containing all payslips for a run.
// @route   GET /api/v1/tenant/hr/payroll/history/:id/print
exports.printPayrollRun = asyncHandler(async (req, res, next) => {
  const { PayrollRun } = req.models;
  const { id } = req.params;

  const payrollRun = await PayrollRun.findById(id)
    .populate({
      path: "payslips",
      populate: {
        path: "employeeId",
        select: "name designation branchId",
        populate: { path: "branchId", select: "name" },
      },
    })
    .lean();

  if (!payrollRun) {
    return res.status(404).json({ success: false, error: "Payroll run not found." });
  }

  // In a real implementation, you would pass this data to a dedicated PDF generation service.
  // const pdfBuffer = await documentService.generatePayslipsPdf(payrollRun);

  // For now, we will send back a success message to confirm the workflow is connected.
  // In a future chapter, this will return a PDF file.
  // res.setHeader('Content-Type', 'application/pdf');
  // res.setHeader('Content-Disposition', `attachment; filename=Payroll-${payrollRun.runId}.pdf`);
  // res.send(pdfBuffer);

  res.status(200).json({
    success: true,
    message:
      "PDF generation endpoint is connected. PDF rendering will be implemented in the Document Engine chapter.",
    data: payrollRun, // Sending data back for now to show it works
  });
});
