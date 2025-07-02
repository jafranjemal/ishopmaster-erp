const express = require("express");
const {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
} = require("./employee.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file are protected and require a user with HR management permissions
router.use(protect, authorize("hr:employee:manage"));

router.route("/").get(getAllEmployees).post(createEmployee);

router.route("/:id").get(getEmployeeById).put(updateEmployee).delete(deleteEmployee);

module.exports = router;
