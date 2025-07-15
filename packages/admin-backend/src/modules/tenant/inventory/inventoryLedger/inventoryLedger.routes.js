const express = require("express");
const ctrl = require("./inventoryLedger.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();
router.use(protect, authorize("inventory:stock:view"));
router.route("/").get(ctrl.getLedgerHistory);
module.exports = router;
