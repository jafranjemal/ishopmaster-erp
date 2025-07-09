const employeeSchema = require("./employee.schema");
const attendanceSchema = require("./attendance.schema");
const leaveSchema = require("./leave.schema");
const commissionSchema = require("./commission.schema"); // <-- 1. IMPORT
const payslipSchema = require("./payslip.schema");
const payrollRoutes = require("./payroll.routes");
// const hrRoutes = require('./hr.routes'); // To be added later
const employeeRoutes = require("./employee.routes");
const attendanceRoutes = require("./attendance.routes");
const leaveRoutes = require("./leave.routes"); // <-- 1. IMPORT NEW ROUTES

/**
 * Manifest file for the Human Resources (HR) module.
 */
const express = require("express");
const payrollRunSchema = require("./payrollRun.schema");
const departmentSchema = require("./jobPosition/jobPosition.schema");
const jobPositionSchema = require("./department/department.schema");
const departmentRoutes = require("./department/department.routes"); // <-- 1. IMPORT
const jobPositionRoutes = require("./jobPosition/jobPosition.routes");
const deductionRuleSchema = require("./DeductionRule/deductionRule.schema");
const deductionRuleRoutes = require("./DeductionRule/deductionRule.routes");

const mainRouter = express.Router();

mainRouter.use("/employees", employeeRoutes);
mainRouter.use("/payroll", payrollRoutes);
mainRouter.use("/attendance", attendanceRoutes);
mainRouter.use("/leave", leaveRoutes);
mainRouter.use("/departments", departmentRoutes); // <-- 2. MOUNT
mainRouter.use("/job-positions", jobPositionRoutes); // <-- 2. MOUNT
mainRouter.use("/deduction-rules", deductionRuleRoutes);

// Other HR routes for attendance, leave will be added here later

module.exports = {
  schemas: {
    Employee: employeeSchema,
    Attendance: attendanceSchema,
    Leave: leaveSchema,
    Commission: commissionSchema, // <-- 2. ADD TO EXPORT
    Payslip: payslipSchema,
    PayrollRun: payrollRunSchema, // <-- 2. ADD TO EXPORT
    Department: departmentSchema, // <-- 2. ADD TO EXPORT
    JobPosition: jobPositionSchema, // <-- 2. ADD TO EXPORT
    DeductionRule: deductionRuleSchema,
  },
  router: mainRouter,
};
