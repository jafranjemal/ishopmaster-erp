const express = require("express");
const ctrl = require("./salesOrder.controller");
const { protect, authorize } = require("../../../../middleware/auth.middleware");
const router = express.Router();

router.use(protect, authorize("sales:order:manage"));

router.post("/from-quote/:quoteId", ctrl.createOrderFromQuote);
// Special action route for creating an order from a won opportunity
router.post(
  "/from-opportunity/:opportunityId",
  authorize("sales:order:manage"),
  ctrl.createOrderFromOpportunity
);

// Standard CRUD routes for Sales Orders
// router.route('/').get(ctrl.getAllSalesOrders);
// router.route('/:id').get(ctrl.getSalesOrderById);

module.exports = router;
