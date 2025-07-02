const express = require("express");
const {
  runPayroll,
  getPayrollHistory,
  getPayrollRunDetails,
  getPayslipDetails,
  printPayrollRun,
} = require("./payroll.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();

// Protect this route with a specific high-level permission
router.use(protect, authorize("hr:payroll:run"));

router.post("/run", runPayroll);
router.get("/history", authorize("hr:payroll:view"), getPayrollHistory);
router.get("/history/:id", authorize("hr:payroll:view"), getPayrollRunDetails);
router.get("/payslips/:id", authorize("hr:payslip:view"), getPayslipDetails);
router.get("/history/:id/print", authorize("hr:payroll:print"), printPayrollRun);
module.exports = router;
