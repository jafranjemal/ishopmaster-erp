const express = require("express")
const ctrl = require("./returns.controller")
const { protect, authorize } = require("../../../../middleware/auth.middleware")
const router = express.Router()

router.use(protect, authorize("sales:return:manage"))
//router.route("/").post(ctrl.createReturn);

router.route("/").post(ctrl.processReturn)

// Add routes for GET, etc. here in the future
router.route("/").get(ctrl.getAllReturns)
router.route("/:id").get(ctrl.getReturnById)

module.exports = router
