const express = require("express");
const ctrl = require("./benefit.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("hr:benefits:manage"));

// Routes for managing the catalog of benefit types
router.route("/types").get(ctrl.getAllBenefitTypes).post(ctrl.createBenefitType);
router.route("/types/:id").put(ctrl.updateBenefitType).delete(ctrl.deleteBenefitType);

// Routes for managing benefits assigned to a specific employee
router
  .route("/assignments/employee/:employeeId")
  .get(ctrl.getBenefitsForEmployee)
  .post(ctrl.assignBenefitToEmployee);
router.route("/assignments/:id").delete(ctrl.deleteEmployeeBenefit);

module.exports = router;
