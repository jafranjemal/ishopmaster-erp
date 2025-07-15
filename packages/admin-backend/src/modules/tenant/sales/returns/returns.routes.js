const express = require("express");
const ctrl = require("./returns.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("sales:return:manage"));
router.route("/").post(ctrl.createReturn);
module.exports = router;
