const express = require("express");
const ctrl = require("./department.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("hr:employee:manage"));
router.route("/").get(ctrl.getAllDepartments).post(ctrl.createDepartment);
router.route("/:id").put(ctrl.updateDepartment).delete(ctrl.deleteDepartment);

module.exports = router;
