const express = require("express");
const {
  createPlan,
  getPlanById,
  applyPaymentToInstallmentLine,
  getPlansForCustomer,
} = require("./installment.controller");
const {
  protect,
  authorize,
} = require("../../../../middleware/auth.middleware");

const router = express.Router();

// All routes in this file require a user to be authenticated.
router.use(protect);

// For now, we'll use a general sales permission. This can be made more granular.
router.use(authorize("sales:pos:access"));

router
  .route("/")
  .get(authorize("sales:pos:access"), (req, res, next) => {
    if (req.query.customerId) {
      return getPlansForCustomer(req, res, next);
    }

    // A general getAll endpoint could be here too if needed
    res.status(404).json({ success: false, error: "Not implemented" });
  })
  .post(createPlan);

router.route("/:id").get(getPlanById);

// Special action route for paying a specific installment
router.post("/:planId/lines/:lineId/pay", applyPaymentToInstallmentLine);

module.exports = router;
