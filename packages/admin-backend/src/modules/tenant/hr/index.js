const employeeSchema = require("./employee.schema");
const attendanceSchema = require("./attendance.schema");
const leaveSchema = require("./leave.schema");
const commissionSchema = require("./commission.schema"); // <-- 1. IMPORT
const payslipSchema = require("./payslip.schema");
const payrollRoutes = require("./payroll.routes");
// const hrRoutes = require('./hr.routes'); // To be added later
const employeeRoutes = require("./employee.routes");
/**
 * Manifest file for the Human Resources (HR) module.
 */
const express = require("express");
const payrollRunSchema = require("./payrollRun.schema");
const mainRouter = express.Router();

mainRouter.use("/employees", employeeRoutes);
mainRouter.use("/payroll", payrollRoutes);
// Other HR routes for attendance, leave will be added here later

module.exports = {
  schemas: {
    Employee: employeeSchema,
    Attendance: attendanceSchema,
    Leave: leaveSchema,
    Commission: commissionSchema, // <-- 2. ADD TO EXPORT
    Payslip: payslipSchema,
    PayrollRun: payrollRunSchema, // <-- 2. ADD TO EXPORT
  },
  router: mainRouter,
};
