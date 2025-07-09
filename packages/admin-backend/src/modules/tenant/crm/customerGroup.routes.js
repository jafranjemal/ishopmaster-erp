const express = require("express");
const ctrl = require("./customerGroup.controller");
const { protect, authorize } = require("../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("crm:customer_group:manage"));

router.route("/").get(ctrl.getAllCustomerGroups).post(ctrl.createCustomerGroup);
router.route("/:id").put(ctrl.updateCustomerGroup).delete(ctrl.deleteCustomerGroup);

module.exports = router;
