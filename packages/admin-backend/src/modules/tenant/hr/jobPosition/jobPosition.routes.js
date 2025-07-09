const express = require("express");
const ctrl = require("./jobPosition.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("hr:employee:manage"));
router.route("/").get(ctrl.getAllJobPositions).post(ctrl.createJobPosition);
// ... routes for update and delete ...

module.exports = router;
